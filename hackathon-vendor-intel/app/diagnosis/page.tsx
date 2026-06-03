// app/diagnosis/page.tsx —— 占位页（黄士鑫搭，等 Rena 接管）
// Rena：这是你的目录。请只在 app/diagnosis/ 下建文件，对着 lib/mock.ts 的 DiagnosisReport 开发，
// 风格沿用本页与 app/layout.tsx。详见仓库根 CLAUDE.md / AGENTS.md。
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DiagnosisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">② 平台诊断报告</h1>
          <p className="text-muted-foreground">平台 + 竞品对比 + 推荐营销动作</p>
        </div>
        <Badge variant="accent">负责人：Rena</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>占位页 · 待实现</CardTitle>
          <CardDescription>
            Rena 在分支 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">feat/diagnosis</code> 上开发本模块。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          数据契约：<code className="rounded bg-muted px-1.5 py-0.5 text-xs">DiagnosisReport</code>（见 types/contract.ts）。
          API 先返回 lib/mock.ts 的 mock，再接真实数据源。
        </CardContent>
      </Card>
    </div>
  );
}
