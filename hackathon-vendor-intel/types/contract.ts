// types/contract.ts —— 数据契约（全员共识）
// ⚠️ 归属：Jeff。本文件由黄士鑫从 PRD 里抄录文档既定版本作为「可运行 stub」，
//    让骨架能立即 npm run dev 跑通。周末由 Jeff 正式冻结/替换，改动要群里喊一声。
//    其他人：只读，不要改本文件。

// ① 情报抓取：最近有动作的游戏
export interface GameMove {
  gameId: string;
  name: string;
  category: string;                 // 品类
  moveType: "新游" | "版本更新" | "大版本" | "活动";
  summary: string;                  // 动作摘要
  source: string;                   // 情报来源
  date: string;
}

// ② 平台诊断报告
export interface DiagnosisReport {
  gameId: string;
  ecosystem: {                      // 该游戏在平台的生态
    metrics: Record<string, number>;                          // 数据
    cases: { title: string; link?: string; note: string }[];  // 案例
  };
  competitors: { name: string; comparison: string }[];        // 竞品对比
  recommendedActions: { action: string; rationale: string; ttgpLink?: string }[]; // 推荐营销动作
}

// ③ GIP 数据
export interface GIPRecord {
  gameId: string;
  game: string;
  category: string;                 // 品类
  vendor: string;                   // 厂商
  period: string;                   // 时段，如 2026-Q1
  budget: number;
  consumption: number;
  activities: { name: string; spend: number; period: string }[]; // 活动消耗明细
}
