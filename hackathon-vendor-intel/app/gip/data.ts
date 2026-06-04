import type { GIPRecord } from "@/types/contract";

export type DeliveryShape = "节点爆发" | "长线蓄水" | "区域补供给" | "新品冷启";
export type BillingMode = "CPM" | "CPE" | "Mixed";
export type GameStage = "老游戏-有GIP历史" | "老游戏-无GIP历史" | "新游戏";

export interface GIPActivity {
  name: string;
  spend: number;
  period: string;
  region: string;
  posts: number;
  vv: number;
  creators: number;
  interactions: number;
  billingMode: BillingMode;
  creatorTier: "Head" | "Mid" | "Long-tail";
  contentAngle: string;
  review: string;
}

export interface GIPStrategyRecord extends GIPRecord {
  stage: GameStage;
  region: string;
  deliveryShape: DeliveryShape;
  organic: {
    vv: number;
    liveViewers: number;
    creators: number;
    position: "头部" | "腰部" | "观察";
  };
  activities: GIPActivity[];
}

export interface BenchmarkRecord {
  category: string;
  region: string;
  avgSpend: number;
  avgVv: number;
  avgPosts: number;
  avgCpm: number;
  avgEngagementRate: number;
  bestCase: string;
  insight: string;
}

export const mockGIPRecords: GIPStrategyRecord[] = [
  {
    gameId: "yanyun",
    game: "燕云十六声",
    category: "MMO/开放世界",
    vendor: "NetEase",
    period: "2026-Q2",
    region: "US",
    stage: "老游戏-有GIP历史",
    deliveryShape: "节点爆发",
    budget: 180000,
    consumption: 151200,
    organic: { vv: 405000000, liveViewers: 4480000, creators: 4659, position: "腰部" },
    activities: [
      {
        name: "US Launch Live Burst",
        period: "2026-04",
        region: "US",
        spend: 62000,
        posts: 380,
        vv: 22400000,
        creators: 96,
        interactions: 672000,
        billingMode: "Mixed",
        creatorTier: "Mid",
        contentAngle: "直播节点 + 武侠沉浸体验",
        review: "节点爆发强，但水分与主播质量需要在二次投放中加强筛选。",
      },
      {
        name: "DE Culture Storytelling",
        period: "2026-05",
        region: "DE",
        spend: 47000,
        posts: 260,
        vv: 18800000,
        creators: 74,
        interactions: 507600,
        billingMode: "CPM",
        creatorTier: "Mid",
        contentAngle: "文化感、剧情向短视频模板",
        review: "DE 消费占比高，适合继续做高质量短视频模板而不是粗放拉投稿。",
      },
      {
        name: "VN Creator Supply Test",
        period: "2026-05",
        region: "VN",
        spend: 42200,
        posts: 310,
        vv: 16400000,
        creators: 88,
        interactions: 574000,
        billingMode: "CPE",
        creatorTier: "Long-tail",
        contentAngle: "门派、技能、剧情切片",
        review: "VN 消费高于供给，是后续补主播和内容供给的重点市场。",
      },
    ],
  },
  {
    gameId: "elden-ring",
    game: "Elden Ring",
    category: "ARPG/硬核动作",
    vendor: "Bandai Namco",
    period: "2026-Q2",
    region: "US",
    stage: "老游戏-有GIP历史",
    deliveryShape: "长线蓄水",
    budget: 210000,
    consumption: 197000,
    organic: { vv: 1004000000, liveViewers: 30360000, creators: 13146, position: "头部" },
    activities: [
      {
        name: "DLC Challenge Route",
        period: "2026-04",
        region: "US",
        spend: 82000,
        posts: 520,
        vv: 46600000,
        creators: 140,
        interactions: 1677600,
        billingMode: "CPM",
        creatorTier: "Head",
        contentAngle: "Boss 挑战、速通与硬核攻略",
        review: "硬核挑战内容复投确定性强，适合作为 ARPG 标杆。",
      },
      {
        name: "EU Lore Creator",
        period: "2026-05",
        region: "DE",
        spend: 69000,
        posts: 360,
        vv: 31500000,
        creators: 82,
        interactions: 945000,
        billingMode: "Mixed",
        creatorTier: "Mid",
        contentAngle: "世界观解析与剧情考据",
        review: "剧情解析带来长尾搜索与收藏，适合配合版本内容。",
      },
    ],
  },
  {
    gameId: "delta-force",
    game: "Delta Force",
    category: "Shooter",
    vendor: "TiMi",
    period: "2026-Q2",
    region: "US",
    stage: "老游戏-有GIP历史",
    deliveryShape: "节点爆发",
    budget: 260000,
    consumption: 241000,
    organic: { vv: 1683000000, liveViewers: 61495000, creators: 69145, position: "头部" },
    activities: [
      {
        name: "Squad Moment Burst",
        period: "2026-04",
        region: "US",
        spend: 96000,
        posts: 820,
        vv: 58600000,
        creators: 180,
        interactions: 1992400,
        billingMode: "CPM",
        creatorTier: "Mid",
        contentAngle: "组队名场面、战术反转",
        review: "短视频模板成熟，投稿和 VV 都在头部。",
      },
      {
        name: "ID Live Supply",
        period: "2026-05",
        region: "ID",
        spend: 74000,
        posts: 410,
        vv: 32400000,
        creators: 112,
        interactions: 972000,
        billingMode: "CPE",
        creatorTier: "Mid",
        contentAngle: "直播排位与主播挑战",
        review: "ID 直播承接稳定，适合做区域补供给标杆。",
      },
    ],
  },
  {
    gameId: "sword-of-justice",
    game: "逆水寒",
    category: "MMO/开放世界",
    vendor: "NetEase",
    period: "2026-Q1",
    region: "ID",
    stage: "老游戏-有GIP历史",
    deliveryShape: "区域补供给",
    budget: 90000,
    consumption: 79200,
    organic: { vv: 68000000, liveViewers: 2418000, creators: 1751, position: "观察" },
    activities: [
      {
        name: "SEA Roleplay Test",
        period: "2026-03",
        region: "ID",
        spend: 31000,
        posts: 180,
        vv: 6900000,
        creators: 46,
        interactions: 179400,
        billingMode: "CPE",
        creatorTier: "Long-tail",
        contentAngle: "捏脸、社交、剧情二创",
        review: "规模不大但内容效率可用，适合小预算验证。",
      },
      {
        name: "MY Social Template",
        period: "2026-04",
        region: "MY",
        spend: 28200,
        posts: 156,
        vv: 5200000,
        creators: 38,
        interactions: 130000,
        billingMode: "CPE",
        creatorTier: "Long-tail",
        contentAngle: "社交关系与身份扮演",
        review: "MY 供给偏高，建议严格筛选模板质量。",
      },
    ],
  },
  {
    gameId: "new-fantasy",
    game: "Project Fantasy",
    category: "MMO/开放世界",
    vendor: "示例厂商",
    period: "2026-Q3",
    region: "US",
    stage: "新游戏",
    deliveryShape: "新品冷启",
    budget: 0,
    consumption: 0,
    organic: { vv: 32000000, liveViewers: 380000, creators: 420, position: "观察" },
    activities: [],
  },
];

