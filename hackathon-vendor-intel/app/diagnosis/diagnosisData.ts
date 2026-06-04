import fs from "fs/promises";
import path from "path";

export type DocumentBlock =
  | {
      type: "sectionHeader";
      title: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "bulletList";
      items: string[];
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "callout";
      variant: "info" | "warning" | "success";
      title?: string;
      text: string;
    };

export type DiagnosisDocument = {
  gameId: string;
  gameName: string;
  title: string;
  subtitle: string;
  badge: string;
  sourceUrl?: string;
  summary?: {
    headline: string;
    conclusion: string;
    priorityActions: string[];
    talkTrack?: string;
  };
  kpis?: { label: string; value: string; note: string }[];
  marketBars?: { market: string; shortVideo: number; live: number }[];
  charts?: {
    title: string;
    unit: string;
    color?: string;
    rows: { name: string; value: number }[];
  }[];
  blocks: DocumentBlock[];
};

export const diagnosisDocument: DiagnosisDocument = {
  gameId: "nte",
  gameName: "NTE",
  title: "NTE 在 TikTok 上的生态位分析（近3个月）",
  subtitle: "平台 + 竞品对比 + 推荐营销动作",
  badge: "负责人：Rena",
  blocks: [
    {
      type: "callout",
      variant: "success",
      title: "总体判断：直播驱动型",
      text:
        "NTE 当前更接近直播驱动型，现在仍值得继续投达人激励预算，但预算不适合做全局粗放加码，更适合按直播扩张 + 短视频提效的思路做结构性投入。"
    },
    {
      type: "bulletList",
      items: [
        "直播侧已经跑出较强承接，短视频侧则有供给基础但内容效率仍有优化空间。",
        "本页输出已按文档模块固定格式组织，后续可直接更新原始数据并渲染到相应模块。"
      ]
    },
    {
      type: "sectionHeader",
      title: "维度定位"
    },
    {
      type: "table",
      headers: ["维度", "值", "在竞品中的位置", "当前判断", "预算含义"],
      rows: [
        ["短视频消费", "12.71 亿 VV", "第 3", "有规模，但离头部仍远", "适合继续投，但更应做国家与达人筛选"],
        ["短视频供给", "34.49 万投稿", "第 3", "供给不算少", "不建议只靠加量解决问题"],
        ["短视频单位供给产出", "3685 VV/投稿", "第 4", "内容效率偏弱", "预算应更多投向高质量达人和内容题材"],
        ["直播消费", "2235.31 万分钟", "第 2", "已形成较强看播承接", "可以继续追加直播侧资源"],
        ["直播供给", "4.49 万开播主播日", "第 2", "供给规模已进入前列", "适合做头部与中腰部主播的结构扩张"],
        ["直播单位供给产出", "497.6 分钟/主播日", "第 2", "供给承接效率较强", "继续投直播预算有明确数据支撑"]
      ]
    },
    {
      type: "sectionHeader",
      title: "短视频生态分析"
    },
    {
      type: "paragraph",
      text:
        "NTE 的短视频状态可以概括为：量已经不低，但还不是高效率内容生态。它在本次竞品集合中消费和供给都排第 3，但单位供给产出只排第 4。这个结构说明短视频侧不是‘没有达人’，而是‘达人和内容的单位产出还不够高’。"
    },
    {
      type: "paragraph",
      text:
        "从趋势上看，NTE 在 4 月到 5 月之间有明显放大：4 月短视频 VV 为 4.75 亿，5 月升至 7.78 亿；对应条均 VV 也从 3157 提升到 4092。这说明短视频侧不是完全没有增长反应，预算继续投入仍有意义，但更适合围绕高质量内容与高回报市场做优化，而不是继续平均铺量。"
    },
    {
      type: "image",
      src: "https://via.placeholder.com/1200x560?text=%E7%9F%AD%E8%A7%86%E9%A2%91%E5%9B%BD%E5%AE%B6%E7%BB%93%E6%9E%84%E5%9B%BE",
      alt: "短视频国家结构图示例",
      caption: "图：短视频国家结构" 
    },
    {
      type: "table",
      headers: ["游戏", "3M总VV", "3M日均VV", "3M总投稿数", "3M日均投稿数", "条均VV", "消费排名", "供给排名"],
      rows: [
        ["Genshin Impact", "100.51 亿", "2534.31 万", "59.01 万", "6485", "3908", "2", "2"],
        ["NTE", "12.71 亿", "1396.68 万", "34.49 万", "3790", "3685", "3", "3"],
        ["Zenless Zone Zero", "6.26 亿", "687.45 万", "9.90 万", "1088", "6321", "4", "4"],
        ["Wuthering Waves", "3.57 亿", "391.91 万", "6.28 万", "690", "5683", "5", "5"]
      ]
    },
    {
      type: "sectionHeader",
      title: "直播生态分析"
    },
    {
      type: "paragraph",
      text:
        "直播是 NTE 当前最强的生态抓手。近 3 个月内，NTE 的总看播时长 2235.31 万分钟、总开播主播日 4.49 万，两项都排第 2；同时单位供给产出 497.6 分钟/主播日也排第 2。这说明直播不是‘是否值得做’，而是‘如何继续放大已被验证的承接能力’。"
    },
    {
      type: "image",
      src: "https://via.placeholder.com/1200x560?text=%E7%9B%B4%E6%92%AD%E7%BB%93%E6%9E%84%E5%9B%BE%E7%A4%BA%E4%BE%8B",
      alt: "直播国家结构图示例",
      caption: "图：直播国家结构"
    },
    {
      type: "table",
      headers: ["游戏", "3M总看播时长", "3M日均看播时长", "3M总开播主播日", "3M日均开播主播日", "单位供给产出", "消费排名", "供给排名", "单位供给产出排名"],
      rows: [
        ["Genshin Impact", "1.29 亿分钟", "141.96 万分钟", "30.02 万", "3298.9", "430.3", "1", "1", "3"],
        ["NTE", "2235.31 万分钟", "24.56 万分钟", "4.49 万", "493.7", "497.6", "2", "2", "2"],
        ["Wuthering Waves", "1542.91 万分钟", "16.96 万分钟", "1.94 万", "213.5", "794.2", "3", "4", "1"],
        ["Honkai: Star Rail", "1321.61 万分钟", "14.52 万分钟", "3.78 万", "415.7", "349.3", "4", "3", "5"],
        ["Zenless Zone Zero", "392.52 万分钟", "4.31 万分钟", "0.98 万", "107.9", "399.8", "5", "5", "4"]
      ]
    },
    {
      type: "callout",
      variant: "info",
      title: "指标解释：你提到的“效率排名”到底是什么",
      text:
        "这里不再使用“效率排名”这个模糊说法，统一改成 单位供给产出排名。短视频：单位供给产出 = 总 VV / 总投稿数。直播：单位供给产出 = 看播时长 / 开播主播日。"
    },
    {
      type: "sectionHeader",
      title: "是否值得继续投达人激励预算"
    },
    {
      type: "paragraph",
      text:
        "值得继续投，但应该是结构性预算，而不是粗放预算。NTE 当前最有说服力的地方在于：直播侧已经证明了供给扩张能够带动消费扩张。NTE 在直播上已经进入竞品集合前 2，而短视频虽然还没到头部，但也已经具备中上规模。"
    }
  ]
};

