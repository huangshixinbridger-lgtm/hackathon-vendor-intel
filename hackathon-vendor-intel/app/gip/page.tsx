"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, FileText, Sparkles, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  benchmarks,
  calcCpm,
  calcEngagementRate,
  formatMoney,
  formatNumber,
  mockGIPRecords,
  type BenchmarkRecord,
  type GIPStrategyRecord,
} from "./data";
import { resolveGame } from "@/lib/games";

const allOption = "全部";

function uniq(values: string[]) {
  return [allOption, ...Array.from(new Set(values)).sort()];
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{note}</CardContent>
    </Card>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 rounded-full bg-muted">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
    </div>
  );
}

function getActivities(records: GIPStrategyRecord[]) {
  return records.flatMap((record) =>
    record.activities.map((activity) => ({
      ...activity,
      game: record.game,
      gameId: record.gameId,
      category: record.category,
      vendor: record.vendor,
    }))
  );
}

function getBenchmarks(record: GIPStrategyRecord) {
  const exact = benchmarks.filter((item) => item.category === record.category);
  return exact.length > 0 ? exact : benchmarks;
}

function getStrategy(record: GIPStrategyRecord, peers: BenchmarkRecord[]) {
  const hasHistory = record.activities.length > 0;
  const totalVv = record.activities.reduce((sum, item) => sum + item.vv, 0);
  const totalPosts = record.activities.reduce((sum, item) => sum + item.posts, 0);
  const totalInteractions = record.activities.reduce((sum, item) => sum + item.interactions, 0);
  const bestPeer = peers.reduce((best, item) => (item.avgVv > best.avgVv ? item : best), peers[0]);
  const avgPeerSpend = peers.reduce((sum, item) => sum + item.avgSpend, 0) / peers.length;
  const peerRegions = [...peers]
    .sort((a, b) => b.avgVv - a.avgVv)
    .slice(0, 3)
    .map((item) => item.region)
    .join(" / ");
  const suggestedBase = hasHistory ? Math.max(record.consumption * 1.18, avgPeerSpend * 2.2) : avgPeerSpend * 1.8;
  const suggestedBudget = Math.round(suggestedBase / 1000) * 1000;
  const t0 = Math.round(suggestedBudget * 0.2);
  const t1 = Math.round(suggestedBudget * 0.55);
  const t2 = suggestedBudget - t0 - t1;

  const conclusion = hasHistory
    ? "老游戏已有 GIP 历史，应以历史高效市场为底盘，叠加同品类高承接市场做复投扩量。"
    : "当前缺少 GIP 历史，应先参考同品类同市场表现，以小预算验证内容模板和达人层级。";
  const direction =
    record.stage === "新游戏"
      ? "新品冷启：先验证市场与内容模板，再进入节点放量。"
      : record.deliveryShape === "节点爆发"
        ? "节点爆发：围绕版本/上线/活动窗口集中投放，同时保留复盘预算。"
        : "结构优化：控制粗放扩量，把预算放到高消费低供给市场。";

  return {
    hasHistory,
    totalVv,
    totalPosts,
    totalInteractions,
    cpm: calcCpm(record.consumption, totalVv),
    engagementRate: calcEngagementRate(totalInteractions, totalVv),
    bestPeer,
    peerRegions,
    suggestedBudget,
    conclusion,
    direction,
    nodes: [
      {
        name: "T0 预热验证",
        budget: t0,
        market: hasHistory ? record.region : peerRegions,
        action: "验证 2-3 个内容模板，筛掉低互动达人与异常流量。",
      },
      {
        name: "T1 节点爆发",
        budget: t1,
        market: peerRegions,
        action: "集中投中腰部达人和直播供给，拉活动期 VV、投稿和看播。",
      },
      {
        name: "T2 复盘复投",
        budget: t2,
        market: bestPeer.region,
        action: "只复投 CPM、互动率、投稿效率达标的模板与达人。",
      },
    ],
  };
}

export default function GipPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading GIP dashboard...</div>}>
      <GipContent />
    </Suspense>
  );
}

