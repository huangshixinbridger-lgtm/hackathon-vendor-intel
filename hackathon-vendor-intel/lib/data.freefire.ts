// lib/data.freefire.ts —— Free Fire 真实数据（hero 游戏，纯增量）
// VV/item_id：TikTok 全球 Top10 真实榜单（2026-06-04）。
// caption/作者/音乐/互动数：经登录态浏览器抓取的真实数据。
// whyViral / contentTypes：基于真实 caption + 互动数据的内容分析（预烤）。
import type { ContentRadarDetail, VideoInsight } from "@/types/contract.contentRadar";

const EMBED = (id: string) => `https://www.tiktok.com/embed/v2/${id}`;

const topVideos: VideoInsight[] = [
  {
    id: "7643755378395630849", url: EMBED("7643755378395630849"),
    author: "TikTok LIVE MENA (@tiktoklive_mena)",
    caption: "只有跨越一切挑战的人才能成为真正的传奇 ⚔️✨ 进入传奇竞技场，用 #HallofLegends 分享你的传奇时刻。#TikTokLIVEMENA（阿拉伯语原文）",
    vv: 62932486, likes: 115800, comments: 325, coverUrl: "", music: "original sound - TikTok LIVE MENA", durationSec: null,
    whyViral: {
      hook: "“成为真正传奇”的史诗叙事开场 + #HallofLegends 话题召集",
      meme: "平台官方赛事活动，号召用户晒高光投稿",
      music: "官方原声，氛围向",
      pacing: "活动召集式，非剧情节奏",
      oneLine: "官方 #HallofLegends 赛事活动撬动的话题流量——播放最高(62.9M)但互动率偏低，是活动曝光、不是自来水内容",
    },
  },
  {
    id: "7639791467212393748", url: EMBED("7639791467212393748"),
    author: "Garena Free Fire ID (@freefirebgid) · 官方号",
    caption: "beginilah kalo ngerush ga tau jumlah musuh 🗿（不看人数硬冲就是这下场）#FreeFire #FreeFireMAX #FF",
    vv: 37939320, likes: 2300000, comments: 33700, coverUrl: "", music: "original sound - Garena Free Fire ID", durationSec: null,
    whyViral: {
      hook: "“不看人数硬 rush”的翻车名场面预期",
      meme: "🗿 表情包文化 + 翻车名场面，全玩家秒懂",
      music: "原声解说",
      pacing: "短平快翻车梗，结尾留笑点",
      oneLine: "官方号亲自玩梗——‘盲目 rush 翻车’名场面，53万转发证明‘可复述的笑点’最易裂变（全样本最高赞 230万）",
    },
  },
  {
    id: "7633668596908051732", url: EMBED("7633668596908051732"),
    author: "ISTRI TAYO KENZI (@aynii.06)",
    caption: "bisa hidupin sendiri 😭（居然能自己复活）#dola #id #freefire",
    vv: 33086697, likes: 142200, comments: 3553, coverUrl: "", music: "suara asli - ISTRI TAYO KENZI", durationSec: null,
    whyViral: {
      hook: "“居然能自己复活😭”的反常识结果钩子",
      meme: "#dola 创作者趋势 + 极限自救操作",
      music: "原声",
      pacing: "高光片段直给",
      oneLine: "蹭 #dola 趋势 + 极限‘自救’操作，用反常识结果做钩子",
    },
  },
  {
    id: "7632959179078028564", url: EMBED("7632959179078028564"),
    author: "BANG OJOL 19 (@bang.ojol.19)",
    caption: "Bang ojol masuk evos??（外卖小哥进 EVOS 战队？）#dola #id",
    vv: 31775840, likes: 180500, comments: 3443, coverUrl: "", music: "suara asli - BANG OJOL 19", durationSec: null,
    whyViral: {
      hook: "“外卖小哥进 EVOS 战队？”身份反差钩子",
      meme: "底层逆袭人设 + #dola 趋势 + 蹭 EVOS 电竞战队",
      music: "原声",
      pacing: "人设剧情向",
      oneLine: "‘外卖小哥逆袭电竞’的身份反差人设，蹭 EVOS 战队热度",
    },
  },
  {
    id: "7608911485279964436", url: EMBED("7608911485279964436"),
    author: "ShopeePay Indonesia (@shopeepay_id) · 品牌",
    caption: "Download ShopeePay, Redeem code dan dapatkan s.d. 70 Diamond Free Fire GRATIS.（充 ShopeePay 免费领 70 钻石）",
    vv: 25583879, likes: 28000, comments: 616, coverUrl: "", music: "original sound - ShopeePay Indonesia", durationSec: null,
    whyViral: {
      hook: "“免费领 70 钻石”的利益点直给",
      meme: "支付品牌 × FF 钻石充值联动",
      music: "品牌原声",
      pacing: "促销直给",
      oneLine: "ShopeePay × FF 钻石充值的商业化内容——播放靠投放、互动率最低(2.8万赞)，但正是开环电商/道具变现的真实样本",
    },
  },
  {
    id: "7635496493574606087", url: EMBED("7635496493574606087"),
    author: "García (@garcia.ff93)",
    caption: "#free_fire #viralvideo #editor #garcia",
    vv: 24139707, likes: 298300, comments: 10700, coverUrl: "", music: "sonido original", durationSec: null,
    whyViral: {
      hook: "高燃剪辑第一秒视觉冲击",
      meme: "#editor 剪辑二创，炫操作集锦",
      music: "原声卡点",
      pacing: "卡点快剪",
      oneLine: "#editor 高燃卡点剪辑，42万转发——视觉爽感驱动的纯二创裂变",
    },
  },
  {
    id: "7637033892612033812", url: EMBED("7637033892612033812"),
    author: "Quang Hải (@quanghai.210)",
    caption: "chỉ có người chơi lâu mới biết 🥶（只有老玩家才懂）#xuhuong #freefire #nhasangtaofreefire #fyp",
    vv: 19153525, likes: 802000, comments: 13600, coverUrl: "", music: "âm thanh gốc - Quang Hải", durationSec: null,
    whyViral: {
      hook: "“只有老玩家才懂🥶”的圈层认同钩子",
      meme: "怀旧/内行梗 + #nhasangtaofreefire 创作者计划话题",
      music: "原声",
      pacing: "悬念+揭晓",
      oneLine: "‘只有老玩家才懂’的圈层归属感——80万赞(全样本最高)，情怀/内行钩子最拉好感",
    },
  },
  {
    id: "7643244435295194388", url: EMBED("7643244435295194388"),
    author: "trm.adrian (@trm.adrian)",
    caption: "No podré jugar el torneo de hectorino 😭（打不了 hectorino 的比赛了）#freefire #teambotcito",
    vv: 17972793, likes: 759800, comments: 7851, coverUrl: "", music: "sonido original", durationSec: null,
    whyViral: {
      hook: "“打不了 hectorino 的比赛了😭”社区事件钩子",
      meme: "赛事/战队社区叙事 #teambotcito",
      music: "原声",
      pacing: "情绪叙事",
      oneLine: "社区赛事/战队的情绪叙事，34万转发——社区归属感驱动传播",
    },
  },
  {
    id: "7632721639142083858", url: EMBED("7632721639142083858"),
    author: "ELY2 (@ely2_ch)",
    caption: "Me acusó de hacker ☠️（他骂我开挂）#dola #mx #ely2 #parati",
    vv: 17279576, likes: 238200, comments: 2279, coverUrl: "", music: "sonido original", durationSec: null,
    whyViral: {
      hook: "“秀到被骂开挂☠️”的炫操作钩子",
      meme: "操作秀到被当外挂(经典 flex) + #dola 趋势",
      music: "原声",
      pacing: "高光直给",
      oneLine: "‘秀到被举报开挂’——经典实力 flex 格式，#dola 趋势加成",
    },
  },
  {
    id: "7638918014431153416", url: EMBED("7638918014431153416"),
    author: "Hcua (@hcualucky)",
    caption: "Orion siêu hồi HP 🫪（Orion 超强回血）#nhasangtaofreefire #nguafreefire #freefire",
    vv: 16380006, likes: 516500, comments: 2382, coverUrl: "", music: "HONOUR (Slowed)", durationSec: null,
    whyViral: {
      hook: "Orion 角色超强回血的版本强度展示",
      meme: "角色技能/版本强度 + 蹭涨势 slowed 音乐",
      music: "HONOUR (Slowed) —— 蹭涨势 slowed BGM",
      pacing: "强度展示",
      oneLine: "Orion 角色强度展示 + 蹭涨势 slowed BGM，16.9万收藏(全样本最高)= 强攻略价值，玩家收藏学习",
    },
  },
];