const bloodStrikeDocument: DiagnosisDocument = {
  gameId: "blood-strike",
  gameName: "Blood Strike",
  title: "Blood Strike TikTok 生态分析",
  subtitle: "强区域爆发 + 竞品对比 + 区域化预算建议",
  badge: "负责人：Rena",
  sourceUrl: "https://bytedance.larkoffice.com/docx/FNmxd2rWDoaKUax633nc7ng3nEg",
  summary: {
    headline: "建议继续投，但围绕强势区域集中加码",
    conclusion:
      "Blood Strike 区域爆发力强，但全球总盘仍明显落后于顶级射击头部。短视频侧高效率低规模，直播侧高度依赖 PH / ID / MX 等少数核心市场。",
    priorityActions: ["短视频创作者扩量", "PH / ID / MX 直播活动化", "Mexico campaign 放大"],
    talkTrack:
      "Blood Strike 在 TikTok 上不是没有竞争力，问题不在内容没人看，而在于当前的内容与直播规模还没有扩到头部射击游戏的量级。短视频侧已经证明单条内容有很强承接能力，条均vv在核心竞品里反而是最高的，所以更适合继续补创作者规模，优先放大 ID、MX、US、BR、CO 这些已经有消费基础的市场。直播侧则是典型的区域强盘，PH、ID、MX 已经形成核心看播基本盘，Mexico 的 campaign 也已经验证过活动能把直播消费快速拉起来，因此后续预算更建议围绕这些核心市场做集中投放和活动牵引，而不是全球平均铺开。"
  },
  kpis: [
    { label: "短视频总 VV", value: "51.72 亿", note: "竞品第 4 / 5" },
    { label: "短视频投稿", value: "269.24 万", note: "供给第 4 / 5" },
    { label: "条均 VV", value: "1921", note: "竞品组最高" },
    { label: "直播看播", value: "2.37 亿 min", note: "竞品第 4 / 5" }
  ],
  marketBars: [
    { market: "PH", shortVideo: 74, live: 100 },
    { market: "ID", shortVideo: 100, live: 86 },
    { market: "MX", shortVideo: 92, live: 78 },
    { market: "US", shortVideo: 76, live: 48 },
    { market: "BR", shortVideo: 72, live: 45 },
    { market: "CO", shortVideo: 70, live: 18 }
  ],
  charts: [
    {
      title: "短视频竞品 VV 对比",
      unit: "亿 VV",
      color: "bg-primary",
      rows: [
        { name: "Free Fire", value: 1698.7 },
        { name: "PUBG Mobile", value: 595.09 },
        { name: "Call of Duty: Mobile", value: 80.89 },
        { name: "Blood Strike", value: 51.72 },
        { name: "Standoff 2", value: 17.1 }
      ]
    },
    {
      title: "直播看播规模对比",
      unit: "亿 min",
      color: "bg-emerald-500",
      rows: [
        { name: "Free Fire", value: 55.08 },
        { name: "PUBG Mobile", value: 37.33 },
        { name: "Call of Duty: Mobile", value: 11.01 },
        { name: "Blood Strike", value: 2.37 },
        { name: "Standoff 2", value: 0.23 }
      ]
    }
  ],
  blocks: [
    {
      type: "callout",
      variant: "success",
      title: "总体判断：强区域爆发、弱全球总盘",
      text:
        "Blood Strike 短视频侧内容承接效率已具竞争力，但消费规模和创作者规模仍明显落后于移动射击头部；直播侧消费与供给集中在 PH / ID / MX，适合区域化经营与活动化放大。"
    },
    {
      type: "sectionHeader",
      title: "1. 分析范围与口径"
    },
    {
      type: "bulletList",
      items: [
        "统计周期：近三个月，2026-03-04 至 2026-06-02，共 91 天。",
        "默认竞品：Free Fire、PUBG Mobile、Call of Duty: Mobile、Standoff 2。",
        "分析模块：短视频 + 直播。"
      ]
    },
    {
      type: "sectionHeader",
      title: "2. 执行摘要"
    },
    {
      type: "paragraph",
      text:
        "Blood Strike 区域爆发力强，但全球总盘仍明显落后于顶级射击头部；短视频侧高效率低规模，直播侧高度依赖少数核心市场。建议继续投达人激励预算，但不适合全球平均铺量，更适合围绕强势区域集中加码。"
    },
    {
      type: "sectionHeader",
      title: "3. 核心判断"
    },
    {
      type: "bulletList",
      items: [
        "总体标签：强区域爆发、弱全球总盘。",
        "短视频判断：内容承接效率已具竞争力，但消费规模和创作者规模仍明显落后于移动射击头部。",
        "直播判断：消费与供给集中在 PH / ID / MX，整体规模仅约为竞品中位数的 10%。",
        "核心矛盾：短视频的问题在总量不足但内容效率可用，直播的问题在区域过于集中且全球扩张能力不足。"
      ]
    },
    {
      type: "sectionHeader",
      title: "4. 短视频生态分析"
    },
    {
      type: "paragraph",
      text:
        "短视频适合在强势区域继续扩量，而不是保守收缩。Blood Strike 总 VV 与投稿规模均处于第 4 / 5，但条均 VV 为竞品组最高，说明内容承接效率已过线。"
    },
    {
      type: "table",
      headers: ["游戏", "总 VV", "日均 VV", "总投稿数", "日均投稿数", "条均 VV"],
      rows: [
        ["Free Fire", "1698.70 亿", "18.67 亿", "1.65 亿", "181.22 万", "1030"],
        ["PUBG Mobile", "595.09 亿", "6.54 亿", "3552.65 万", "39.04 万", "1675"],
        ["Call of Duty: Mobile", "80.89 亿", "8889 万", "773.07 万", "8.50 万", "1046"],
        ["Blood Strike", "51.72 亿", "5683 万", "269.24 万", "2.96 万", "1921"],
        ["Standoff 2", "17.10 亿", "1879 万", "109.98 万", "1.21 万", "1555"]
      ]
    },
    {
      type: "bulletList",
      items: [
        "US、CO、BR 属于高消费低供给国家，存在增量空间。",
        "MX、ID 是当前短视频放大的基础盘。",
        "内容方向适合高光剪辑、击杀秀、局内互动类模板。"
      ]
    },
    {
      type: "sectionHeader",
      title: "5. 直播生态分析"
    },
    {
      type: "paragraph",
      text:
        "直播已经形成清晰核心市场，但规模与头部移动射击游戏差距仍大。PH 是最明确的高消费低供给市场，ID 也存在供给补强空间，MX 与 BR 更适合继续优化活动效率与内容承接。"
    },
    {
      type: "table",
      headers: ["游戏", "总看播时长", "总看播人数", "总开播主播", "单位开播产出"],
      rows: [
        ["Free Fire", "55.08 亿 min", "44.44 亿", "321.69 万", "1712"],
        ["PUBG Mobile", "37.33 亿 min", "20.20 亿", "89.35 万", "4179"],
        ["Call of Duty: Mobile", "11.01 亿 min", "6.15 亿", "51.19 万", "2151"],
        ["Blood Strike", "2.37 亿 min", "1.65 亿", "13.89 万", "1709"],
        ["Standoff 2", "2324 万 min", "1677 万", "2.01 万", "1156"]
      ]
    },
    {
      type: "sectionHeader",
      title: "6. 国家结构与重点市场"
    },
    {
      type: "bulletList",
      items: [
        "短视频优先：ID、MX、US、BR、CO。",
        "直播优先：PH、ID、MX。",
        "第一梯队预算市场：PH、ID、MX。",
        "第二梯队预算市场：US、BR、CO；观察验证：VN。"
      ]
    },
    {
      type: "sectionHeader",
      title: "7. 预算建议"
    },
    {
      type: "bulletList",
      items: [
        "建议继续投达人激励预算。",
        "短视频条均 VV 是竞品组最高，说明内容效率已过线。",
        "直播在 PH / ID / MX 已形成明确消费基本盘。",
        "Mexico LIVE campaign 已验证活动可显著放大直播消费。",
        "短视频侧优先做创作者扩量；直播侧优先做 PH / ID / MX 的活动化经营和主播牵引。"
      ]
    },
    {
      type: "sectionHeader",
      title: "8. 对项目方可直接复用的话术"
    },
    {
      type: "paragraph",
      text:
        "Blood Strike 在 TikTok 上不是没有竞争力，问题不在内容没人看，而在于当前的内容与直播规模还没有扩到头部射击游戏的量级。短视频侧已经证明单条内容有很强承接能力，条均 VV 在核心竞品里反而是最高的，所以更适合继续补创作者规模，优先放大 ID、MX、US、BR、CO 这些已经有消费基础的市场。直播侧则是典型的区域强盘，PH、ID、MX 已经形成核心看播基本盘，Mexico 的 campaign 也已经验证过活动能把直播消费快速拉起来，因此后续预算更建议围绕这些核心市场做集中投放和活动牵引，而不是全球平均铺开。"
    }
  ]
};

