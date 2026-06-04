// types/contract.contentRadar.ts
// ───────────────────────────────────────────────────────────────
// 模块「内容雷达」（Jeff 负责）的数据契约。
// PRD v2 新增模块，repo 当前 contract.ts 未覆盖。本文件为「纯增量」：
// 独立新文件，不改动共享的 types/contract.ts，因此不触发铁律冲突。
// 待团队确认 v2 后，可由 Jeff 合并进 contract.ts 并群里喊一声。
// 下游：诊断报告可消费 ContentRadarDetail.contentTypes 里 isGap 的"内容缺口"信号。
// ───────────────────────────────────────────────────────────────

/** 功能1：单条视频的「为什么火」分析（内容速览片的卡片单元） */
export interface VideoInsight {
  id: string;
  url: string;
  author: string;
  caption: string;
  vv: number;                 // 播放量（功能2 气泡大小依据）
  likes: number;
  comments?: number;
  coverUrl: string;           // 封面帧（降级多模态时喂这个）
  videoFile?: string | null;  // 本地 mp4 相对路径（拿得到就喂原片给多模态）
  music: string | null;
  durationSec: number | null;
  // —— AI 产出 ——
  whyViral: {
    hook: string;             // 钩子：前 3 秒 / 视觉抓点
    meme: string;             // 梗 / 玩法 / 内容形态
    music: string;            // 音乐 / sound 起的作用
    pacing: string;           // 节奏 / 结构
    oneLine: string;          // 一句话总结（卡片正面展示这句）
  };
}

/** 功能2：内容类型气泡（Apple Music 曲风气泡风格） */
export interface ContentTypeBubble {
  tag: string;                // 内容类型标签（AI 定义，如"操作高光""角色二创""搞笑梗"）
  vvShare: number;            // 0–1，该类型 vv 占总 vv 比例 → 决定气泡大小
  videoCount: number;
  exampleVideoIds: string[];  // 代表视频，点气泡可下钻
  isGap?: boolean;            // 是否"内容缺口"（竞品强、本游戏弱）→ 喂诊断模块
  note: string;               // 一句"这类还能怎么做"
}

/** 内容雷达详情页的完整产出：喂前端渲染，也可被诊断模块消费 */
export interface ContentRadarDetail {
  gameId: string;
  gameName: string;
  topVideos: VideoInsight[];          // 功能1：top N + 为什么火
  contentTypes: ContentTypeBubble[];  // 功能2：类型气泡（含缺口标记）
  generatedAt: string;                // ISO 时间戳（外部传入，生成器内不取系统时间）
}