// 内容类型聚合：按主标签归类，vvShare = 该类型 VV 占总 VV 比例（总 ≈286M）
const freeFireRadar: ContentRadarDetail = {
  gameId: "freefire",
  gameName: "Free Fire",
  generatedAt: "2026-06-04T00:00:00.000Z",
  topVideos,
  contentTypes: [
    { tag: "官方活动/赛事", vvShare: 0.22, videoCount: 1, exampleVideoIds: ["7643755378395630849"], note: "靠官方话题活动撬量，互动率低；适合做曝光不适合裂变" },
    { tag: "操作高光/秀操作", vvShare: 0.176, videoCount: 2, exampleVideoIds: ["7633668596908051732", "7632721639142083858"], note: "稳定盘，‘秀到被当外挂’类 flex 格式可系列化" },
    { tag: "剧情/人设/社区", vvShare: 0.174, videoCount: 2, exampleVideoIds: ["7632959179078028564", "7643244435295194388"], note: "身份反差/社区叙事，转发率高，适合捧达人 IP" },
    { tag: "搞笑/名场面", vvShare: 0.133, videoCount: 1, exampleVideoIds: ["7639791467212393748"], note: "裂变之王(53万转发)，‘可复述笑点’最易传播，官方号都在玩" },
    { tag: "攻略/角色技巧", vvShare: 0.124, videoCount: 2, exampleVideoIds: ["7637033892612033812", "7638918014431153416"], note: "收藏率最高，强攻略价值；配版本/角色更新做种草" },
    { tag: "品牌联动/商业化", vvShare: 0.089, videoCount: 1, exampleVideoIds: ["7608911485279964436"], note: "占比最低(8.9%)——开环电商/道具变现内容明显欠开发，这是 GIP 商业化机会" },
    { tag: "高燃剪辑/二创", vvShare: 0.084, videoCount: 1, exampleVideoIds: ["7635496493574606087"], note: "视觉爽感驱动裂变(42万转发)，腰部剪辑达人可批量铺" },
  ],
};

export { freeFireRadar };
