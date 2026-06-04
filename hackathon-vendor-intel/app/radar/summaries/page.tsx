import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailySummaries } from "../database";

export default function RadarSummariesPage() {
  const summaries = getDailySummaries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/radar"
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回情报雷达
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">历史摘要</h1>
          <p className="text-muted-foreground">按日期查看所有游戏厂商/游戏项目动态摘要。</p>
        </div>
        <Badge variant="outline">{summaries.length} 天</Badge>
      </div>

      <div className="space-y-4">
        {summaries.map((summary) => (
          <Card key={summary.date}>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{summary.date}</CardTitle>
                <CardDescription>
                  共 {summary.total} 条摘要，高重要度 {summary.highImportanceCount} 条
                </CardDescription>
              </div>
              <Link
                href={`/radar?window=all&q=${encodeURIComponent(summary.date)}`}
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看当天情报
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-md border">
                {summary.items.map((item) => (
                  <div key={item.id} className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[120px_1fr]">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.moveType}</Badge>
                      <Badge variant={item.importance >= 4 ? "accent" : "outline"}>重要度 {item.importance}</Badge>
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <p className="mt-1 text-muted-foreground">{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
