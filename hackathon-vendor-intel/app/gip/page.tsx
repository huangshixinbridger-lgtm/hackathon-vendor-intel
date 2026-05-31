// app/gip/page.tsx —— 占位页（黄士鑫搭，等 白思宇 接管）
// 白思宇：这是你的目录。请只在 app/gip/ 下建文件，对着 lib/mock.ts 的 GIPRecord 开发，
// 风格沿用本页与 app/layout.tsx。详见仓库根 CLAUDE.md / AGENTS.md。
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GipPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">③ GIP 数据面板</h1>
          <p className="text-muted-foreground">分时段/游戏/品类/厂商看预算与消耗，可下钻活动明细</p>
        </div>
        <Badge variant="accent">负责人：白思宇</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>占位页 · 待实现</CardTitle>
          <CardDescription>
            白思宇 在分支 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">feat/gip</code> 上开发本模块。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          数据契约：<code className="rounded bg-muted px-1.5 py-0.5 text-xs">GIPRecord</code>（见 types/contract.ts）。
          API 先返回 lib/mock.ts 的 mock，再接真实数据源。
        </CardContent>
      </Card>
    </div>
  );
}
