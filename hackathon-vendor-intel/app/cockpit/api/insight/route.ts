// app/cockpit/api/insight/route.ts —— 内容洞察「AI 实时分析」端点。
// 取该游戏内容雷达真实数据(topVideos caption/whyViral + contentTypes) → 喂 LLM 生成 4 段洞察。
// 没配 LLM key / 调用失败 → 回退到策展洞察(resolveInsight)，保证永远有返回。
import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { resolveContent } from "../../content-registry";
import { resolveInsight, type ContentInsight } from "../../content-insights";

export const runtime = "nodejs";

// 内存缓存：同一游戏不重复打 LLM（dev/单实例内有效）。
const cache = new Map<string, ContentInsight>();

const SYSTEM =
  "你是 TikTok 游戏内容策略分析师。基于给定的某游戏在 TikTok 的真实热门视频与内容类型数据，" +
  "输出对运营/达人营销有用的洞察。只输出 JSON，不要任何额外文字或 markdown 代码块，格式：" +
  '{"summary":"2-3句总览：这是什么游戏+它在TikTok的内容生态定位","traits":"内容特点","memes":"热门梗/热点/玩法","playbook":"达人营销怎么做"}。' +
  "全部用简体中文，每个字段 1-3 句、具体可执行，不要编造精确统计数字。";

function buildPrompt(detail: NonNullable<ReturnType<typeof resolveContent>>): string {
  const vids = detail.topVideos
    .slice(0, 10)
    .map((v, i) => `${i + 1}. @${v.author}｜${v.caption}｜为什么火: ${v.whyViral?.oneLine ?? ""}｜BGM: ${v.music ?? ""}`)
    .join("\n");
  const types = detail.contentTypes
    .map((t) => `${t.tag}(${Math.round(t.vvShare * 100)}%${t.isGap ? "·缺口" : ""}): ${t.note}`)
    .join("\n");
  return `游戏：${detail.gameName}\n\n【Top 热门视频】\n${vids}\n\n【内容类型分布】\n${types}\n\n请基于以上真实数据给出洞察 JSON。`;
}

function parseInsight(raw: string, gameId: string): ContentInsight | null {
  try {
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start < 0 || end < 0) return null;
    const obj = JSON.parse(jsonStr.slice(start, end + 1));
    if (!obj.summary || !obj.traits || !obj.memes || !obj.playbook) return null;
    return {
      gameId,
      summary: String(obj.summary),
      traits: String(obj.traits),
      memes: String(obj.memes),
      playbook: String(obj.playbook),
      source: "ai",
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const gameId = new URL(req.url).searchParams.get("gameId")?.trim() ?? "";
  const detail = resolveContent(gameId);
  const curated = resolveInsight(gameId);

  if (!detail) {
    return NextResponse.json({ insight: curated }); // 无内容数据：返回策展(可能为 null)
  }
  if (cache.has(gameId)) {
    return NextResponse.json({ insight: cache.get(gameId) });
  }

  try {
    const raw = await callLLM(buildPrompt(detail), { system: SYSTEM, temperature: 0.6, maxTokens: 900 });
    const ai = raw.startsWith("「LLM 占位返回」") ? null : parseInsight(raw, gameId);
    const insight = ai ?? curated;
    if (ai) cache.set(gameId, ai); // 只缓存真实 AI 结果
    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json({ insight: curated });
  }
}
