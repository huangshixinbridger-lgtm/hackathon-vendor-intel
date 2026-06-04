import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const snapshot = getRadarDatabaseSnapshot();
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

      <section className="space-y-3 border-y py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">今日摘要</h2>
            <p className="text-sm text-muted-foreground">
              {todaySummary.date} 新增动态、覆盖游戏和厂商信息，列表展示 5 条最重要摘要。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">高重要度 {highImportanceCount} 条</Badge>
            <Link href="/radar/summaries" className="text-accent-foreground hover:underline">
              查看历史摘要
            </Link>
          </div>
        </div>

        <div className="grid border text-sm md:grid-cols-3">
          <a href="#today-updates" className="border-b px-3 py-2 hover:bg-accent md:border-b-0 md:border-r">
            今日新增动态 <strong className="ml-2 text-base">{todaySummary.updateCount}</strong>
          </a>
          <a href="#today-games" className="border-b px-3 py-2 hover:bg-accent md:border-b-0 md:border-r">
            涉及游戏 <strong className="ml-2 text-base">{todaySummary.gameNames.length}</strong>
          </a>
          <a href="#today-companies" className="px-3 py-2 hover:bg-accent">
            涉及厂商 <strong className="ml-2 text-base">{todaySummary.companyNames.length}</strong>
          </a>
        </div>

        <div id="today-updates" className="border">
          <div className="border-b bg-muted px-3 py-2 text-sm font-medium">重要摘要 Top 5</div>
          <div className="divide-y">
            {todaySummary.topItems.map((item) => (
              <a
                key={`highlight-${item.id}`}
                href={`#move-${item.id}`}
                className="grid gap-1 px-3 py-2 text-sm hover:bg-accent md:grid-cols-[96px_120px_1fr]"
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
          <details id="today-games" className="border px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium">查看新增/涉及游戏名称</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {todaySummary.gameNames.map((name) => (
                <Badge key={name} variant="outline">{name}</Badge>
              ))}
            </div>
          </details>
          <details id="today-companies" className="border px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium">查看新增/涉及厂商名称</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {todaySummary.companyNames.map((name) => (
                <Badge key={name} variant="outline">{name}</Badge>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 border-b pb-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">情报流</h2>
            <p className="text-sm text-muted-foreground">
              当前周期：{dateWindows.find((item) => item.value === selectedWindow)?.label}，共 {intelligenceItems.length} 条。
              数据库：厂商 {snapshot.stats.companyCount} / 游戏 {snapshot.stats.gameCount} / 动态 {snapshot.stats.updateCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dateWindows.map((item) => (
              <Link
                key={item.value}
                href={buildWindowHref(item.value, query, minImportance, selectedGameId)}
                className={`border px-2.5 py-1 text-xs transition-colors ${
                  selectedWindow === item.value ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="border-b bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">日期</th>
                <th className="px-3 py-2 font-medium">动作</th>
                <th className="px-3 py-2 font-medium">游戏/厂商</th>
                <th className="px-3 py-2 font-medium">公司</th>
                <th className="px-3 py-2 font-medium">摘要</th>
                <th className="px-3 py-2 font-medium">来源</th>
                <th className="px-3 py-2 font-medium">重要度</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {intelligenceItems.map((move) => (
                <tr key={`${move.id}-${move.gameId}`} id={`move-${move.id}`} className="border-b last:border-b-0">
                  <td className="whitespace-nowrap px-3 py-3 align-top text-muted-foreground">{move.date}</td>
                  <td className="whitespace-nowrap px-3 py-3 align-top">
                    <Badge className={`border ${moveTone[move.moveType]}`}>{move.moveType}</Badge>
                  </td>
                  <td className="max-w-[220px] px-3 py-3 align-top font-medium">{move.name}</td>
                  <td className="max-w-[180px] px-3 py-3 align-top">{move.companyName || "-"}</td>
                  <td className="max-w-[420px] px-3 py-3 align-top">
                    <div className="line-clamp-2">{move.summary}</div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{move.operationMeaning}</div>
                  </td>
                  <td className="max-w-[180px] px-3 py-3 align-top text-muted-foreground">{move.source}</td>
                  <td className="whitespace-nowrap px-3 py-3 align-top">{move.importance}</td>
                  <td className="whitespace-nowrap px-3 py-3 align-top">
                    <div className="flex gap-2">
                      <Link href={`/radar?gameId=${move.gameId}`} className="text-accent-foreground hover:underline">
                        雷达
                      </Link>
                      <Link href={`/diagnosis?gameId=${move.gameId}`} className="text-accent-foreground hover:underline">
                        诊断
                      </Link>
                      <Link href={`/gip?gameId=${move.gameId}`} className="text-accent-foreground hover:underline">
                        GIP
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {intelligenceItems.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground" colSpan={8}>
                    没有匹配的游戏动作。换个关键词或筛选条件再试试。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <RadarDatabaseView initialSnapshot={snapshot} />
    </div>
  );
}
