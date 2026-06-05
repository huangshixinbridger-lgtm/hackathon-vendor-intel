import Link from "next/link";
import { Database, Radar, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameMove } from "@/types/contract";
import { resolveGame } from "@/lib/games";
import { RadarDatabaseView } from "./database-view";
import {
  ensureRadarScheduler,
  getRadarDatabaseSnapshot,
  getTodaySummaryStats,
  listIntelligenceItems,
  type DateWindow,
} from "./database";
import { RadarRefreshButton } from "./refresh-button";
import { SearchBox } from "@/components/shell/search-box";

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
  const selectedGame = resolveGame(selectedGameId);
  // gameId 现在是「动线选定的游戏」（由顶部外壳读取并串到后续步骤）；情报雷达是发现页，本身不按它过滤。
  const filters = { q: query, dateWindow: selectedWindow, minImportance };
  const intelligenceItems = listIntelligenceItems(filters);
  const currentWindowItems = listIntelligenceItems({ dateWindow: selectedWindow });
  const snapshot = getRadarDatabaseSnapshot();
  const todaySummary = getTodaySummaryStats();
  const highImportanceCount = intelligenceItems.filter((item) => item.importance >= 4).length;

  return (
    <div className="space-y-6">
      {/* 第一步「找游戏」：主动搜索定位一个游戏，或从下方推荐资讯里挑一个作为本次分析对象。 */}
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <Badge variant="accent" className="w-fit">① 找游戏 · 情报雷达</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">搜一个游戏，或从下方资讯里挑一个</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          主动搜索锁定它，或浏览全网最新动态，选一个值得深入的游戏 —— 选定后右侧「下一步」带它走完内容洞察 → 经营诊断 → 历史付费分析。
        </p>
        <div className="mt-4">
          <SearchBox placeholder="搜索一个游戏，例如：Free Fire / 燕云十六声" />
        </div>
        {selectedGame ? (
          <p className="mt-3 text-sm text-emerald-300">
            已选定：<span className="font-semibold">{selectedGame.name}</span> —— 点右侧「下一步」进入内容洞察。
          </p>
        ) : null}
      </section>

      {/* 推荐资讯：全网最新动态（浏览用筛选 + 手动抓取）。 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">推荐资讯 · 全网最新动态</h2>
        <div className="flex flex-wrap items-center gap-2">
          <RadarRefreshButton />
          <form action="/radar" className="flex items-center gap-2">
            {selectedGameId ? <input type="hidden" name="gameId" value={selectedGameId} /> : null}
            {query ? <input type="hidden" name="q" value={query} /> : null}
            <select
              name="window"
              defaultValue={selectedWindow}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">全部重要度</option>
              <option value="4">重要度至少 4</option>
              <option value="3">重要度至少 3</option>
              <option value="2">重要度至少 2</option>
            </select>
            <Button type="submit" variant="outline">筛选</Button>
          </form>
        </div>
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
              {todaySummary.topItems.map((item) => {
                // 动线衔接：资讯里能解析为注册表里的游戏 → 给一个「选定 →」，把它设为本次分析对象。
                const g = resolveGame(item.name);
                return (
                  <div
                    key={`highlight-${item.id}`}
                    className="grid items-center gap-1 px-3 py-3 text-sm hover:bg-accent md:grid-cols-[96px_120px_1fr_auto]"
                  >
                    <span className="text-muted-foreground">{item.date}</span>
                    <span className="flex items-center gap-2">
                      <Badge className={`border ${moveTone[item.moveType]}`}>{item.moveType}</Badge>
                      <span className="text-xs text-muted-foreground">{item.importance}</span>
                    </span>
                    <a href={`#move-${item.id}`} className="line-clamp-1 hover:underline">{item.name}：{item.summary}</a>
                    {g ? (
                      <Link
                        href={`/radar?gameId=${encodeURIComponent(g.id)}`}
                        className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          selectedGame?.id === g.id ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        {selectedGame?.id === g.id ? "已选定" : "选定 →"}
                      </Link>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}
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
            <div className="text-2xl font-bold">{snapshot.stats.updateCount}</div>
            <p className="text-xs text-muted-foreground">
              updates · 当前周期 {dateWindows.find((item) => item.value === selectedWindow)?.label}：{currentWindowItems.length} 条
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

      <RadarDatabaseView initialSnapshot={snapshot} />
    </div>
  );
}
