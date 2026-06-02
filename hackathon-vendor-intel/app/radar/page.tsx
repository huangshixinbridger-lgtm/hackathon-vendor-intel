import Link from "next/link";
import { ArrowRight, CalendarDays, Database, Radar, Search, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GameMove } from "@/types/contract";
import { RadarDatabaseView } from "./database-view";
import { getRadarDatabaseSnapshot, listGameMoves } from "./database";

type RadarPageProps = {
  searchParams?: {
    q?: string;
    type?: GameMove["moveType"];
  };
};

const moveTypes: Array<GameMove["moveType"]> = ["新游", "版本更新", "大版本", "活动"];
const validMoveTypes = new Set<GameMove["moveType"]>(moveTypes);

const moveTone: Record<GameMove["moveType"], string> = {
  新游: "bg-emerald-50 text-emerald-700 border-emerald-200",
  版本更新: "bg-sky-50 text-sky-700 border-sky-200",
  大版本: "bg-amber-50 text-amber-700 border-amber-200",
  活动: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

function buildTypeHref(query?: string, type?: GameMove["moveType"]) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
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
  const moves = listGameMoves({ q: query, type: selectedType });
  const snapshot = getRadarDatabaseSnapshot({ q: query, type: selectedType });
  const latestMove = moves[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="accent" className="w-fit">负责人：Gardner</Badge>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">① 情报雷达</h1>
            <p className="text-muted-foreground">
              迁移游戏厂商、游戏项目、游戏动态三张表，并映射为 GameMove 给其他模块调用。
            </p>
          </div>
        </div>

        <form action="/radar" className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input name="q" placeholder="搜索游戏、品类、来源" defaultValue={query} className="pl-9" />
          </div>
          {selectedType ? <input type="hidden" name="type" value={selectedType} /> : null}
          <Button type="submit">筛选</Button>
        </form>
      </div>

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
            <CardTitle className="text-sm font-medium">动态表</CardTitle>
            <Radar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snapshot.stats.updateCount}</div>
            <p className="text-xs text-muted-foreground">updates</p>
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

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildTypeHref(query)}
          className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
            selectedType ? "bg-card hover:bg-accent" : "bg-primary text-primary-foreground"
          }`}
        >
          全部
        </Link>
        {moveTypes.map((type) => (
          <Link
            key={type}
            href={buildTypeHref(query, type)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              selectedType === type ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
            }`}
          >
            {type}
          </Link>
        ))}
      </div>

      <div className="grid gap-4">
        {moves.map((move) => (
          <Card key={`${move.gameId}-${move.date}-${move.moveType}`}>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`border ${moveTone[move.moveType]}`}>{move.moveType}</Badge>
                  <Badge variant="outline">{move.category}</Badge>
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
              <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
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

      {moves.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            没有匹配的游戏动作。换个关键词或动作类型再试试。
          </CardContent>
        </Card>
      ) : null}

      <RadarDatabaseView initialSnapshot={snapshot} />
    </div>
  );
}
