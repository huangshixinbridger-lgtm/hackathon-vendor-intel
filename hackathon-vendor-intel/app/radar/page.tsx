// app/radar/page.tsx —— 占位页（黄士鑫搭，等 Gardner 接管）
// Gardner：这是你的目录。请只在 app/radar/ 下建文件，对着 lib/mock.ts 的 GameMove 开发，
// 风格沿用本页与 app/layout.tsx。详见仓库根 CLAUDE.md / AGENTS.md。
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RadarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">① 情报雷达</h1>
          <p className="text-muted-foreground">最近有动作的游戏：新游 / 版本更新 / 大动作</p>
        </div>
        <Badge variant="accent">负责人：Gardner</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>占位页 · 待实现</CardTitle>
          <CardDescription>
            Gardner 在分支 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">feat/radar</code> 上开发本模块。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          数据契约：<code className="rounded bg-muted px-1.5 py-0.5 text-xs">GameMove</code>（见 types/contract.ts）。
          API 先返回 lib/mock.ts 的 mock，再接真实数据源。
        </CardContent>
      </Card>
    </div>
  );
}
