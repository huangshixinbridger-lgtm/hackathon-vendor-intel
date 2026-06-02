import Link from "next/link";
import { ArrowRight, CalendarDays, Database, Radar, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockGameMoves } from "@/lib/mock";
import type { GameMove } from "@/types/contract";

type RadarPageProps = {
  searchParams?: {
    q?: string;
    type?: GameMove["moveType"];
  };
};

const moveTypes: Array<GameMove["moveType"]> = ["新游", "版本更新", "大版本", "活动"];

const moveTone: Record<GameMove["moveType"], string> = {
  新游: "bg-emerald-50 text-emerald-700 border-emerald-200",
  版本更新: "bg-sky-50 text-sky-700 border-sky-200",
  大版本: "bg-amber-50 text-amber-700 border-amber-200",
  活动: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

function getFilteredMoves(searchParams: RadarPageProps["searchParams"]) {
  const query = searchParams?.q?.trim().toLowerCase() ?? "";
  const type = searchParams?.type;

  return mockGameMoves
    .filter((move) => {
      const matchedQuery =
        !query ||
        [move.name, move.category, move.summary, move.source].some((field) =>
          field.toLowerCase().includes(query)
        );
      const matchedType = !type || move.moveType === type;

      return matchedQuery && matchedType;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

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
  const moves = getFilteredMoves(searchParams);
  const selectedType = searchParams?.type;
  const query = searchParams?.q?.trim();
  const latestMove = moves[0];
  const uniqueCategories = new Set(mockGameMoves.map((move) => move.category)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="accent" className="w-fit">负责人：Gardner</Badge>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">① 情报雷达</h1>
            <p className="text-muted-foreground">发现最近有动作的游戏，快速进入诊断与 GIP 消耗链路。</p>
          </div>
        </div>

        <form action="/radar" className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="搜索游戏、品类、来源"
              defaultValue={query}
              className="pl-9"
            />
          </div>
          {selectedType ? <input type="hidden" name="type" value={selectedType} /> : null}
          <Button type="submit">筛选</Button>
        </form>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">监测动作</CardTitle>
            <Radar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGameMoves.length}</div>
            <p className="text-xs text-muted-foreground">来自 GameMove mock 数据</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">覆盖品类</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCategories}</div>
            <p className="text-xs text-muted-foreground">用于运营优先级判断</p>
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
          <Card key={move.gameId}>
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
              <Sparkles className="hidden h-5 w-5 text-muted-foreground sm:block" />
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
    </div>
  );
}