export const benchmarks: BenchmarkRecord[] = [
  {
    category: "MMO/开放世界",
    region: "US",
    avgSpend: 64000,
    avgVv: 16800000,
    avgPosts: 285,
    avgCpm: 3.81,
    avgEngagementRate: 2.7,
    bestCase: "燕云十六声 US Launch Live Burst",
    insight: "US 适合节点直播爆发，但要用主播质量与异常流量校验控制水分。",
  },
  {
    category: "MMO/开放世界",
    region: "DE",
    avgSpend: 43000,
    avgVv: 12900000,
    avgPosts: 210,
    avgCpm: 3.33,
    avgEngagementRate: 2.8,
    bestCase: "燕云十六声 DE Culture Storytelling",
    insight: "DE 更吃文化感、剧情向短视频，适合少量高质模板先行。",
  },
  {
    category: "MMO/开放世界",
    region: "VN",
    avgSpend: 36000,
    avgVv: 11200000,
    avgPosts: 230,
    avgCpm: 3.21,
    avgEngagementRate: 3.3,
    bestCase: "燕云十六声 VN Creator Supply Test",
    insight: "VN 具备高消费低供给特征，适合补中腰部达人和稳定直播供给。",
  },
  {
    category: "ARPG/硬核动作",
    region: "US",
    avgSpend: 79000,
    avgVv: 40800000,
    avgPosts: 440,
    avgCpm: 1.94,
    avgEngagementRate: 3.4,
    bestCase: "Elden Ring DLC Challenge Route",
    insight: "ARPG 更依赖挑战、攻略、Boss 名场面，复投应围绕高复用模板。",
  },
  {
    category: "Shooter",
    region: "US",
    avgSpend: 91000,
    avgVv: 51200000,
    avgPosts: 720,
    avgCpm: 1.78,
    avgEngagementRate: 3.2,
    bestCase: "Delta Force Squad Moment Burst",
    insight: "Shooter 的爆点来自组队反转和高频名场面，适合节点集中爆发。",
  },
  {
    category: "Shooter",
    region: "ID",
    avgSpend: 69000,
    avgVv: 28600000,
    avgPosts: 390,
    avgCpm: 2.41,
    avgEngagementRate: 3.0,
    bestCase: "Delta Force ID Live Supply",
    insight: "ID 直播承接强，适合补开播供给并做活动期看播时长目标。",
  },
];

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const calcCpm = (spend: number, vv: number) => (vv > 0 ? (spend / vv) * 1000 : 0);

export const calcEngagementRate = (interactions: number, vv: number) =>
  vv > 0 ? (interactions / vv) * 100 : 0;
