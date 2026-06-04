// lib/data.minecraft.ts —— Minecraft 真实数据（纯增量）
// VV/item_id 来自 TikTok 全球 Top10 真实榜单；caption/作者/音乐/互动数为登录态浏览器抓取的真实数据；
// whyViral / contentTypes 为基于真实数据的内容分析。气泡占比按 vv 聚合。
import type { ContentRadarDetail, VideoInsight } from "@/types/contract.contentRadar";

const topVideos: VideoInsight[] = [
  {
    id: "7614896352421514503", url: `https://www.tiktok.com/embed/v2/7614896352421514503`,
    author: "chronopierce (@chronopierce)", caption: "Magic Hammer 6 - Gold Storage #clashofclans",
    vv: 43675115, likes: 297600, coverUrl: "/covers/7614896352421514503.jpg", music: "original sound - chronopierce", durationSec: null,
    whyViral: { hook: "Magic Hammer 资源展示", meme: "跨游戏误标(CoC)", music: "原声", pacing: "成果展示", oneLine: "实为 Clash of Clans 内容（被游戏标签误收）——提示榜单需做品类清洗" },
  },
  {
    id: "7638310590527573255", url: `https://www.tiktok.com/embed/v2/7638310590527573255`,
    author: ". (@i_kuy.11)", caption: "67",
    vv: 39731132, likes: 4800000, coverUrl: "/covers/7638310590527573255.jpg", music: "เสียงต้นฉบับ - .", durationSec: null,
    whyViral: { hook: "看不懂但上头的梗钩子", meme: "无厘头梗/'67'", music: "蹭泰区热门 sound", pacing: "极短梗视频", oneLine: "神秘'67'梗 + 泰语热门 sound——纯梗驱动，4.8M 赞全样本最高" },
  },
  {
    id: "7634505795702476053", url: `https://www.tiktok.com/embed/v2/7634505795702476053`,
    author: "Einsteinium (@einsteinium_legend)", caption: "He Made Me Do This💀 #minecraft #revenge #minecraftmemes #fyp #fypシ ",
    vv: 29607803, likes: 2600000, coverUrl: "/covers/7634505795702476053.jpg", music: "оригинальный звук - Einsteinium", durationSec: null,
    whyViral: { hook: "复仇名场面预期", meme: "#minecraftmemes 整活", music: "原声", pacing: "梗反转", oneLine: "'他逼我的💀'Minecraft 复仇梗——minecraftmemes 经典格式" },
  },
  {
    id: "7645434979010366751", url: `https://www.tiktok.com/embed/v2/7645434979010366751`,
    author: "🫟 (@anonymous_jefff)", caption: "what the HELL is that. • • • #coinmonke #mcyt #blisssmp #clips #twitchstreamer ",
    vv: 28452262, likes: 3500000, coverUrl: "/covers/7645434979010366751.jpg", music: "original sound", durationSec: null,
    whyViral: { hook: "高能名场面反应", meme: "MCYT/SMP 直播切片", music: "原声", pacing: "切片高能", oneLine: "'这啥玩意💀'MCYT 直播高能切片(blisssmp/twitch)——主播生态切片" },
  },
  {
    id: "7639891324002471199", url: `https://www.tiktok.com/embed/v2/7639891324002471199`,
    author: "Carterpcs (@carterpcs)", caption: "Minecraft Java edition is finally letting you add your friends and join their world… #c#carterpcstech #minecraft #gaming #javaedition ",
    vv: 26454367, likes: 962200, coverUrl: "/covers/7639891324002471199.jpg", music: "Inspiring Violins", durationSec: null,
    whyViral: { hook: "千呼万唤的新功能", meme: "版本更新资讯", music: "轻音乐", pacing: "资讯播报", oneLine: "Java 版终于能加好友联机——版本功能资讯，自带传播力" },
  },
  {
    id: "7634225613502565662", url: `https://www.tiktok.com/embed/v2/7634225613502565662`,
    author: "Minecraft (@minecraft)", caption: "geeked vs locked in      #minecraft",
    vv: 25978192, likes: 216100, coverUrl: "/covers/7634225613502565662.jpg", music: "original sound - Minecraft", durationSec: null,
    whyViral: { hook: "反差对比梗", meme: "官方玩梗", music: "官方原声", pacing: "短梗", oneLine: "官方号玩 'geeked vs locked in' 梗——官方亲自玩 meme" },
  },
  {
    id: "7645064205745261855", url: `https://www.tiktok.com/embed/v2/7645064205745261855`,
    author: "Susan Haight (@susanhaightmusic)", caption: "Call of the wild! #minecraft #minecraftmemes #fypシ ",
    vv: 24949797, likes: 3600000, coverUrl: "/covers/7645064205745261855.jpg", music: "original sound", durationSec: null,
    whyViral: { hook: "音乐情绪钩子", meme: "音乐梗/minecraftmemes", music: "原声音乐梗", pacing: "音乐卡点", oneLine: "'Call of the wild!'音乐梗——minecraftmemes + 音乐，3.6M 赞" },
  },
  {
    id: "7636436126143761677", url: `https://www.tiktok.com/embed/v2/7636436126143761677`,
    author: "Minecraft (@minecraft)", caption: "Feed magma to sulfur cubes, see a new look for sulfur springs, and figure out how to get the slow and heavy but bouncy effect for sulfur cubes! Coming very soon to Bedrock beta & preview. Learn more at the link in bio!",
    vv: 23710638, likes: 102800, coverUrl: "/covers/7636436126143761677.jpg", music: "original sound", durationSec: null,
    whyViral: { hook: "新版本元素揭秘", meme: "sulfur 版本前瞻", music: "官方原声", pacing: "前瞻展示", oneLine: "官方预告 sulfur springs 新版本内容——版本前瞻种草" },
  },
  {
    id: "7642054124166532373", url: `https://www.tiktok.com/embed/v2/7642054124166532373`,
    author: "maho21 (@mahomagic21)", caption: "sulfur update is peak 7 #Minecraft #funny #foryou ",
    vv: 22691221, likes: 2600000, coverUrl: "/covers/7642054124166532373.jpg", music: "original sound - maho21", durationSec: null,
    whyViral: { hook: "新版本'真香'结论", meme: "版本更新+搞笑", music: "原声", pacing: "强度展示", oneLine: "'sulfur 更新太顶了'——版本强度玩家二创，38万收藏" },
  },
  {
    id: "7645710789021584654", url: `https://www.tiktok.com/embed/v2/7645710789021584654`,
    author: "Minecraft (@minecraft)", caption: "What stirs in the deep dark? #minecraft #dungeons #MinecraftLIVE",
    vv: 21918136, likes: 1600000, coverUrl: "/covers/7645710789021584654.jpg", music: "original sound", durationSec: null,
    whyViral: { hook: "深暗之地的悬念", meme: "官方赛事(MinecraftLIVE)预热", music: "官方原声", pacing: "悬念预热", oneLine: "官方 'deep dark' 悬念 + MinecraftLIVE 赛事预热" },
  },
];

