// lib/mock.ts —— Mock 数据（每种类型 1-2 条样本）
// ⚠️ 归属：Jeff。这是黄士鑫为「让骨架跑通 + Demo 端到端」放的极简 stub，
//    周末由 Jeff 扩充为正式样本库。各模块负责人可临时往自己用的类型里加样本，
//    但最终以 Jeff 的版本为准。
import type { GameMove, DiagnosisReport, GIPRecord } from "@/types/contract";

export const mockGameMoves: GameMove[] = [
  {
    gameId: "g-1001",
    name: "星海远征 (Star Voyage)",
    category: "SLG",
    moveType: "大版本",
    summary: "上线 2.0 资料片『深空纪元』，新增舰队系统与赛季玩法。",
    source: "厂商官方公告",
    date: "2026-05-28",
  },
  {
    gameId: "g-1002",
    name: "幻塔纪元 (Aether Tower)",
    category: "RPG",
    moveType: "新游",
    summary: "全球公测开启，首周冲榜，海外买量明显加码。",
    source: "App Store 榜单 + 投放监测",
    date: "2026-05-30",
  },
];

export const mockDiagnosis: Record<string, DiagnosisReport> = {
  "g-1001": {
    gameId: "g-1001",
    ecosystem: {
      metrics: { 达人合作数: 42, 视频总播放_万: 1860, 平均互动率_pct: 6.4, GMV_万U: 320 },
      cases: [
        { title: "@舰长老王 实机解说 580万播放", note: "硬核玩法向，转化高", link: "https://www.tiktok.com/" },
        { title: "#星海远征 挑战赛", note: "UGC 二创氛围好", link: "https://www.tiktok.com/" },
      ],
    },
    competitors: [
      { name: "无尽星河", comparison: "对方达人矩阵更密，但互动率低于我们 1.8pct" },
      { name: "银河指挥官", comparison: "买量为主、内容生态弱，是我们的差异化机会" },
    ],
    recommendedActions: [
      { action: "扩大中腰部 SLG 达人合作至 30+", rationale: "互动率高、性价比优，适合赛季节点放量", ttgpLink: "https://ttgp.example/" },
      { action: "围绕 2.0 大版本做挑战赛", rationale: "大版本是 UGC 爆发窗口期", ttgpLink: "https://ttgp.example/" },
    ],
  },
};

export const mockGIP: GIPRecord[] = [
  {
    gameId: "g-1001",
    game: "星海远征 (Star Voyage)",
    category: "SLG",
    vendor: "深空互动",
    period: "2026-Q1",
    budget: 1200000,
    consumption: 940000,
    activities: [
      { name: "春节达人种草", spend: 420000, period: "2026-02" },
      { name: "2.0 预热挑战赛", spend: 520000, period: "2026-03" },
    ],
  },
  {
    gameId: "g-1002",
    game: "幻塔纪元 (Aether Tower)",
    category: "RPG",
    vendor: "幻光游戏",
    period: "2026-Q1",
    budget: 800000,
    consumption: 610000,
    activities: [{ name: "公测达人首发", spend: 610000, period: "2026-03" }],
  },
];
