import Link from "next/link";
import { ArrowRight, CalendarDays, Database, Filter, Radar, Search, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GameMove } from "@/types/contract";
import { RadarDatabaseView } from "./database-view";
import {
  getRadarDatabaseSnapshot,
  getTodayHighlights,
  listIntelligenceItems,
  type DateWindow,
} from "./database";

type RadarPageProps = {
  searchParams?: {
    q?: string;
    type?: GameMove["moveType"];
    gameId?: string;
    window?: DateWindow;
    importance?: string;
  };
};

const moveTypes: Array<GameMove["moveType"]> = ["新游", "版本更新", "大版本", "活动"];
const validMoveTypes = new Set<GameMove["moveType"]>(moveTypes);
const validDateWindows = new Set<DateWindow>(["24h", "7d", "30d", "all"]);

const dateWindows: Array<{ value: DateWindow; label: string }> = [
  { value: "7d", label: "近 7 天" },
  { value: "24h", label: "近 24 小时" },
  { value: "30d", label: "近 30 天" },
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

function buildTypeHref(
  query?: string,
  dateWindow?: DateWindow,
  minImportance?: number,
  gameId?: string,
  type?: GameMove["moveType"]
) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (dateWindow && dateWindow !== "7d") {
    params.set("window", dateWindow);
  }

  if (minImportance) {
    params.set("importance", String(minImportance));
  }

  if (gameId) {
    params.set("gameId", gameId);
  }

  if (type) {
    params.set("type", type);
  }

  return params.size ? `/radar?${params.toString()}` : "/radar";
}

export default function RadarPage({ searchParams }: RadarPageProps) {
  const query = searchParams?.q?.trim();
  const selectedType =
    searchParams?.type && validMoveTypes.has(searchParams.type) ? searchParams.type : undefined;
  const selectedWindow =
    searchParams?.window && validDateWindows.has(searchParams.window) ? searchParams.window : "7d";
  const minImportance = parseMinImportance(searchParams?.importance);
  const selectedGameId = searchParams?.gameId?.trim();
  const filters = { q: query, type: selectedType, gameId: selectedGameId, dateWindow: selectedWindow, minImportance };
  const intelligenceItems = listIntelligenceItems(filters);
  const snapshot = getRadarDatabaseSnapshot(filters);
  const highlights = getTodayHighlights();
  const latestMove = intelligenceItems[0];
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

        <form action="/radar" className="flex w-full max-w-3xl flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input name="q" placeholder="搜索游戏、厂商、品类、来源" defaultValue={query} className="pl-9" />
          </div>
          {selectedType ? <input type="hidden" name="type" value={selectedType} /> : null}
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
              近 7 天重点情报 Top 3，按重要度和时间排序，点击可定位到情报卡片。
            </CardDescription>
          </div>
          <Badge variant="outline">高重要度 {highImportanceCount} 条</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            {highlights.map((item) => (
              <a
                key={`highlight-${item.id}`}
                href={`#move-${item.id}`}
                className="rounded-md border bg-card px-3 py-3 text-sm transition-colors hover:bg-accent"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge className={`border ${moveTone[item.moveType]}`}>{item.moveType}</Badge>
                  <span className="text-xs text-muted-foreground">重要度 {item.importance}</span>
                </div>
                <div className="line-clamp-2 font-medium">{item.name}</div>
                <p className="mt-1 line-clamp-2 text-muted-foreground">{item.summary}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
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
          <CardContent>
            <div className="text-2xl font-bold">{intelligenceItems.length}</div>
            <p className="text-xs text-muted-foreground">当前筛选结果</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最新动作</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="truncate text-2xl font-bold">{latestMove?.date ?? "-"}</div>
            <p className="truncate text-xs text-muted-foreground">{latestMove?.name ?? "暂无匹配结果"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>字段映射</CardTitle>
          <CardDescription>旧库表字段到当前契约 types/contract.ts 的 GameMove 映射。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            {Object.entries(snapshot.mapping).map(([field, source]) => (
              <div key={field} className="flex gap-2 rounded-md border bg-card px-3 py-2">
                <code className="min-w-20 text-accent-foreground">{field}</code>
                <span className="text-muted-foreground">{source}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          事件类型
        </div>
        <Link
          href={buildTypeHref(query, selectedWindow, minImportance, selectedGameId)}
          className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
            selectedType ? "bg-card hover:bg-accent" : "bg-primary text-primary-foreground"
          }`}
        >
          全部
        </Link>
        {moveTypes.map((type) => (
          <Link
            key={type}
            href={buildTypeHref(query, selectedWindow, minImportance, selectedGameId, type)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              selectedType === type ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
            }`}
          >
            {type}
          </Link>
        ))}
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
