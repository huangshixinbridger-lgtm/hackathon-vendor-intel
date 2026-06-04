// app/content-radar/page.tsx —— 内容雷达详情页（Jeff 负责，纯增量模块）
// 只在 app/content-radar/ 下建文件，对着 contract.contentRadar.ts + mock.contentRadar.ts 开发。
// 风格沿用 app/radar/page.tsx 与 app/layout.tsx。详见仓库根 CLAUDE.md / AGENTS.md。
// Mock 优先：先吃 mock 跑通；真实数据由 fetch_videos.py 抓取 + AI 分析后替换。
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockContentRadar } from "@/lib/mock.contentRadar";

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
  const gameId = searchParams.gameId ?? "g-1001";
  const data = mockContentRadar[gameId];

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">内容雷达</h1>
        <Card>
          <CardHeader>
            <CardTitle>暂无该游戏的内容分析</CardTitle>
            <CardDescription>
              gameId=<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{gameId}</code> 尚未收录。试试{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">?gameId=g-1001</code>
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

      {/* 功能2：内容类型气泡（Apple Music 曲风气泡风格，大小 ∝ vv 占比） */}
      <Card>
        <CardHeader>
          <CardTitle>内容类型速览</CardTitle>
          <CardDescription>气泡越大 = 该类型播放占比越高；红框 = 内容缺口（可下 brief 补）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 py-2">
            {data.contentTypes.map((t) => {
              const size = 64 + t.vvShare * 160; // 64–224px
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

      {/* 功能1：top 视频「为什么火」 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Top 内容 · 为什么火</h2>
        {data.topVideos.map((v) => (
          <Card key={v.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{v.author}</CardTitle>
                <div className="flex shrink-0 gap-2 text-xs text-muted-foreground">
                  <Badge variant="accent">{fmt(v.vv)} 播放</Badge>
                  <Badge>{fmt(v.likes)} 赞</Badge>
                </div>
              </div>
              <CardDescription className="line-clamp-2">{v.caption}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">💡 {v.whyViral.oneLine}</p>
              <ul className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                <li>🎣 钩子：{v.whyViral.hook}</li>
                <li>🎭 梗/玩法：{v.whyViral.meme}</li>
                <li>🎵 音乐：{v.whyViral.music}</li>
                <li>⚡ 节奏：{v.whyViral.pacing}</li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