const minecraftRadar: ContentRadarDetail = {
  gameId: "minecraft",
  gameName: "Minecraft",
  generatedAt: "2026-06-04T00:00:00.000Z",
  topVideos,
  contentTypes: [
    { tag: "搞笑/meme", vvShare: 0.328, videoCount: 3, exampleVideoIds: ["7638310590527573255", "7634505795702476053", "7645064205745261855"], note: "meme 是 Minecraft 最大盘，无厘头梗+热门 sound 最易爆" },
    { tag: "版本/资讯", vvShare: 0.254, videoCount: 3, exampleVideoIds: ["7639891324002471199", "7636436126143761677", "7642054124166532373"], note: "版本更新(sulfur/deep dark/java联机)自带传播力，收藏率高，配版本节点种草" },
    { tag: "官方内容", vvShare: 0.167, videoCount: 2, exampleVideoIds: ["7634225613502565662", "7645710789021584654"], note: "官方号亲自玩梗+预热赛事(MinecraftLIVE)" },
    { tag: "跨游戏/噪音", vvShare: 0.152, videoCount: 1, exampleVideoIds: ["7614896352421514503"], note: "榜单混入跨游戏误标内容，需品类清洗" },
    { tag: "MCYT/直播切片", vvShare: 0.099, videoCount: 1, exampleVideoIds: ["7645434979010366751"], isGap: true, note: "MCYT/SMP 主播生态切片，粉丝向粘性强" },
  ],
};

export { minecraftRadar };