const eggyPartyDocument: DiagnosisDocument = {
  gameId: "eggy-party",
  gameName: "Eggy Party",
  title: "蛋仔派对在 TikTok 上的生态分析文档",
  subtitle: "短视频有基础 + 直播偏弱 + 预算结构优化",
  badge: "负责人：Rena",
  sourceUrl: "https://bytedance.larkoffice.com/docx/AYkjd5fXuoeHTDxAAk8c0d5snZd",
  summary: {
    headline: "可以继续投，但短视频优先级高于直播",
    conclusion:
      "蛋仔派对当前更接近短视频有基础、直播偏弱的生态位。短视频消费、供给、条均 VV 均位于竞品第 3 位，已经具备中位生态基础；直播总看播时长第 4、单位开播产出第 5，承接弱于短视频。",
    priorityActions: ["短视频高回报国家提效", "直播核心市场结构优化", "避免全局粗放扩量"],
    talkTrack:
      "蛋仔派对在 TikTok 上不是没有生态。短视频已经有消费和供给基础，后续可以继续投，但重点放在高回报国家的达人提效；直播还没有跑到同等级位置，预算可以补，但优先级低于短视频，更适合先集中在核心消费盘做结构优化，而不是全局扩量。"
  },
  kpis: [
    { label: "短视频总 VV", value: "2.13 亿", note: "消费第 3 / 5" },
    { label: "短视频投稿", value: "10.69 万", note: "供给第 3 / 5" },
    { label: "条均 VV", value: "1990", note: "条均第 3 / 5" },
    { label: "直播看播", value: "236.9 万 min", note: "消费第 4 / 5" }
  ],
  marketBars: [
    { market: "TW", shortVideo: 100, live: 100 },
    { market: "ID", shortVideo: 88, live: 86 },
    { market: "US", shortVideo: 78, live: 20 },
    { market: "JP", shortVideo: 70, live: 76 },
    { market: "TH", shortVideo: 28, live: 72 },
    { market: "MY", shortVideo: 22, live: 62 }
  ],
  charts: [
    {
      title: "短视频核心指标",
      unit: "",
      color: "bg-primary",
      rows: [
        { name: "总 VV（亿）", value: 2.13 },
        { name: "总投稿（万）", value: 10.69 },
        { name: "条均 VV（千）", value: 1.99 }
      ]
    },
    {
      title: "直播核心指标",
      unit: "",
      color: "bg-emerald-500",
      rows: [
        { name: "看播时长（万 min）", value: 236.93 },
        { name: "看播人数（万）", value: 195.12 },
        { name: "开播主播", value: 17612 },
        { name: "单位产出", value: 134.53 }
      ]
    }
  ],
  blocks: [
    {
      type: "callout",
      variant: "success",
      title: "总体判断：短视频有基础、直播偏弱",
      text:
        "蛋仔派对达人激励预算可以继续投，但不适合全局粗放投放。预算优先放在短视频高回报国家提效，其次再补直播消费更集中的核心市场。"
    },
    {
      type: "sectionHeader",
      title: "1. 分析范围与口径"
    },
    {
      type: "bulletList",
      items: [
        "统计周期：近三个月，2026-03-03 至 2026-06-01，共 91 天。",
        "默认竞品：Roblox、Stumble Guys、Fall Guys: Ultimate Knockout、Party Animals。",
        "分析模块：短视频 + 直播。"
      ]
    },
    {
      type: "sectionHeader",
      title: "2. 核心判断"
    },
    {
      type: "bulletList",
      items: [
        "总体标签：短视频有基础、直播偏弱。",
        "短视频判断：短视频消费、供给、条均 VV 均位于竞品第 3 位，已经具备中位生态基础。",
        "直播判断：直播总看播时长第 4、总开播主播第 3、单位开播产出第 5，直播承接弱于短视频。",
        "核心矛盾：短视频已经有基础，直播还没有跑到同等级位置，预算打法不能短直同权重推进。"
      ]
    },
    {
      type: "sectionHeader",
      title: "3. 短视频生态位分析"
    },
    {
      type: "paragraph",
      text:
        "短视频不是没有量，而是已经有一定体量，但和头部竞品相比仍处在第二梯队。后续预算优先做高回报国家提效。"
    },
    {
      type: "table",
      headers: ["指标", "数值", "排名", "判断"],
      rows: [
        ["总 VV", "2.13 亿", "第 3 / 5", "已有一定消费底盘"],
        ["日均 VV", "233.79 万", "-", "可支撑持续内容测试"],
        ["总投稿数", "10.69 万", "第 3 / 5", "供给规模进入竞品中位"],
        ["日均投稿数", "1175", "-", "供给稳定但未到头部"],
        ["条均 VV", "1990", "第 3 / 5", "内容效率中位"]
      ]
    },
    {
      type: "bulletList",
      items: [
        "短视频重点消费国家：TW、ID、US、JP、PK。",
        "短视频高回报 / 供给重点市场：TW、ID、US。",
        "短视频预算优先做高回报国家提效，不建议继续平均铺量。"
      ]
    },
    {
      type: "sectionHeader",
      title: "4. 直播生态位分析"
    },
    {
      type: "paragraph",
      text:
        "直播还没有跑到短视频同等级的位置。预算可以投，但优先级要低于短视频，更适合先收紧结构、聚焦高承接市场。"
    },
    {
      type: "table",
      headers: ["指标", "数值", "排名", "判断"],
      rows: [
        ["总看播时长", "236.93 万 min", "第 4 / 5", "直播消费偏弱"],
        ["日均看播时长", "2.60 万 min", "-", "规模仍小"],
        ["总看播人数", "195.12 万", "-", "用户触达有限"],
        ["总开播主播", "1.76 万", "第 3 / 5", "供给不算最低"],
        ["单位开播产出", "134.53", "第 5 / 5", "承接效率偏弱"]
      ]
    },
    {
      type: "bulletList",
      items: [
        "直播重点消费国家：TW、ID、TH、JP、MY。",
        "直播高回报 / 供给重点市场：TW、ID、JP。",
        "直播预算适合做核心消费盘结构优化，而不是全局扩量。"
      ]
    },
    {
      type: "sectionHeader",
      title: "5. 预算建议"
    },
    {
      type: "bulletList",
      items: [
        "建议继续投达人激励预算。",
        "优先顺序：短视频 > 直播。",
        "短视频聚焦 TW、ID、US。",
        "直播聚焦 TW、ID、JP。",
        "策略组合：短视频提效预算 + 直播结构优化预算。"
      ]
    },
    {
      type: "sectionHeader",
      title: "6. 对项目方可直接复用的话术"
    },
    {
      type: "paragraph",
      text:
        "蛋仔派对在 TikTok 上不是没有生态。短视频已经有消费和供给基础，后续可以继续投，但重点放在高回报国家的达人提效；直播还没有跑到同等级位置，预算可以补，但优先级低于短视频，更适合先集中在核心消费盘做结构优化，而不是全局扩量。"
    }
  ]
};

