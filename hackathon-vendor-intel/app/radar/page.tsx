import Link from "next/link";
import { ArrowRight, Database, Radar, Search, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GameMove } from "@/types/contract";
import { RadarDatabaseView } from "./database-view";
import {
  ensureRadarScheduler,
  getRadarDatabaseSnapshot,
  getTodaySummaryStats,
  listIntelligenceItems,
  type DateWindow,
} from "./database";
import { RadarRefreshButton } from "./refresh-button";

type RadarPageProps = {
  searchParams?: {
    q?: string;
    gameId?: string;
    window?: DateWindow;
    importance?: string;
  };
};

const validDateWindows = new Set<DateWindow>(["24h", "7d", "30d", "all"]);

const dateWindows: Array<{ value: DateWindow; label: string }> = [
  { value: "30d", label: "近 30 天" },
  { value: "7d", label: "近 7 天" },
  { value: "24h", label: "近 24 小时" },
  { value: "all", label: "全部" },
];

const moveTone: Record<GameMove["moveType"], string> = {
  新游: "bg-emerald-50 text-emerald-700 border-emerald-200",
  版本更新: "bg-sky-50 text-sky-700 border-sky-200",
  大版本: "bg-amber-50 text-amber-700 border-amber-200",
  活动: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

function parseMinImportance(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function buildWindowHref(dateWindow: DateWindow, query?: string, minImportance?: number, gameId?: string) {
  const params = new URLSearchParams();
  params.set("window", dateWindow);
  if (query) {
    params.set("q", query);
  }
  if (minImportance) {
    params.set("importance", String(minImportance));
  }
  if (gameId) {
    params.set("gameId", gameId);
  }
  return `/radar?${params.toString()}`;
}

export default function RadarPage({ searchParams }: RadarPageProps) {
  ensureRadarScheduler();

  const query = searchParams?.q?.trim();
  const selectedWindow =
    searchParams?.window && validDateWindows.has(searchParams.window) ? searchParams.window : "30d";
  const minImportance = parseMinImportance(searchParams?.importance);
  const selectedGameId = searchParams?.gameId?.trim();
  const filters = { q: query, gameId: selectedGameId, dateWindow: selectedWindow, minImportance };
  const intelligenceItems = listIntelligenceItems(filters);
  const snapshot = getRadarDatabaseSnapshot(filters);
  const todaySummary = getTodaySummaryStats();
  const highImportanceCount = intelligenceItems.filter((item) => item.importance >= 4).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="accent" className="w-fit">负责人：Gardner</Badge>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">① 情报雷达</h1>
            <p className="text-muted-foreground">
              自动追踪厂商/市场动作，回答最近谁有动作、运营该优先关注谁。
            </p>
          </div>
        </div>
        <RadarRefreshButton />

        <form action="/radar" className="flex w-full max-w-3xl flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input name="q" placeholder="搜索游戏、厂商、品类、来源" defaultValue={query} className="pl-9" />
          </div>
          {selectedGameId ? <input type="hidden" name="gameId" value={selectedGameId} /> : null}
          <select
            name="window"
            defaultValue={selectedWindow}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {dateWindows.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            name="importance"
            defaultValue={minImportance ?? ""}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">全部重要度</option>
            <option value="4">重要度至少 4</option>
            <option value="3">重要度至少 3</option>
            <option value="2">重要度至少 2</option>
          </select>
          <Button type="submit">筛选</Button>
        </form>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>今日摘要</CardTitle>
            <CardDescription>
              {todaySummary.date} 新增动态、覆盖游戏和厂商信息，列表展示 5 条最重要摘要。
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">高重要度 {highImportanceCount} 条</Badge>
            <Link
              href="/radar/summaries"
              className="inline-flex h-7 items-center rounded-md border border-input bg-card px-2.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              查看历史摘要
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <a href="#today-updates" className="rounded-md border bg-card px-3 py-3 transition-colors hover:bg-accent">
              <div className="text-sm text-muted-foreground">今日新增动态</div>
              <div className="mt-1 text-2xl font-bold">{todaySummary.updateCount}</div>
            </a>
            <a href="#today-games" className="rounded-md border bg-card px-3 py-3 transition-colors hover:bg-accent">
              <div className="text-sm text-muted-foreground">涉及游戏</div>
              <div className="mt-1 text-2xl font-bold">{todaySummary.gameNames.length}</div>
            </a>
            <a href="#today-companies" className="rounded-md border bg-card px-3 py-3 transition-colors hover:bg-accent">
              <div className="text-sm text-muted-foreground">涉及厂商</div>
              <div className="mt-1 text-2xl font-bold">{todaySummary.companyNames.length}</div>
            </a>
          </div>

          <div id="today-updates" className="rounded-md border">
            <div className="border-b bg-muted px-3 py-2 text-sm font-medium">重要摘要 Top 5</div>
            <div className="divide-y">
              {todaySummary.topItems.map((item) => (
              <a
                key={`highlight-${item.id}`}
                href={`#move-${item.id}`}
                className="grid gap-1 px-3 py-3 text-sm hover:bg-accent md:grid-cols-[96px_120px_1fr]"
              >
                <span className="text-muted-foreground">{item.date}</span>
                <span className="flex items-center gap-2">
                  <Badge className={`border ${moveTone[item.moveType]}`}>{item.moveType}</Badge>
                  <span className="text-xs text-muted-foreground">{item.importance}</span>
                </span>
                <span className="line-clamp-1">{item.name}：{item.summary}</span>
              </a>
            ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <details id="today-games" className="rounded-md border bg-card px-3 py-3">
              <summary className="cursor-pointer text-sm font-medium">查看新增/涉及游戏名称</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {todaySummary.gameNames.map((name) => (
                  <Badge key={name} variant="outline">{name}</Badge>
                ))}
              </div>
            </details>
            <details id="today-companies" className="rounded-md border bg-card px-3 py-3">
              <summary className="cursor-pointer text-sm font-medium">查看新增/涉及厂商名称</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {todaySummary.companyNames.map((name) => (
                  <Badge key={name} variant="outline">{name}</Badge>
                ))}
              </div>
            </details>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">厂商表</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snapshot.stats.companyCount}</div>
            <p className="text-xs text-muted-foreground">companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">游戏项目表</CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snapshot.stats.gameCount}</div>
            <p className="text-xs text-muted-foreground">games</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">情报流</CardTitle>
            <Radar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{intelligenceItems.length}</div>
            <p className="text-xs text-muted-foreground">
              当前周期：{dateWindows.find((item) => item.value === selectedWindow)?.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {dateWindows.map((item) => (
                <Link
                  key={item.value}
                  href={buildWindowHref(item.value, query, minImportance, selectedGameId)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    selectedWindow === item.value ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {intelligenceItems.map((move) => (
          <Card key={`${move.id}-${move.gameId}`} id={`move-${move.id}`}>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`border ${moveTone[move.moveType]}`}>{move.moveType}</Badge>
                  <Badge variant="outline">{move.category}</Badge>
                  {move.companyName ? <Badge variant="outline">{move.companyName}</Badge> : null}
                  <Badge variant={move.importance >= 4 ? "accent" : "outline"}>重要度 {move.importance}</Badge>
                  <span className="text-sm text-muted-foreground">{move.date}</span>
                </div>
                <div>
                  <CardTitle>{move.name}</CardTitle>
                  <CardDescription>{move.source}</CardDescription>
                </div>
              </div>
              <Badge variant="outline">GameMove</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6">{move.summary}</p>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-sm">
                <div className="mb-1 font-medium">对运营意味着什么</div>
                <p className="leading-6 text-muted-foreground">{move.operationMeaning}</p>
              </div>
              <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
                <Link
                  href={`/radar?gameId=${move.gameId}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  看雷达
                </Link>
                <Link
                  href={`/diagnosis?gameId=${move.gameId}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  去诊断
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/gip?gameId=${move.gameId}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  看 GIP 消耗
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {intelligenceItems.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            没有匹配的游戏动作。换个关键词或筛选条件再试试。
          </CardContent>
        </Card>
      ) : null}

      <RadarDatabaseView initialSnapshot={snapshot} />
    </div>
  );
}
