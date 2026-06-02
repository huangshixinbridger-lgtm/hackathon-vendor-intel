"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { RadarDatabaseSnapshot, RadarTableName } from "./database";

type TableConfig = {
  name: RadarTableName;
  title: string;
  columns: Array<[string, string]>;
};

const tableConfigs: TableConfig[] = [
  {
    name: "gameMoves",
    title: "GameMove 契约输出",
    columns: [
      ["gameId", "gameId"],
      ["name", "游戏"],
      ["category", "品类"],
      ["moveType", "动作"],
      ["summary", "摘要"],
      ["source", "来源"],
      ["date", "日期"],
    ],
  },
  {
    name: "games",
    title: "游戏项目表",
    columns: [
      ["name", "游戏"],
      ["companyId", "公司ID"],
      ["stage", "阶段"],
      ["genres", "品类"],
      ["releaseRegions", "区域"],
      ["latestProgress", "最新进展"],
      ["relevanceScore", "关注度"],
    ],
  },
  {
    name: "updates",
    title: "游戏动态表",
    columns: [
      ["updateDate", "日期"],
      ["updateType", "类型"],
      ["summary", "摘要"],
      ["gameId", "游戏ID"],
      ["companyId", "公司ID"],
      ["sourceName", "来源"],
      ["importance", "重要度"],
    ],
  },
  {
    name: "companies",
    title: "游戏厂商表",
    columns: [
      ["name", "厂商"],
      ["region", "区域"],
      ["headquartersCountry", "主要国家/地区"],
      ["aliases", "别名"],
      ["description", "描述"],
      ["updatedAt", "更新时间"],
    ],
  },
];

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(" / ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function pickRows(snapshot: RadarDatabaseSnapshot, table: RadarTableName) {
  return snapshot[table] as Array<Record<string, unknown>>;
}

export function RadarDatabaseView({ initialSnapshot }: { initialSnapshot: RadarDatabaseSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeTable, setActiveTable] = useState<RadarTableName>("gameMoves");
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date().toLocaleTimeString());

  const activeConfig = tableConfigs.find((table) => table.name === activeTable) ?? tableConfigs[0];
  const rows = useMemo(() => pickRows(snapshot, activeTable), [snapshot, activeTable]);

  const refresh = useCallback(async (nextQuery = query) => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      }

      const response = await fetch(`/radar/api/tables${params.size ? `?${params.toString()}` : ""}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as RadarDatabaseSnapshot;
      setSnapshot(data);
      setLastUpdatedAt(new Date().toLocaleTimeString());
    } finally {
      setIsRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tableConfigs.map((table) => (
            <button
              key={table.name}
              type="button"
              onClick={() => setActiveTable(table.name)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                activeTable === table.name ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
              }`}
            >
              {table.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void refresh();
              }
            }}
            placeholder="实时搜索表内容"
            className="sm:w-64"
          />
          <Button type="button" variant="outline" onClick={() => refresh()} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{activeConfig.title}</CardTitle>
            <CardDescription>
              {rows.length} 条记录，最后刷新 {lastUpdatedAt}
            </CardDescription>
          </div>
          <Badge variant="outline">/radar/api/tables?table={activeTable}</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  {activeConfig.columns.map(([, label]) => (
                    <th key={label} className="whitespace-nowrap px-3 py-2 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${activeTable}-${index}`} className="border-t">
                    {activeConfig.columns.map(([key]) => (
                      <td key={key} className="max-w-[320px] px-3 py-3 align-top">
                        <span className="line-clamp-3">{formatValue(row[key])}</span>
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={activeConfig.columns.length}>
                      暂无匹配记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