const diagnosisDocuments: Record<string, DiagnosisDocument> = {
  nte: diagnosisDocument,
  bloodstrike: bloodStrikeDocument,
  "blood-strike": bloodStrikeDocument,
  eggy: eggyPartyDocument,
  eggyparty: eggyPartyDocument,
  "eggy-party": eggyPartyDocument,
};

const markdownDocuments: Record<string, { gameName: string; fileName: string; sourceUrl?: string }> = {
  yanyun: {
    gameName: "燕云十六声",
    fileName: "diagnosis-yanyun.md",
    sourceUrl: "https://bytedance.larkoffice.com/docx/Z1VGdZILDo5bEyxD0XncVMlen7z"
  }
};

function normalizeGameId(gameId: string) {
  return gameId?.trim()?.toLowerCase?.().replace(/\s+/g, "-") ?? "";
}

function cleanInlineText(text: string) {
  return text
    .replace(/\[\^\d+\]/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDiagnosisMarkdown(content: string) {
  const lines = content.split(/\r?\n/);
  const blocks: DocumentBlock[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];
  let currentTable: string[][] = [];
  let tableHeaders: string[] | null = null;
  let title = "";

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", text: cleanInlineText(currentParagraph.join(" ")) });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "bulletList", items: currentList });
      currentList = [];
    }
  };

  const flushTable = () => {
    if (tableHeaders && currentTable.length > 0) {
      blocks.push({ type: "table", headers: tableHeaders, rows: currentTable });
    }
    tableHeaders = null;
    currentTable = [];
  };

  const pushHeading = (text: string) => {
    const cleaned = cleanInlineText(text.replace(/^#+/, "").trim());
    flushParagraph();
    flushList();
    flushTable();
    blocks.push({ type: "sectionHeader", title: cleaned });
  };

  const parseTableRow = (line: string) => {
    const columns = line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cleanInlineText(cell.trim()));
    return columns;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (/^\[\^\d+\]:/.test(line)) {
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      flushTable();
      blocks.push({ type: "image", alt: imageMatch[1] || "image", src: imageMatch[2], caption: imageMatch[1] || undefined });
      continue;
    }

    if (/^#{2,4}\s+/.test(line)) {
      if (!title && line.startsWith("## ")) {
        title = cleanInlineText(line.replace(/^##\s+/, "").trim());
        continue;
      }
      pushHeading(line);
      continue;
    }

    if (/^([-*]|\d+\.)\s+/.test(line)) {
      const item = cleanInlineText(line.replace(/^([-*]|\d+\.)\s+/, "").trim());
      if (item) {
        currentList.push(item);
      }
      continue;
    }

    if (/^\|.*\|$/.test(line)) {
      if (i + 1 < lines.length && /^\|\s*[-:]+/.test(lines[i + 1].trim())) {
        tableHeaders = parseTableRow(line);
        i += 1;
        continue;
      }

      if (tableHeaders) {
        currentTable.push(parseTableRow(line));
        continue;
      }
    }

    if (tableHeaders) {
      flushTable();
    }

    currentParagraph.push(cleanInlineText(line));
  }

  flushParagraph();
  flushList();
  flushTable();

  return { title, blocks };
}

async function loadMarkdownDocument(gameId: string, def: { gameName: string; fileName: string; sourceUrl?: string }) {
  const filePath = path.join(process.cwd(), "app", "diagnosis", def.fileName);
  try {
    const text = await fs.readFile(filePath, "utf-8");
    const { title, blocks } = parseDiagnosisMarkdown(text);
    return {
      gameId,
      gameName: def.gameName,
      title: title || def.gameName,
      subtitle: "平台 + 竞品对比 + 推荐营销动作",
      badge: "负责人：Rena",
      sourceUrl: def.sourceUrl,
      blocks
    };
  } catch (error) {
    return diagnosisDocument;
  }
}

export async function getDiagnosisDocument(gameId: string) {
  const normalized = normalizeGameId(gameId);
  if (diagnosisDocuments[normalized]) {
    return diagnosisDocuments[normalized];
  }

  if (markdownDocuments[normalized]) {
    return await loadMarkdownDocument(normalized, markdownDocuments[normalized]);
  }

  return diagnosisDocument;
}

export const availableDiagnosisGames = [
  ...Object.values(diagnosisDocuments).map((doc) => ({ gameId: doc.gameId, gameName: doc.gameName, title: doc.title })),
  ...Object.entries(markdownDocuments).map(([gameId, def]) => ({ gameId, gameName: def.gameName, title: `${def.gameName} 生态分析` }))
];
