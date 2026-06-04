// lib/data.roblox.ts —— Roblox 真实数据（纯增量）
// VV/item_id 来自 TikTok 全球 Top10 真实榜单；caption/作者/音乐/互动数为登录态浏览器抓取的真实数据；
// whyViral / contentTypes 为基于真实数据的内容分析。气泡占比按 vv 聚合。
import type { ContentRadarDetail, VideoInsight } from "@/types/contract.contentRadar";

const topVideos: VideoInsight[] = [
  {
    id: "7638166167156231425", url: `https://www.tiktok.com/embed/v2/7638166167156231425`,
    author: "johasww (@johasww)", caption: "average roblox spelling game be like #funny #fyp #roblox",
    vv: 39216796, likes: 4400000, coverUrl: "/covers/7638166167156231425.jpg", music: "original sound - johasww", durationSec: null,
    whyViral: { hook: "拼写游戏的荒诞演绎做钩子", meme: "搞笑段子/meme", music: "原声配音", pacing: "短平快段子", oneLine: "把 Roblox 拼写游戏演成荒诞段子——平台型游戏靠'梗'破圈，4.4M 赞" },
  },
  {
    id: "7636359980010048800", url: `https://www.tiktok.com/embed/v2/7636359980010048800`,
    author: "Krote (@i.krote)", caption: "I made DOUBLE MEGA FARM Base in 99Nights in the forest #roblox #99nightsintheforest ",
    vv: 34814137, likes: 1300000, coverUrl: "/covers/7636359980010048800.jpg", music: "Originalton", durationSec: null,
    whyViral: { hook: "DOUBLE MEGA FARM 成果直给", meme: "热门子游戏(99Nights)攻略", music: "原声", pacing: "建造成果展示", oneLine: "99 Nights in the Forest 超级农场基建展示——蹭爆款子游戏热度" },
  },
  {
    id: "7608337806275939597", url: `https://www.tiktok.com/embed/v2/7608337806275939597`,
    author: "Roblox (@roblox)", caption: "Dueling Grounds: the perfect setting for a 1v1 ⚔️",
    vv: 32932935, likes: 342500, coverUrl: "/covers/7608337806275939597.jpg", music: "original sound - Roblox", durationSec: null,
    whyViral: { hook: "完美 1v1 对决场景", meme: "官方玩法安利", music: "官方原声", pacing: "场景展示", oneLine: "官方号演示 Dueling Grounds 1v1 场景——平台官方带玩法节奏" },
  },
  {
    id: "7637885322591767816", url: `https://www.tiktok.com/embed/v2/7637885322591767816`,
    author: "Mashles (@mashlesonyt)", caption: "When your big bro always stealing your food LOL 💀😭#fyp #roblox #robloxanimation",
    vv: 26868852, likes: 568400, coverUrl: "/covers/7637885322591767816.jpg", music: "original sound - Mashles", durationSec: null,
    whyViral: { hook: "兄弟抢食的共鸣名场面", meme: "Roblox 动画/剧情二创", music: "原声", pacing: "动画短剧", oneLine: "'哥哥总偷我吃的'Roblox 动画——动画二创把日常梗做成共鸣" },
  },
  {
    id: "7640638411379838228", url: `https://www.tiktok.com/embed/v2/7640638411379838228`,
    author: "Tessie💕 (@ydk.tessi3)", caption: "Was my fav game 🥹 #fypシ゚ #viral?tiktok🥰 #roblox #blowthisup #fyppppppppppppppppppppppp ",
    vv: 25481820, likes: 1300000, coverUrl: "/covers/7640638411379838228.jpg", music: "original sound", durationSec: null,
    whyViral: { hook: "'我曾经最爱'的怀旧情绪", meme: "情感/怀旧", music: "情绪向原声", pacing: "情绪叙事", oneLine: "'曾是我最爱的游戏🥹'——怀旧情感钩子，1.3M 赞" },
  },
  {
    id: "7627718909940010258", url: `https://www.tiktok.com/embed/v2/7627718909940010258`,
    author: "Minh Luận 😜 (@tmluan2106)", caption: "Bảo chơi ván game gần 2 tiếng không ai tin",
    vv: 24255280, likes: 1800000, coverUrl: "/covers/7627718909940010258.jpg", music: "âm thanh gốc - Minh Luận 😜", durationSec: null,
    whyViral: { hook: "难以置信的挑战结果", meme: "玩法挑战/炫耀", music: "原声", pacing: "高光直给", oneLine: "'玩了快俩小时没人信'——硬核挑战/炫耀格式（越南创作者）" },
  },
  {
    id: "7639708354683669773", url: `https://www.tiktok.com/embed/v2/7639708354683669773`,
    author: "Letici (@leticithegoblin)", caption: "THe Coolest Backrooms game ive ever played #backrooms #horror #roblox #fyp #viral",
    vv: 24085157, likes: 3200000, coverUrl: "/covers/7639708354683669773.jpg", music: "original sound - Letici", durationSec: null,
    whyViral: { hook: "最酷 Backrooms 的悬念", meme: "恐怖/探索子游戏(backrooms)", music: "原声", pacing: "探索沉浸", oneLine: "'玩过最酷的 Backrooms'——恐怖探索类子游戏，72万收藏全样本最高" },
  },
  {
    id: "7639348609858784532", url: `https://www.tiktok.com/embed/v2/7639348609858784532`,
    author: "Roblox VN (@robloxvng)", caption: "Nghe giọng này thì người đẹp nào cũng tan chảy 😌 #roblox #robloxvng #robloxfyp #robloxgames #beautyandabeat ",
    vv: 22236687, likes: 1900000, coverUrl: "/covers/7639348609858784532.jpg", music: "âm thanh gốc - Roblox VN", durationSec: null,
    whyViral: { hook: "反差声音梗", meme: "整活/声音玩梗", music: "原声", pacing: "整活短视频", oneLine: "'这声音美女都融化'——声音整活梗（越南区）" },
  },
  {
    id: "7635452309304020245", url: `https://www.tiktok.com/embed/v2/7635452309304020245`,
    author: "moshi (@_shii.szn)", caption: "JUSTINNNN WAAHHHH 🐣🤪 #roblox #robloxfyp #fyp #robloxedit #CapCut ",
    vv: 21502729, likes: 2700000, coverUrl: "/covers/7635452309304020245.jpg", music: "suara asli - kaykay", durationSec: null,
    whyViral: { hook: "高燃剪辑第一秒", meme: "#robloxedit 二创剪辑", music: "卡点音乐", pacing: "卡点快剪", oneLine: "CapCut 剪的 Roblox edit——二创剪辑驱动裂变，2.7M 赞" },
  },
];

