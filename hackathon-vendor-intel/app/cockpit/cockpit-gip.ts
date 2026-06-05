// app/cockpit/cockpit-gip.ts —— 驾驶舱「经营诊断」屏复用 GIP 模块真实数据的 client 适配层。
// app/gip/data.ts 是 client-safe（只引类型、无 fs），直接复用其 records / benchmarks / 计算工具；
// getStrategy / getBenchmarks 是 app/gip/page.tsx 里的纯逻辑，这里原样移植（不改 GIP 产品逻辑）。

import {
  benchmarks,
  calcCpm,
  calcEngagementRate,
  formatMoney,
  formatNumber,
  mockGIPRecords,
  type BenchmarkRecord,
  type GIPStrategyRecord,
} from "@/app/gip/data";

export { formatMoney, formatNumber, calcCpm, calcEngagementRate };
export type { BenchmarkRecord, GIPStrategyRecord };

export function resolveGipRecord(gameId?: string): GIPStrategyRecord | null {
  if (!gameId) return null;
  return mockGIPRecords.find((r) => r.gameId === gameId) ?? null;
}

export function getBenchmarks(record: GIPStrategyRecord): BenchmarkRecord[] {
  const exact = benchmarks.filter((item) => item.category === record.category);
  return exact.length > 0 ? exact : benchmarks;
}

export type GipStrategy = ReturnType<typeof getStrategy>;

// —— 原样移植自 app/gip/page.tsx 的 getStrategy（纯计算，含 T0/T1/T2 节点预算）——
export function getStrategy(record: GIPStrategyRecord, peers: BenchmarkRecord[]) {
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
      { name: "T0 预热验证", budget: t0, market: hasHistory ? record.region : peerRegions, action: "验证 2-3 个内容模板，筛掉低互动达人与异常流量。" },
      { name: "T1 节点爆发", budget: t1, market: peerRegions, action: "集中投中腰部达人和直播供给，拉活动期 VV、投稿和看播。" },
      { name: "T2 复盘复投", budget: t2, market: bestPeer.region, action: "只复投 CPM、互动率、投稿效率达标的模板与达人。" },
    ],
  };
}
