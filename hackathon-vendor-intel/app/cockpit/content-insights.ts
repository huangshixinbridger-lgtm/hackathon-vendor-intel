// app/cockpit/content-insights.ts —— 内容洞察「总结性洞察」模块的数据（呈现层）。
// 4 个维度：这是什么游戏 / TikTok 内容特点 / 热门梗·热点·玩法 / 达人营销怎么做。
// 当前为人工策展的定性洞察（针对有内容雷达数据的游戏，基于其真实 caption / 内容类型归纳，
// 不含编造的统计数字）。预留 source 字段：接入真实 LLM(lib/llm.ts)或抓取 API 后可改为动态生成。

export type ContentInsight = {
  gameId: string;
  summary: string; // 2–3 句总览
  traits: string; // 内容特点
  memes: string; // 热门梗 / 热点 / 玩法
  playbook: string; // 达人营销怎么做
  source: "curated" | "ai";
};

const INSIGHTS: ContentInsight[] = [
  {
    gameId: "freefire",
    summary:
      "Garena 的轻量化吃鸡手游，主战场在巴西、印尼及东南亚的中低端机用户。TikTok 上是典型的「高频、强本地化、梗驱动」内容生态，官方节点与海量本地达人二创高度交织。",
    traits:
      "爆款集中在操作高光、剧情反转短剧、名场面集锦；单条时长短、节奏快、强 BGM 卡点。官方赛事/版本节点贡献话题量，但互动率往往低于本地达人自来水内容。",
    memes:
      "巴西嘉年华联动皮肤、「盲目 rush 翻车」、外卖小哥/反差人设逆袭电竞、角色挑战赛；直播切片 + 任务挑战是稳定流量来源。",
    playbook:
      "优先 BR/ID/MX 的中腰部本地达人，走「操作秀 + 反差剧情」模板；绑定 OB 版本/联动节点做集中投放，用挑战赛 hashtag 放大 UGC，避免只靠官方硬广。",
    source: "curated",
  },
  {
    gameId: "mlbb",
    summary:
      "Moonton 的东南亚国民级 MOBA，TikTok 内容常青、社区粘性高，以英雄连招、排位高光与赛事(MPL)文化为核心。",
    traits:
      "操作教学/连招 combo、五杀名场面、英雄皮肤展示、赛事切片为主；搞笑配音与段子化解说占比高，受众覆盖核心玩家到泛娱乐用户。",
    memes:
      "新英雄/新皮肤上线即热点、MPL 战队梗、「carry vs 演员」对线名场面、角色 cosplay。",
    playbook:
      "电竞达人 + 教学型达人双轨；围绕赛季更新和 MPL 赛程排内容日历，皮肤联动交给美术/cosplay 向达人，节点期集中放量。",
    source: "curated",
  },
  {
    gameId: "roblox",
    summary:
      "Roblox 是 UGC 平台而非单一游戏，TikTok 上是「玩法发现 + 二创」的超级入口，内容极度碎片化、长尾，受众以低龄与青少年为主。",
    traits:
      "热门子游戏(obby、模拟器、恐怖逃脱)的实况与攻略、avatar 穿搭、「if you see X run」悬念钩子；单个爆款子游戏能在短期内带起一波模仿潮。",
    memes:
      "爆款子游戏带动的模仿挑战、avatar 时尚、jumpscare 反应视频、「Roblox but…」规则改造。",
    playbook:
      "与子游戏开发者联动做首发流量；达人侧重「玩法揭秘 + 反应」模板，穿搭/avatar 交给时尚类达人，用悬念钩子提高完播。",
    source: "curated",
  },
  {
    gameId: "minecraft",
    summary:
      "沙盒常青标杆，TikTok 上靠版本更新与无限二创持续回潮，内容跨年龄、跨品类，长尾极强。",
    traits:
      "建筑教程/红石机械、生存挑战、「我的世界但是…」规则改造、模组展示、像素动画二创；satisfying build 卡点视频流量稳定。",
    memes:
      "新版本生物/物品玩梗、speedrun、hardcore 翻车、像素动画剧情，以及音乐情怀向内容。",
    playbook:
      "绑定版本更新窗口做建筑/玩法首发；达人走「教程 + 挑战 + 动画」组合，satisfying 建造适合短平快投放，模组内容吸硬核圈层。",
    source: "curated",
  },
];

export const CONTENT_INSIGHTS: Record<string, ContentInsight> = Object.fromEntries(
  INSIGHTS.map((i) => [i.gameId, i])
);

export function resolveInsight(gameId?: string): ContentInsight | null {
  if (!gameId) return null;
  return CONTENT_INSIGHTS[gameId] ?? null;
}