const robloxRadar: ContentRadarDetail = {
  gameId: "roblox",
  gameName: "Roblox",
  generatedAt: "2026-06-04T00:00:00.000Z",
  topVideos,
  contentTypes: [
    { tag: "搞笑/meme", vvShare: 0.156, videoCount: 1, exampleVideoIds: ["7638166167156231425"], note: "搞笑梗破圈主力，量大易裂变" },
    { tag: "热门子游戏玩法", vvShare: 0.138, videoCount: 1, exampleVideoIds: ["7636359980010048800"], note: "Roblox 是平台，内容靠爆款子游戏(99Nights/Backrooms)带——盯子游戏热度比盯 Roblox 本身有效" },
    { tag: "官方玩法展示", vvShare: 0.131, videoCount: 1, exampleVideoIds: ["7608337806275939597"], note: "官方号带玩法，曝光向" },
    { tag: "动画二创", vvShare: 0.107, videoCount: 1, exampleVideoIds: ["7637885322591767816"], note: "Roblox 动画把日常梗做成共鸣，转发高" },
    { tag: "怀旧/情感", vvShare: 0.101, videoCount: 1, exampleVideoIds: ["7640638411379838228"], note: "情感钩子拉好感" },
    { tag: "玩法/挑战", vvShare: 0.096, videoCount: 1, exampleVideoIds: ["7627718909940010258"], note: "炫耀/挑战格式稳定" },
    { tag: "恐怖/探索子游戏", vvShare: 0.096, videoCount: 1, exampleVideoIds: ["7639708354683669773"], note: "收藏率最高，沉浸类子游戏有粘性" },
    { tag: "整活/声音", vvShare: 0.088, videoCount: 1, exampleVideoIds: ["7639348609858784532"], note: "声音梗，区域性强" },
    { tag: "二创/剪辑", vvShare: 0.086, videoCount: 1, exampleVideoIds: ["7635452309304020245"], note: "#robloxedit 剪辑二创裂变强，腰部达人可批量" },
  ],
};

export { robloxRadar };
