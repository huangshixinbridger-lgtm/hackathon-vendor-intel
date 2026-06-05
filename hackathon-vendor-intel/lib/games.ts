// lib/games.ts —— 全站「游戏注册表」：跨模块 gameId 的唯一真相（集成层，黄士鑫/Jeff）
// ───────────────────────────────────────────────────────────────────────────
// 背景：四个模块各自维护了自己的 gameId 命名空间（radar=g-1001、content-radar=freefire、
//   diagnosis=nte/yanyun…、gip=yanyun/delta-force…），导致跨模块跳转和搜索无法对齐，
//   过去靠「静默兜底到别的游戏」掩盖，演示时张冠李戴。
//
// 本文件不新增任何业务数据，只把各模块「已有」的 gameId / 游戏名登记到一处，
//   并提供：① 搜索词 → 规范游戏 的解析；② 规范游戏 → 某模块本地 gameId 的翻译；
//   ③ 某游戏在哪些模块有数据 的查询。各模块产品逻辑与数据内容均不改动。
//
// 维护方式：模块新增/删除游戏时，同步更新这里对应条目的 modules 字段即可。
// ───────────────────────────────────────────────────────────────────────────

export type ModuleKey = "radar" | "contentRadar" | "diagnosis" | "gip";

export const MODULE_PATH: Record<ModuleKey, string> = {
  radar: "/radar",
  contentRadar: "/content-radar",
  diagnosis: "/diagnosis",
  gip: "/gip",
};

export const MODULE_LABEL: Record<ModuleKey, string> = {
  radar: "情报雷达",
  contentRadar: "内容雷达",
  diagnosis: "诊断报告",
  gip: "GIP 面板",
};

export interface GameEntry {
  /** 规范 gameId（跨模块统一对外用这个） */
  id: string;
  /** 展示名 */
  name: string;
  /** 搜索/归一化用的别名（含多语言名、各模块本地 id 等） */
  aliases: string[];
  /** 该游戏在各模块的「本地 gameId」。键存在 = 该模块有这个游戏的数据。 */
  modules: Partial<Record<ModuleKey, string>>;
}

// 登记表——值全部来自各模块「已有」的数据文件，未新增任何业务内容。
export const GAMES: GameEntry[] = [
  // 跨模块游戏：diagnosis + gip 都有（id 本就一致）
  {
    id: "yanyun",
    name: "燕云十六声",
    aliases: ["燕云十六声", "燕云", "where winds meet", "yanyun"],
    modules: { diagnosis: "yanyun", gip: "yanyun" },
  },
  // content-radar 的四个真实游戏
  {
    // hero 游戏：四个模块都补了 Free Fire 数据，可端到端联动（radar/diagnosis/gip 为标注的 demo 数据）
    id: "freefire",
    name: "Free Fire",
    aliases: ["free fire", "freefire", "ff", "garena free fire", "我要活下去"],
    modules: { radar: "freefire", contentRadar: "freefire", diagnosis: "freefire", gip: "freefire" },
  },
  {
    id: "mlbb",
    name: "Mobile Legends: Bang Bang",
    aliases: ["mobile legends", "mlbb", "mobile legends bang bang", "无尽对决"],
    modules: { contentRadar: "mlbb" },
  },
  {
    id: "roblox",
    name: "Roblox",
    aliases: ["roblox"],
    modules: { contentRadar: "roblox" },
  },
  {
    id: "minecraft",
    name: "Minecraft",
    aliases: ["minecraft", "我的世界", "mc"],
    modules: { contentRadar: "minecraft" },
  },
  // diagnosis 专有
  { id: "nte", name: "NTE", aliases: ["nte"], modules: { diagnosis: "nte" } },
  {
    id: "blood-strike",
    name: "Blood Strike",
    aliases: ["blood strike", "bloodstrike"],
    modules: { diagnosis: "blood-strike" },
  },
  {
    id: "eggy-party",
    name: "Eggy Party",
    aliases: ["eggy party", "eggyparty", "蛋仔派对", "蛋仔"],
    modules: { diagnosis: "eggy-party" },
  },
  {
    id: "knives-out",
    name: "荒野行动",
    aliases: ["荒野行动", "knives out", "knives-out"],
    modules: { diagnosis: "knives-out" },
  },
  {
    id: "marvel-rivals",
    name: "漫威争锋",
    aliases: ["漫威争锋", "marvel rivals", "marvel-rivals"],
    modules: { diagnosis: "marvel-rivals" },
  },
  {
    id: "once-human",
    name: "七日世界",
    aliases: ["七日世界", "once human", "once-human"],
    modules: { diagnosis: "once-human" },
  },
  // gip 专有
  {
    id: "elden-ring",
    name: "Elden Ring",
    aliases: ["elden ring", "艾尔登法环", "老头环"],
    modules: { gip: "elden-ring" },
  },
  {
    id: "delta-force",
    name: "Delta Force",
    aliases: ["delta force", "三角洲行动", "三角洲"],
    modules: { gip: "delta-force" },
  },
  {
    id: "sword-of-justice",
    name: "逆水寒",
    aliases: ["逆水寒", "sword of justice", "sword-of-justice"],
    modules: { gip: "sword-of-justice" },
  },
  {
    id: "new-fantasy",
    name: "Project Fantasy",
    aliases: ["project fantasy", "new fantasy", "new-fantasy"],
    modules: { gip: "new-fantasy" },
  },
  // radar 的 mock 端到端样例（content-radar 也有同一条 mock）
  {
    id: "star-voyage",
    name: "星海远征 (Star Voyage)",
    aliases: ["星海远征", "star voyage", "g-1001"],
    modules: { radar: "g-1001", contentRadar: "g-1001" },
  },
  {
    id: "aether-tower",
    name: "幻塔纪元 (Aether Tower)",
    aliases: ["幻塔纪元", "aether tower", "g-1002"],
    modules: { radar: "g-1002" },
  },
];

