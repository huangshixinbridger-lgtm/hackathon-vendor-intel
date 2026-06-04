// lib/data.mlbb.ts —— Mobile Legends: Bang Bang 真实数据（纯增量）
// VV/item_id 来自 TikTok 全球 Top10 真实榜单；caption/作者/音乐/互动数为登录态浏览器抓取的真实数据；
// whyViral / contentTypes 为基于真实数据的内容分析。气泡占比按 vv 聚合。
import type { ContentRadarDetail, VideoInsight } from "@/types/contract.contentRadar";

const topVideos: VideoInsight[] = [
  {
    id: "7640056264147406101", url: `https://www.tiktok.com/embed/v2/7640056264147406101`,
    author: "Mobile Legends Indonesia (@mobilelegends_id)", caption: "ADA APA DENGAN WENDY?  Perjamuan mewah berubah jadi petaka. Saat lampu padam, Wendy Walters mendadak hilang!!! Siapa pelakunya? Ada clue eksklusif dari para KOL. Tulis user ID kamu di komentar & vote siapa pelakunya di TikTok. Log in MLBB dan cek mailboxmu sekarang! 📮 #AdaApaDenganWendy #SiapaMencelakaiWendy #WendyAllStarParty #MLBB #MLBBALLSTAR   ",
    vv: 155066184, likes: 218900, coverUrl: "/covers/7640056264147406101.jpg", music: "original sound - Mobile Legends Indonesia", durationSec: null,
    whyViral: { hook: "'WENDY 怎么了'悬念钩子", meme: "官方新英雄剧情连载", music: "官方原声", pacing: "剧情悬念", oneLine: "官方 Wendy 新英雄悬念剧情'晚宴变灾难'——官方角色叙事撬动 1.55 亿播放" },
  },
  {
    id: "7640846051506801941", url: `https://www.tiktok.com/embed/v2/7640846051506801941`,
    author: "MCGG ID (@playmagicchessgogoid)", caption: "📢 Ding-dong! Ada pesan Pertarungan Kru nih buat kamu! 📅 Waktu Mulai: 25/05 📔 Panduan Event: Gabung Kru — Mainkan pertandingan MRS — Selesaikan quest / Push rank — Klaim hadiah! Ikuti event eksklusif MRS S6, Pertarungan Kru, cuma dengan 3 langkah mudah! Temukan Kru influencer favoritmu dan daftar untuk bergabung setelah event dimulai! #MCGG1year #MCGGMRSS6 #MCGGCrewclash #MCGGAnniversary",
    vv: 41587521, likes: 16700, coverUrl: "/covers/7640846051506801941.jpg", music: "suara asli - MCGG ID", durationSec: null,
    whyViral: { hook: "活动召集'Ding-dong'", meme: "Magic Chess 子玩法活动", music: "原声", pacing: "活动播报", oneLine: "Magic Chess GoGo 子玩法的对战活动召集——子模式独立运营" },
  },
  {
    id: "7642715787517529364", url: `https://www.tiktok.com/embed/v2/7642715787517529364`,
    author: "Mobile Legends Indonesia (@mobilelegends_id)", caption: "WENDY KEMBALI DARI DASAR LAUT! 🧜‍♀️🌊 Semua orang kira dia hilang, tapi Wendy Walters bangkit dengan wujud baru untuk balas dendam! Bukan cuma bawa rahasia, dia juga bawa \"harta karun\" MLBB buat kamu: 💎 55 Juta Diamonds 🏆 2000 Hadiah Gold 🐲 Skin Yu Zhong GRATIS! Log in sekarang sebelum hartanya lenyap! 🏃💨 #AdaApaDenganWendy #WendyAllStarParty #MLBB #MLBBALLSTAR",
    vv: 29441511, likes: 23900, coverUrl: "/covers/7642715787517529364.jpg", music: "original sound - Mobile Legends Indonesia", durationSec: null,
    whyViral: { hook: "角色归来反转", meme: "新英雄剧情连载", music: "官方原声", pacing: "剧情反转", oneLine: "'WENDY 从海底归来'——官方新英雄剧情第二弹，连载吊胃口" },
  },
  {
    id: "7631768867466939668", url: `https://www.tiktok.com/embed/v2/7631768867466939668`,
    author: "Mobile Legends Indonesia (@mobilelegends_id)", caption: "Apakah ini Perburuan Emas Ombak, atau jebakan yang dipasang oleh Abyss? Menyelam lebih dalam mengikuti kilauan emas, tanpa sadar kamu telah menjadi mangsa. Tahan napasmu! #MLBBALLSTAR hadir pada 30/04. 🎬 Tonton teasernya sekarang! #MLBBDreadsea",
    vv: 26270809, likes: 95600, coverUrl: "/covers/7631768867466939668.jpg", music: "original sound - Mobile Legends Indonesia", durationSec: null,
    whyViral: { hook: "二选一悬念", meme: "剧情+活动", music: "官方原声", pacing: "悬念", oneLine: "'浪潮寻金还是 Abyss 陷阱'——官方剧情+活动结合" },
  },
  {
    id: "7643400047199112456", url: `https://www.tiktok.com/embed/v2/7643400047199112456`,
    author: "MPL Indonesia (@mpl.id.official)", caption: "Ada yang akrab bgt mimin liat-liat 😭 Ini konsepnya EVOS loan kairi kh di match hari ini? #MingguBerdarah #PrematchS17 #MPLIDS17 #WeOwnThis #Wellplayed EVOS ONIC",
    vv: 22311921, likes: 1000000, coverUrl: "/covers/7643400047199112456.jpg", music: "original sound - MPL Indonesia", durationSec: null,
    whyViral: { hook: "'眼熟的人'赛事八卦钩子", meme: "MPL 赛事/战队转会", music: "赛事原声", pacing: "赛事吃瓜", oneLine: "MPL 赛场认出 EVOS 借将 Kairi——赛事八卦撬动 100万赞" },
  },
  {
    id: "7645162655421943057", url: `https://www.tiktok.com/embed/v2/7645162655421943057`,
    author: "Pojok Satu Selebriti (@pojokseleb)", caption: "Fajar Sadboy kembali bikin netizen salfok lewat tingkah randomnya saat datang ke tempat rental PlayStation (ﾉ≧∀≦)ﾉ Datang sendirian naik motor sambil pakai gamis, Fajar langsung keliling cari lawan main PS tanpa malu-malu (⊙ω⊙) Bahkan, beberapa orang yang lagi asik main sampai disamperin satu per satu buat diajak tanding (≧∇≦)/ Ada juga momen saat Fajar tiba-tiba nyelonong ambil stik demi ikut bermain bareng (￣▽￣)ゞ Tingkah santainya ini langsung bikin suasana ramai dan jadi hiburan buat banyak orang yang ada di lokasi (☆ω☆)",
    vv: 19856223, likes: 889900, coverUrl: "/covers/7645162655421943057.jpg", music: "suara asli - Pojok Satu Selebriti", durationSec: null,
    whyViral: { hook: "选手反差名场面", meme: "选手个人/吃瓜", music: "原声", pacing: "名场面", oneLine: "Fajar Sadboy 选手随性举动又上热议——选手个人魅力出圈" },
  },
  {
    id: "7640515196729052434", url: `https://www.tiktok.com/embed/v2/7640515196729052434`,
    author: "MPL Indonesia (@mpl.id.official)", caption: "Stay strong, Kelra. Our thoughts and prayers are with you. 🥀 #MPLIDS17 #WeOwnThis #WellPlayed #DynamicS17",
    vv: 16842426, likes: 1500000, coverUrl: "/covers/7640515196729052434.jpg", music: "original sound - MPL Indonesia", durationSec: null,
    whyViral: { hook: "选手情感共鸣", meme: "赛事选手情感声援", music: "情绪原声", pacing: "情感叙事", oneLine: "'Stay strong, Kelra 🥀'——MPL 选手情感声援，1.5M 赞全样本最高" },
  },
  {
    id: "7639621872010808584", url: `https://www.tiktok.com/embed/v2/7639621872010808584`,
    author: "Lala MLBB (@lalamlbb__)", caption: "jangan ya 🙂 #quotesmlbb #mlbb ",
    vv: 15868370, likes: 889400, coverUrl: "/covers/7639621872010808584.jpg", music: "suara asli - Sadvibes🥀", durationSec: null,
    whyViral: { hook: "情绪语录钩子", meme: "quotes/情感二创", music: "sadvibe 音乐", pacing: "情绪短片", oneLine: "'别这样🙂'#quotesmlbb——情感语录二创，玩家共鸣" },
  },
];