function GipContent() {
  const searchParams = useSearchParams();
  const gameIdFromUrl = searchParams.get("gameId");
  const matchedRecord = gameIdFromUrl
    ? mockGIPRecords.find((record) => record.gameId === gameIdFromUrl)
    : undefined;
  // 携带了 gameId 但 GIP 没有这游戏的数据 → 明确提示，而不是静默展示第一条记录
  const notFound = Boolean(gameIdFromUrl) && !matchedRecord;
  const requestedName = gameIdFromUrl ? resolveGame(gameIdFromUrl)?.name ?? gameIdFromUrl : "";
  const initialRecord = matchedRecord ?? mockGIPRecords[0];
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(allOption);
  const [region, setRegion] = useState(allOption);
  const [category, setCategory] = useState(allOption);
  const [shape, setShape] = useState(allOption);
  const [selectedGameId, setSelectedGameId] = useState(initialRecord.gameId);
  const [reportGenerated, setReportGenerated] = useState(true);

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return mockGIPRecords.filter((record) => {
      const hitKeyword =
        !keyword ||
        [record.game, record.vendor, record.category, record.gameId].some((text) => text.toLowerCase().includes(keyword));
      return (
        hitKeyword &&
        (period === allOption || record.period === period) &&
        (region === allOption || record.region === region || record.activities.some((item) => item.region === region)) &&
        (category === allOption || record.category === category) &&
        (shape === allOption || record.deliveryShape === shape)
      );
    });
  }, [category, period, query, region, shape]);

  const selectedRecord =
    mockGIPRecords.find((record) => record.gameId === selectedGameId) ?? filteredRecords[0] ?? mockGIPRecords[0];
  const visibleActivities = getActivities(filteredRecords);
  const selectedActivities = selectedRecord.activities;
  const peers = getBenchmarks(selectedRecord);
  const strategy = getStrategy(selectedRecord, peers);
  const maxSpend = Math.max(...filteredRecords.map((record) => record.consumption), 1);

  const summary = {
    budget: filteredRecords.reduce((sum, record) => sum + record.budget, 0),
    consumption: filteredRecords.reduce((sum, record) => sum + record.consumption, 0),
    vv: visibleActivities.reduce((sum, activity) => sum + activity.vv, 0),
    posts: visibleActivities.reduce((sum, activity) => sum + activity.posts, 0),
  };
  const burnRate = summary.budget > 0 ? (summary.consumption / summary.budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {notFound ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          GIP 面板暂无「{requestedName}」的投放数据，下方为默认示例（{initialRecord.game}），可用上方搜索/筛选查看已收录游戏。
        </div>
      ) : null}
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="accent" className="w-fit">GIP 策略中台 Mock</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GIP 投放查询与策略生成</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                面向诊断报告的 GIP 独立数据模块：查询历史消耗、同品类 benchmark、活动复盘，并输出后续节点预算计划。
              </p>
            </div>
          </div>
          <Button onClick={() => setReportGenerated(true)} className="bg-white text-slate-950 hover:bg-slate-100">
            <Sparkles className="h-4 w-4" />
            一键生成 GIP 策略
          </Button>
        </div>
      </section>

      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                GIP 策略报告输出
              </CardTitle>
              <CardDescription>报告放在最上方；下方所有面板是策略依据和复盘学习材料。</CardDescription>
            </div>
            <Badge variant={strategy.hasHistory ? "default" : "secondary"}>{selectedRecord.stage}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {reportGenerated && (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Strategy for {selectedRecord.game}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{formatMoney(strategy.suggestedBudget)} 建议投放预算</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{strategy.conclusion}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{strategy.direction}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">优先市场</p>
                    <p className="mt-1 font-semibold">{strategy.peerRegions}</p>
                  </div>
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">历史/参考 CPM</p>
                    <p className="mt-1 font-semibold">${strategy.cpm.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">互动率</p>
                    <p className="mt-1 font-semibold">{strategy.engagementRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {strategy.nodes.map((node) => (
                  <div key={node.name} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{node.name}</p>
                      <Badge variant="outline">{formatMoney(node.budget)}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">市场：{node.market}</p>
                    <p className="mt-2 text-sm leading-6">{node.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border-l-4 border-l-primary bg-primary/5 p-4 text-sm leading-6">
            <b>诊断报告写法：</b>
            {selectedRecord.game} 当前在 TikTok 生态处于 {selectedRecord.organic.position} 身位，
            GIP 策略应以 {selectedRecord.category} 同品类表现为基准。
            {strategy.hasHistory
              ? `历史 GIP 已产生 ${formatNumber(strategy.totalVv)} VV，建议复投高效市场并控制低质供给。`
              : "当前暂无投放历史，建议先用同品类 benchmark 做小预算验证，再根据活动期表现放量。"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>查询与筛选</CardTitle>
          <CardDescription>按游戏、时间、地区、品类和投放打法筛选 GIP 预算与消耗。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-1.5 text-sm font-medium lg:col-span-2">
            <span className="text-muted-foreground">搜索游戏 / 厂商 / 品类</span>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：燕云、Shooter、NetEase" />
          </label>
          <SelectBox label="时间" value={period} options={uniq(mockGIPRecords.map((record) => record.period))} onChange={setPeriod} />
          <SelectBox
            label="地区"
            value={region}
            options={uniq(mockGIPRecords.flatMap((record) => [record.region, ...record.activities.map((item) => item.region)]))}
            onChange={setRegion}
          />
          <SelectBox label="品类" value={category} options={uniq(mockGIPRecords.map((record) => record.category))} onChange={setCategory} />
          <SelectBox
            label="打法"
            value={shape}
            options={uniq(mockGIPRecords.map((record) => record.deliveryShape))}
            onChange={setShape}
          />
          <Button
            variant="outline"
            className="lg:col-span-4"
            onClick={() => {
              setQuery("");
              setPeriod(allOption);
              setRegion(allOption);
              setCategory(allOption);
              setShape(allOption);
            }}
          >
            重置筛选
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="汇总预算" value={formatMoney(summary.budget)} note={`${filteredRecords.length} 款游戏纳入筛选`} />
        <StatCard title="汇总消耗" value={formatMoney(summary.consumption)} note={`消耗率 ${burnRate.toFixed(1)}%`} />
        <StatCard title="GIP VV" value={formatNumber(summary.vv)} note={`${formatNumber(summary.posts)} 篇活动投稿`} />
        <StatCard title="覆盖活动" value={`${visibleActivities.length}`} note="可点击游戏查看历史明细与复盘" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              游戏消耗大盘
            </CardTitle>
            <CardDescription>点击任意游戏后，右侧会切换到该游戏的历史复盘与同品类参考。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredRecords.map((record) => (
              <button
                key={record.gameId}
                onClick={() => setSelectedGameId(record.gameId)}
                className={`w-full rounded-xl border p-4 text-left transition hover:border-primary ${
                  record.gameId === selectedRecord.gameId ? "border-primary bg-primary/5" : "bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{record.game}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.category} · {record.vendor} · {record.region}
                    </p>
                  </div>
                  <Badge variant="outline">{record.stage}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatMoney(record.consumption)}</span>
                    <span>{record.budget > 0 ? `${((record.consumption / record.budget) * 100).toFixed(1)}%` : "暂无历史"}</span>
                  </div>
                  <ProgressBar value={record.consumption} max={maxSpend} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              历史投放复盘
            </CardTitle>
            <CardDescription>复盘不直接塞满诊断报告，用来学习哪些市场、达人和内容模板值得复投。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedActivities.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm leading-6 text-muted-foreground">
                {selectedRecord.game} 暂无 GIP 历史。建议以 {selectedRecord.category} 的同品类 benchmark 作为首轮预算和市场选择依据。
              </div>
            ) : (
              selectedActivities.map((activity) => (
                <div key={`${activity.name}-${activity.region}`} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">{activity.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.period} · {activity.region} · {activity.billingMode} · {activity.creatorTier}
                      </p>
                    </div>
                    <Badge variant="secondary">{formatMoney(activity.spend)}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <MiniMetric label="VV" value={formatNumber(activity.vv)} />
                    <MiniMetric label="投稿" value={formatNumber(activity.posts)} />
                    <MiniMetric label="达人" value={formatNumber(activity.creators)} />
                    <MiniMetric label="CPM" value={`$${calcCpm(activity.spend, activity.vv).toFixed(2)}`} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    <b>内容模板：</b>
                    {activity.contentAngle}。<b>复盘：</b>
                    {activity.review}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              同品类 Benchmark
            </CardTitle>
            <CardDescription>用于新游戏或无历史投放游戏的策略参考，也用于老游戏复投校准。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {peers.map((peer) => (
              <div key={`${peer.category}-${peer.region}`} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{peer.region} · {peer.category}</p>
                  <Badge variant="outline">CPM ${peer.avgCpm.toFixed(2)}</Badge>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <MiniMetric label="均值预算" value={formatMoney(peer.avgSpend)} />
                  <MiniMetric label="均值 VV" value={formatNumber(peer.avgVv)} />
                  <MiniMetric label="互动率" value={`${peer.avgEngagementRate.toFixed(1)}%`} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  标杆：{peer.bestCase}。{peer.insight}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GIP 策略校验框架</CardTitle>
            <CardDescription>把历史复盘学习沉淀成可复用的投放判断逻辑。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["市场", "优先选择 organic 消费高、GIP 供给不足，或同品类历史 CPM 更优的市场。"],
              ["达人", "优先中腰部稳定达人；头部达人只在节点爆发或强内容模板下使用。"],
              ["内容", "每次投放至少沉淀 2 个可复投模板：剧情/文化、挑战/攻略、直播任务或社交玩法。"],
              ["预算", "市场未定时先按 T0 小预算验证；市场明确后再把预算集中到 T1 节点。"],
              ["风控", "复盘必须看异常流量、低互动高 VV、投稿重复度和活动后长尾衰减。"],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-3 rounded-xl border p-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
