// app/cockpit/cockpit-data.ts —— 第一屏「驾驶舱/星图」原型数据（presentation 原型，非真实业务数据）
// id 与游戏注册表 lib/games.ts 的 gameId 对齐（有则可跳现有模块）。
// 布局：五个品类聚成「星系团」，团内用「向日葵（黄金角）分布」均匀铺开、避免重叠。

export type CategoryKey = "shooter" | "sandbox" | "mmo" | "action" | "casual";

export type Planet = {
  id: string;
  name: string;
  vendor: string;
  category: CategoryKey;
  importance: number; // 1–5
  hot?: boolean;
  hook?: string;
  theme: string;
  glyph: string;
  logoUrl?: string;
};

export const CATEGORIES: Record<CategoryKey, { label: string; color: string }> = {
  shooter: { label: "射击竞技", color: "#ff6b6b" },
  sandbox: { label: "沙盒 UGC", color: "#39d98a" },
  mmo: { label: "MMO·开放世界", color: "#9b7bff" },
  action: { label: "动作 RPG", color: "#f5b342" },
  casual: { label: "派对·策略", color: "#39c6e6" },
};

export const CAT_ORDER: CategoryKey[] = ["shooter", "sandbox", "mmo", "action", "casual"];

export const PLANETS: Planet[] = [
  // —— 射击竞技 ——
  { id: "freefire", name: "Free Fire", vendor: "Garena", category: "shooter", importance: 5, hot: true, hook: "本周 3 个大动作 · 286M VV", theme: "lava", glyph: "🔥", logoUrl: "/planets/freefire.jpg" },
  { id: "mlbb", name: "Mobile Legends", vendor: "Moonton", category: "shooter", importance: 5, hook: "东南亚常青 MOBA · 内容稳定", theme: "arcane", glyph: "⚔️", logoUrl: "/planets/mlbb.jpg" },
  { id: "honor-of-kings", name: "王者荣耀", vendor: "Tencent", category: "shooter", importance: 5, hook: "国民级 MOBA · 全球扩张", theme: "arcane", glyph: "👑" },
  { id: "pubg-mobile", name: "PUBG MOBILE", vendor: "Tencent", category: "shooter", importance: 5, hook: "吃鸡基本盘 · 联动不断", theme: "rocky", glyph: "🪂" },
  { id: "delta-force", name: "Delta Force", vendor: "TiMi", category: "shooter", importance: 4, hook: "组队名场面持续刷屏", theme: "rocky", glyph: "🎯", logoUrl: "/planets/delta-force.jpg" },
  { id: "marvel-rivals", name: "漫威争锋", vendor: "NetEase", category: "shooter", importance: 4, hot: true, hook: "短视频规模冲进同类头部", theme: "arcane", glyph: "⚡" },
  { id: "cod-mobile", name: "COD Mobile", vendor: "Activision", category: "shooter", importance: 4, hook: "硬核 FPS · 赛季驱动", theme: "rocky", glyph: "🎖️" },
  { id: "valorant", name: "Valorant", vendor: "Riot", category: "shooter", importance: 4, hook: "战术射击 · 电竞强势", theme: "arcane", glyph: "🔻" },
  { id: "blood-strike", name: "Blood Strike", vendor: "NetEase", category: "shooter", importance: 3, hook: "区域爆发强 · 全球追赶中", theme: "rocky", glyph: "💥", logoUrl: "/planets/blood-strike.jpg" },
  { id: "knives-out", name: "荒野行动", vendor: "NetEase", category: "shooter", importance: 3, hook: "JP 核心盘稳 · 条均 VV 第一", theme: "rocky", glyph: "🔫", logoUrl: "/planets/knives-out.jpg" },
  { id: "wild-rift", name: "英雄联盟手游", vendor: "Riot", category: "shooter", importance: 3, hook: "端转手 · 电竞内容多", theme: "arcane", glyph: "🛡️" },
  { id: "arena-breakout", name: "暗区突围", vendor: "Tencent", category: "shooter", importance: 3, hook: "搜打撤品类 · 硬核向", theme: "rocky", glyph: "🪖" },
  { id: "brawl-stars", name: "Brawl Stars", vendor: "Supercell", category: "shooter", importance: 3, hook: "休闲竞技 · 表情包多", theme: "studs", glyph: "💫" },
  { id: "apex-mobile", name: "Apex Legends", vendor: "EA", category: "shooter", importance: 2, hook: "英雄射击 · 内容偏硬核", theme: "rocky", glyph: "🔺" },

  // —— 沙盒 UGC ——
  { id: "roblox", name: "Roblox", vendor: "Roblox Corp", category: "sandbox", importance: 5, hook: "UGC 生态 · 二创无限", theme: "studs", glyph: "🧱", logoUrl: "/planets/roblox.jpg" },
  { id: "minecraft", name: "Minecraft", vendor: "Mojang", category: "sandbox", importance: 5, hook: "新版本带动二创回潮", theme: "voxel", glyph: "⛏️", logoUrl: "/planets/minecraft.jpg" },
  { id: "lego-fortnite", name: "LEGO Fortnite", vendor: "Epic", category: "sandbox", importance: 3, hook: "积木沙盒新玩法", theme: "studs", glyph: "🧩" },
  { id: "terraria", name: "Terraria", vendor: "Re-Logic", category: "sandbox", importance: 2, hook: "2D 沙盒长青", theme: "voxel", glyph: "🌳" },
  { id: "the-sandbox", name: "The Sandbox", vendor: "Animoca", category: "sandbox", importance: 2, hook: "链游沙盒 · 创作者经济", theme: "voxel", glyph: "📦" },
  { id: "block-blast", name: "Block Blast", vendor: "Hungry Studio", category: "sandbox", importance: 2, hook: "解压方块 · 买量大户", theme: "studs", glyph: "🟦" },
  { id: "heartopia", name: "Heartopia", vendor: "XD Entertainment", category: "sandbox", importance: 3, hook: "治愈系生活模拟 · 社交向", theme: "studs", glyph: "🏝️" },

  // —— MMO·开放世界 ——
  { id: "genshin", name: "原神", vendor: "HoYoverse", category: "mmo", importance: 5, hot: true, hook: "开放世界标杆 · 二创海量", theme: "arcane", glyph: "🌀" },
  { id: "yanyun", name: "燕云十六声", vendor: "NetEase", category: "mmo", importance: 4, hook: "US 直播节点爆发", theme: "ink", glyph: "🏯" },
  { id: "star-rail", name: "崩坏:星穹铁道", vendor: "HoYoverse", category: "mmo", importance: 4, hook: "回合 RPG · 剧情向二创", theme: "ice", glyph: "🚄" },
  { id: "wuthering-waves", name: "鸣潮", vendor: "Kuro", category: "mmo", importance: 4, hot: true, hook: "开放世界新秀 · 海外加码", theme: "arcane", glyph: "🌊" },
  { id: "sword-of-justice", name: "逆水寒", vendor: "NetEase", category: "mmo", importance: 3, hook: "区域补供给阶段", theme: "ink", glyph: "🗡️" },
  { id: "diablo-immortal", name: "Diablo Immortal", vendor: "Blizzard", category: "mmo", importance: 3, hook: "暗黑 IP · 硬核刷装", theme: "gold", glyph: "😈" },
  { id: "black-desert", name: "Black Desert", vendor: "Pearl Abyss", category: "mmo", importance: 2, hook: "高画质 MMO · 老牌", theme: "ink", glyph: "🐎" },
  { id: "tarisland", name: "Tarisland", vendor: "Tencent", category: "mmo", importance: 2, hook: "出海 MMO · 欧美向", theme: "gold", glyph: "🐲" },

  // —— 动作 RPG ——
  { id: "endfield", name: "明日方舟:终末地", vendor: "HYPERGRYPH", category: "action", importance: 4, hot: true, hook: "开放世界新作 · 内测高热度", theme: "ice", glyph: "🔩" },
  { id: "elden-ring", name: "Elden Ring", vendor: "Bandai Namco", category: "action", importance: 4, hook: "硬核挑战内容标杆", theme: "gold", glyph: "🌳" },
  { id: "zzz", name: "绝区零", vendor: "HoYoverse", category: "action", importance: 4, hot: true, hook: "都市动作 · 节奏快", theme: "arcane", glyph: "🔧" },
  { id: "honkai-impact", name: "崩坏3", vendor: "HoYoverse", category: "action", importance: 3, hook: "动作老牌 · 剧情党", theme: "arcane", glyph: "🗡️" },
  { id: "once-human", name: "七日世界", vendor: "Starry Studio", category: "action", importance: 3, hook: "短视频有爆点 · 直播追赶", theme: "rocky", glyph: "☢️", logoUrl: "/planets/once-human.jpg" },
  { id: "nikke", name: "胜利女神:NIKKE", vendor: "Shift Up", category: "action", importance: 3, hook: "美术驱动 · 社区粘性高", theme: "arcane", glyph: "🎯" },
  { id: "pgr", name: "战双帕弥什", vendor: "Kuro", category: "action", importance: 2, hook: "硬核动作 · 核心向", theme: "ice", glyph: "⚙️" },
  { id: "dmc-peak", name: "鬼泣:巅峰之战", vendor: "NetEase", category: "action", importance: 2, hook: "动作 IP · 连招内容", theme: "gold", glyph: "😈" },

  // —— 派对·策略 ——
  { id: "subway-surfers", name: "Subway Surfers", vendor: "SYBO", category: "casual", importance: 4, hook: "跑酷常青 · 短视频背景神器", theme: "studs", glyph: "🛹" },
  { id: "eggy-party", name: "Eggy Party", vendor: "NetEase", category: "casual", importance: 3, hook: "派对社交 · 高频开黑", theme: "studs", glyph: "🥚", logoUrl: "/planets/eggy-party.jpg" },
  { id: "monopoly-go", name: "Monopoly Go", vendor: "Scopely", category: "casual", importance: 3, hook: "社交博彩 · 买量王", theme: "studs", glyph: "🎲" },
  { id: "stumble-guys", name: "Stumble Guys", vendor: "Scopely", category: "casual", importance: 3, hook: "糖豆人式派对", theme: "studs", glyph: "🏃" },
  { id: "candy-crush", name: "Candy Crush", vendor: "King", category: "casual", importance: 3, hook: "三消常青", theme: "studs", glyph: "🍬" },
  { id: "whiteout-survival", name: "Whiteout Survival", vendor: "Century", category: "casual", importance: 4, hook: "SLG 出海黑马", theme: "ice", glyph: "❄️" },
  { id: "royal-match", name: "Royal Match", vendor: "Dream Games", category: "casual", importance: 3, hook: "三消买量大户", theme: "gold", glyph: "👑" },
];