/** 归一化：小写 + 去掉空白/连字符/冒号/下划线，便于「Free Fire」「free-fire」「freefire」互相匹配。 */
export function normalizeKey(input: string): string {
  return (input ?? "").toLowerCase().trim().replace(/[\s\-:_]+/g, "");
}

const EXACT_INDEX = new Map<string, GameEntry>();
for (const game of GAMES) {
  for (const key of [game.id, game.name, ...game.aliases]) {
    const norm = normalizeKey(key);
    if (norm && !EXACT_INDEX.has(norm)) EXACT_INDEX.set(norm, game);
  }
}

/** 把任意输入（规范 id / 模块本地 id / 游戏名 / 别名 / 搜索词）解析为登记表里的游戏。 */
export function resolveGame(input?: string | null): GameEntry | undefined {
  if (!input) return undefined;
  const norm = normalizeKey(input);
  if (!norm) return undefined;
  // 1) 精确（含别名）匹配
  const exact = EXACT_INDEX.get(norm);
  if (exact) return exact;
  // 2) 子串匹配（搜索词更短/更长时的兜底），取第一个命中
  for (const game of GAMES) {
    const candidates = [game.id, game.name, ...game.aliases].map(normalizeKey);
    if (candidates.some((c) => c.length >= 2 && (c.includes(norm) || norm.includes(c)))) {
      return game;
    }
  }
  return undefined;
}

/** 某游戏在某模块的「本地 gameId」（没有数据则 undefined）。 */
export function moduleGameId(game: GameEntry | undefined, module: ModuleKey): string | undefined {
  return game?.modules[module];
}

/** 某游戏在某模块是否有数据。 */
export function gameHasModule(input: string | GameEntry | undefined, module: ModuleKey): boolean {
  const game = typeof input === "string" ? resolveGame(input) : input;
  return Boolean(game?.modules[module]);
}

/** 跳到某模块、携带该模块本地 gameId 的 href（该模块无数据则 undefined）。 */
export function hrefForModule(game: GameEntry | undefined, module: ModuleKey): string | undefined {
  const localId = moduleGameId(game, module);
  if (!localId) return undefined;
  return `${MODULE_PATH[module]}?gameId=${encodeURIComponent(localId)}`;
}

// 动线优先级：发现(内容/情报) → 诊断 → 预算
const DEFAULT_ORDER: ModuleKey[] = ["contentRadar", "diagnosis", "gip", "radar"];

/** 该游戏第一个「有数据」的模块（按动线优先级）。 */
export function firstAvailableModule(
  game: GameEntry | undefined,
  order: ModuleKey[] = DEFAULT_ORDER
): ModuleKey | undefined {
  return game ? order.find((m) => Boolean(game.modules[m])) : undefined;
}

/** 搜索词 → 落地页。解析到游戏就带 gameId 跳到它「有数据」的首个模块；否则返回 undefined 让调用方走兜底。 */
export function searchTarget(input: string): { href: string; game: GameEntry; module: ModuleKey } | undefined {
  const game = resolveGame(input);
  if (!game) return undefined;
  const module = firstAvailableModule(game);
  if (!module) return undefined;
  const href = hrefForModule(game, module);
  if (!href) return undefined;
  return { href, game, module };
}
