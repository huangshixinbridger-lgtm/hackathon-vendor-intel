// app/content-radar/page.tsx —— 内容雷达详情页（Jeff 负责，纯增量模块）
// 只在 app/content-radar/ 下建文件，对着 contract.contentRadar.ts 开发。
// 风格沿用 app/layout.tsx 与 shadcn（components/ui）。详见仓库根 CLAUDE.md。
// 数据：hero 游戏 Free Fire 用真实数据（真实 VV + 官方 embed），g-1001 用 mock 走端到端动线。
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContentRadarDetail } from "@/types/contract.contentRadar";
import { mockContentRadar } from "@/lib/mock.contentRadar";
import { freeFireRadar } from "@/lib/data.freefire";

const REGISTRY: Record<string, ContentRadarDetail> = {
  freefire: freeFireRadar,
  ...mockContentRadar,
};

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function ContentRadarPage({
  searchParams,
}: {
  searchParams: { gameId?: string };
}) {
  const gameId = searchParams.gameId ?? "freefire";
  const data = REGISTRY[gameId];

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">内容雷达</h1>
        <Card>
          <CardHeader>
            <CardTitle>暂无该游戏的内容分析</CardTitle>
            <CardDescription>
              试试 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">?gameId=freefire</code>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">内容雷达 · {data.gameName}</h1>
          <p className="text-muted-foreground">
            这游戏在 TikTok 靠什么内容活着 —— top 内容「为什么火」 + 内容类型分布
          </p>
        </div>
        <Badge variant="accent">负责人：Jeff</Badge>
      </div>

      {/* 功能2：内容类型气泡（大小 ∝ vv 占比） */}
      {data.contentTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>内容类型速览</CardTitle>
            <CardDescription>气泡越大 = 播放占比越高；红框 = 内容缺口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 py-2">
              {data.contentTypes.map((t) => {
                const size = 64 + t.vvShare * 160;
                return (
                  <div
                    key={t.tag}
                    title={`${(t.vvShare * 100).toFixed(0)}% · ${t.videoCount}条 · ${t.note}`}
                    className={`flex flex-col items-center justify-center rounded-full text-center ${
                      t.isGap ? "border-2 border-destructive bg-destructive/10" : "bg-accent/15"
                    }`}
                    style={{ width: size, height: size }}
                  >
                    <span className="px-2 text-xs font-medium leading-tight">{t.tag}</span>
                    <span className="text-[11px] text-muted-foreground">{(t.vvShare * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 功能1：top 视频「为什么火」（真实 embed + AI 分析） */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Top 内容 · 为什么火</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.topVideos.map((v, i) => {
            const embedId = /^\d{10,}$/.test(v.id) ? v.id : null;
            return (
              <Card key={v.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">#{i + 1} {v.author || "TikTok 创作者"}</CardTitle>
                    <div className="flex shrink-0 gap-2">
                      <Badge variant="accent">{fmt(v.vv)} 播放</Badge>
                      {v.likes > 0 && <Badge>{fmt(v.likes)} 赞</Badge>}
                    </div>
                  </div>
                  {v.caption && <CardDescription className="line-clamp-2">{v.caption}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {embedId && (
                      <iframe
                        src={`https://www.tiktok.com/embed/v2/${embedId}`}
                        className="h-[480px] w-full shrink-0 rounded-lg border sm:w-[280px]"
                        allow="encrypted-media"
                        title={`tiktok-${embedId}`}
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">💡 {v.whyViral.oneLine}</p>
                      {v.whyViral.hook && (
                        <ul className="grid gap-1 text-muted-foreground">
                          <li>🎣 钩子：{v.whyViral.hook}</li>
                          <li>🎭 梗/玩法：{v.whyViral.meme}</li>
                          <li>🎵 音乐：{v.whyViral.music}</li>
                          <li>⚡ 节奏：{v.whyViral.pacing}</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