export const TOP_INTEL: { id: string; tag: string; text: string }[] = [
  { id: "freefire", tag: "大版本", text: "Free Fire OB49 上线 + 巴西嘉年华联动" },
  { id: "endfield", tag: "新游", text: "明日方舟:终末地内测高热 · 海外关注度攀升" },
  { id: "genshin", tag: "活动", text: "原神新版本二创量级再创新高" },
  { id: "marvel-rivals", tag: "新游", text: "漫威争锋短视频规模冲进同类头部梯队" },
  { id: "wuthering-waves", tag: "大版本", text: "鸣潮新角色卡池 + 海外加码" },
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function seedOf(id: string): number {
  return Math.floor(hash(id) * 1e9);
}

const CLUSTER_RADIUS = 20;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPACING = 3.05;

/** 品类星系团团心（环形排布）。 */
export function clusterCenter(category: CategoryKey): [number, number, number] {
  const i = Math.max(0, CAT_ORDER.indexOf(category));
  const a = i * ((Math.PI * 2) / CAT_ORDER.length) - Math.PI / 2;
  const y = Math.sin(i * 1.7) * 1.5;
  return [Math.cos(a) * CLUSTER_RADIUS, y, Math.sin(a) * CLUSTER_RADIUS];
}

// 预计算每颗星球坐标：团内按向日葵（黄金角）分布，重要度高的靠团心，均匀不重叠。
const POSITIONS = new Map<string, [number, number, number]>();
for (const cat of CAT_ORDER) {
  const center = clusterCenter(cat);
  const list = PLANETS.filter((p) => p.category === cat).sort((a, b) => b.importance - a.importance);
  const spin = hash(cat) * Math.PI * 2;
  list.forEach((p, i) => {
    const r = SPACING * Math.sqrt(i + 1.0);
    const a = i * GOLDEN_ANGLE + spin;
    const x = center[0] + Math.cos(a) * r;
    const z = center[2] + Math.sin(a) * r;
    const y = center[1] + (hash(p.id + "y") - 0.5) * 3.2;
    POSITIONS.set(p.id, [x, y, z]);
  });
}

export function planetPosition(p: Planet): [number, number, number] {
  return POSITIONS.get(p.id) ?? [0, 0, 0];
}

export function planetScale(p: Planet): number {
  return 0.42 + p.importance * 0.15;
}

// 已抓到官方 App Store 图标的星球 id（文件位于 public/planets/<id>.jpg）。
// 没在此集合里的（如 marvel-rivals / elden-ring / apex-mobile / the-sandbox / tarisland /
// sword-of-justice）App Store 无对应应用，回退到程序化主题贴图。
export const LOGO_IDS = new Set<string>([
  "arena-breakout", "black-desert", "block-blast", "blood-strike", "brawl-stars", "candy-crush",
  "cod-mobile", "delta-force", "diablo-immortal", "dmc-peak", "eggy-party", "endfield", "freefire",
  "genshin", "heartopia", "honkai-impact", "honor-of-kings", "knives-out", "lego-fortnite", "minecraft",
  "mlbb", "monopoly-go", "nikke", "once-human", "pgr", "pubg-mobile", "roblox", "royal-match", "star-rail",
  "stumble-guys", "subway-surfers", "terraria", "valorant", "whiteout-survival", "wild-rift",
  "wuthering-waves", "yanyun", "zzz",
]);

/** 星球官方 logo 路径（有则贴官图，无则交给程序化主题贴图回退）。 */
export function planetLogo(p: Planet): string | undefined {
  if (p.logoUrl) return p.logoUrl;
  return LOGO_IDS.has(p.id) ? `/planets/${p.id}.jpg` : undefined;
}
