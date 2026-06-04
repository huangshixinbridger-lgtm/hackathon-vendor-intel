"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RadarDatabaseSnapshot, RadarTableName } from "./database";

type TableConfig = {
  name: RadarTableName;
  title: string;
  columns: Array<[string, string]>;
};

const tableConfigs: TableConfig[] = [
  {
    name: "updates",
    title: "游戏动态表",
    columns: [
      ["date", "日期"],
      ["moveType", "动作"],
      ["name", "游戏/厂商"],
      ["companyName", "公司"],
      ["category", "品类"],
      ["summary", "摘要"],
      ["source", "来源"],
      ["importance", "重要度"],
    ],
  },
  {
    name: "games",
    title: "游戏项目表",
    columns: [
      ["name", "游戏"],
      ["companyName", "公司"],
      ["publisher", "发行商"],
      ["developer", "开发商"],
      ["stage", "阶段"],
      ["releaseDate", "Release"],
      ["genres", "品类"],
      ["platforms", "平台"],
      ["releaseRegions", "区域"],
      ["officialSite", "官网"],
      ["wikipediaUrl", "Wikipedia"],
      ["latestProgress", "最新进展"],
      ["relevanceScore", "关注度"],
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
      ["website", "官网"],
      ["wikipediaUrl", "Wikipedia"],
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

function renderCell(row: Record<string, unknown>, key: string) {
  if (key === "source" && typeof row.source === "string" && typeof row.sourceUrl === "string" && row.sourceUrl) {
    return (
      <a className="text-accent-foreground hover:underline" href={row.sourceUrl} target="_blank" rel="noreferrer">
        {row.source}
      </a>
    );
  }

  if ((key === "website" || key === "officialSite" || key === "wikipediaUrl") && typeof row[key] === "string" && row[key]) {
    return (
      <a className="text-accent-foreground hover:underline" href={row[key]} target="_blank" rel="noreferrer">
        {key === "wikipediaUrl" ? "打开" : row[key]}
      </a>
    );
  }

  return <span className="line-clamp-3">{formatValue(row[key])}</span>;
}

function formatRefreshTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function RadarDatabaseView({ initialSnapshot }: { initialSnapshot: RadarDatabaseSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeTable, setActiveTable] = useState<RadarTableName>("updates");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("页面加载后刷新");

  const activeConfig = tableConfigs.find((table) => table.name === activeTable) ?? tableConfigs[0];
  const rows = useMemo(() => pickRows(snapshot, activeTable), [snapshot, activeTable]);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize, rows]
  );
  const pageStart = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(rows.length, currentPage * pageSize);

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
      setLastUpdatedAt(formatRefreshTime());
    } finally {
      setIsRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    setLastUpdatedAt(formatRefreshTime());

    const timer = window.setInterval(() => {
      void refresh();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    setPage(1);
  }, [activeTable, pageSize, query, rows.length]);

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

      <section className="space-y-3">
        <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold leading-none tracking-tight">{activeConfig.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length} 条记录，当前显示 {pageStart}-{pageEnd}，最后刷新 {lastUpdatedAt}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">/radar/api/tables?table={activeTable}</Badge>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              每页
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              条
            </label>
          </div>
        </div>
        <div>
          <div className="overflow-x-auto border">
            <table className="w-full min-w-[840px] border-collapse text-left text-sm">
              <thead className="border-b bg-muted text-muted-foreground">
                <tr>
                  {activeConfig.columns.map(([, label]) => (
                    <th key={label} className="whitespace-nowrap px-3 py-2 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={`${activeTable}-${String(row.id ?? row.name ?? index)}-${currentPage}`} className="border-b last:border-b-0">
                    {activeConfig.columns.map(([key]) => (
                      <td key={key} className="max-w-[320px] px-3 py-3 align-top">
                        {renderCell(row, key)}
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
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPage(1)} disabled={currentPage <= 1}>
                首页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
              >
                上一页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
              >
                下一页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={currentPage >= totalPages}
              >
                末页
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