const mlbbRadar: ContentRadarDetail = {
  gameId: "mlbb",
  gameName: "Mobile Legends: Bang Bang",
  generatedAt: "2026-06-04T00:00:00.000Z",
  topVideos,
  contentTypes: [
    { tag: "官方角色/剧情", vvShare: 0.644, videoCount: 3, exampleVideoIds: ["7640056264147406101", "7642715787517529364", "7631768867466939668"], note: "官方新英雄(Wendy)剧情连载，单条破亿播放，剧情化运营是 MLBB 官方打法" },
    { tag: "子玩法/活动", vvShare: 0.127, videoCount: 1, exampleVideoIds: ["7640846051506801941"], isGap: true, note: "Magic Chess 等子玩法独立运营，互动偏低" },
    { tag: "赛事/战队", vvShare: 0.12, videoCount: 2, exampleVideoIds: ["7643400047199112456", "7640515196729052434"], note: "MPL 赛事+选手是最大流量盘(EVOS/Kelra)，情感+八卦双驱动，可深绑赛事节点" },
    { tag: "网红/吃瓜", vvShare: 0.061, videoCount: 1, exampleVideoIds: ["7645162655421943057"], note: "明星选手个人魅力出圈，达人/选手 IP 可放大" },
    { tag: "情感/quotes二创", vvShare: 0.048, videoCount: 1, exampleVideoIds: ["7639621872010808584"], note: "情感语录二创，玩家共鸣向" },
  ],
};

export { mlbbRadar };
