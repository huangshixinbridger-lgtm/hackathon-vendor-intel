import type { GameMove } from "@/types/contract";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import radarData from "./radar-data.json";

export type VendorCompany = {
  id: string;
  name: string;
  aliases: string[];
  region: string;
  headquartersCountry: string;
  description: string;
  website: string;
  feishuRecordId?: string;
  wikipediaUrl?: string;
  wikipediaTitle?: string;
  wikipediaDescription?: string;
  createdAt?: string;
  updatedAt: string;
};

export type GameProject = {
  id: string;
  name: string;
  aliases: string[];
  companyId: string;
  releaseRegions: string[];
  stage: string;
  expectedLaunchDate: string;
  genres: string[];
  otherInfo: string;
  ttOperationStatus: string;
  ttNotes?: string;
  latestProgress: string;
  officialSite: string;
  publisher?: string;
  developer?: string;
  releaseDate?: string;
  platforms: string[];
  relevanceScore: number;
  relevanceReasons?: string[];
  discoverySource: string;
  isBackfilled?: boolean;
  feishuRecordId?: string;
  wikipediaUrl?: string;
  wikipediaTitle?: string;
  wikipediaDescription?: string;
  createdAt?: string;
  updatedAt: string;
};

export type GameProjectRow = GameProject & {
  companyName: string;
};

export type GameUpdate = {
  id: string;
  summary: string;
  updateDate: string;
  gameId: string;
  companyId: string;
  detail: string;
  sourceUrl: string;
  sourceName: string;
  sourcePublishedAt: string;
  contentHash?: string;
  importance: number;
  updateType?: GameMove["moveType"];
  feishuRecordId?: string;
  createdAt?: string;
  updatedAt: string;
};

export type RadarTableName = "companies" | "games" | "updates";
export type DateWindow = "24h" | "7d" | "30d" | "all";
export type IntelligenceItem = GameMove & {
  id: string;
  companyId: string;
  companyName: string;
  region: string;
  importance: number;
  operationMeaning: string;
  detail: string;
  sourceUrl: string;
};

export type RadarDatabaseSnapshot = {
  companies: VendorCompany[];
  games: GameProjectRow[];
  updates: IntelligenceItem[];
  gameMoves: GameMove[];
  stats: {
    companyCount: number;
    gameCount: number;
    updateCount: number;
    gameMoveCount: number;
    latestUpdateDate: string;
  };
  mapping: Record<keyof GameMove, string>;
};

export type DailySummary = {
  date: string;
  total: number;
  highImportanceCount: number;
  items: IntelligenceItem[];
};

export type TodaySummaryStats = {
  date: string;
  updateCount: number;
  gameNames: string[];
  companyNames: string[];
  topItems: IntelligenceItem[];
};

export type RefreshResult = {
  inserted: number;
  skipped: number;
  date: string;
  sources: string[];
};

export type RadarFilters = {
  q?: string | null;
  type?: GameMove["moveType"] | null;
  gameId?: string | null;
  dateWindow?: DateWindow | null;
  minImportance?: number | null;
  table?: RadarTableName | null;
};

type ImportedRadarData = {
  companies: VendorCompany[];
  games: GameProject[];
  updates: Omit<GameUpdate, "updateType">[];
};

const dataPath = path.join(process.cwd(), "app/radar/radar-data.json");

function loadImportedData(): ImportedRadarData {
  try {
    return JSON.parse(readFileSync(dataPath, "utf8")) as ImportedRadarData;
  } catch {
    return radarData as ImportedRadarData;
  }
}

const imported = loadImportedData();

// —— DEMO：hero 游戏 Free Fire，用于「搜一个游戏从头跑到尾」端到端联动演示（非真实抓取数据）——
const DEMO_FREEFIRE_COMPANY: VendorCompany = {
  id: "demo-garena",
  name: "Garena",
  aliases: ["Sea Limited", "Garena Free Fire"],
  region: "SEA",
  headquartersCountry: "SG",
  description: "Free Fire 发行商（演示数据）",
  website: "https://www.garena.com",
  updatedAt: "2026-06-04T00:00:00.000Z",
};

const DEMO_FREEFIRE_GAME: GameProject = {
  id: "freefire",
  name: "Free Fire",
  aliases: ["Garena Free Fire", "FF", "自由火"],
  companyId: "demo-garena",
  releaseRegions: ["BR", "ID", "TH", "IN", "MX"],
  stage: "运营中",
  expectedLaunchDate: "",
  genres: ["Shooter", "Battle Royale"],
  otherInfo: "演示数据：TikTok 全球播放头部的吃鸡手游",
  ttOperationStatus: "重点运营",
  latestProgress: "OB49 版本 + 巴西嘉年华联动节点",
  officialSite: "https://ff.garena.com",
  platforms: ["iOS", "Android"],
  relevanceScore: 95,
  discoverySource: "演示数据",
  updatedAt: "2026-06-04T00:00:00.000Z",
};

const DEMO_FREEFIRE_RAW_UPDATES: Omit<GameUpdate, "updateType">[] = [
  {
    id: "demo-ff-1",
    summary: "Free Fire OB49 版本上线：新角色、新模式与巴西嘉年华联动",
    updateDate: "2026-06-04",
    gameId: "freefire",
    companyId: "demo-garena",
    detail: "OB49 大版本更新上线，新增角色与限时模式，并开启巴西嘉年华联动活动（演示数据）。",
    sourceUrl: "https://ff.garena.com",
    sourceName: "Garena 官方（演示）",
    sourcePublishedAt: "Thu, 04 Jun 2026 09:00:00 +0000",
    contentHash: "demo-ff-ob49",
    importance: 4,
    feishuRecordId: "",
    createdAt: "2026-06-04T00:00:00.000Z",
    updatedAt: "2026-06-04T00:00:00.000Z",
  },
  {
    id: "demo-ff-2",
    summary: "Free Fire x 巴西嘉年华联动活动开启，限定皮肤返场",
    updateDate: "2026-06-03",
    gameId: "freefire",
    companyId: "demo-garena",
    detail: "围绕巴西嘉年华的联动活动开启，限定皮肤返场，BR 市场短视频与直播热度走高（演示数据）。",
    sourceUrl: "https://ff.garena.com",
    sourceName: "Garena 官方（演示）",
    sourcePublishedAt: "Wed, 03 Jun 2026 09:00:00 +0000",
    contentHash: "demo-ff-carnival",
    importance: 3,
    feishuRecordId: "",
    createdAt: "2026-06-03T00:00:00.000Z",
    updatedAt: "2026-06-03T00:00:00.000Z",
  },
  {
    id: "demo-ff-3",
    summary: "Free Fire World Series 2026 总决赛定档，赛事内容预热",
    updateDate: "2026-05-20",
    gameId: "freefire",
    companyId: "demo-garena",
    detail: "FFWS 2026 总决赛定档，官方启动赛事内容预热，适合提前规划赛事期达人放量（演示数据）。",
    sourceUrl: "https://ff.garena.com",
    sourceName: "Garena 官方（演示）",
    sourcePublishedAt: "Tue, 20 May 2026 09:00:00 +0000",
    contentHash: "demo-ff-ffws",
    importance: 4,
    feishuRecordId: "",
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
];

const companies = [DEMO_FREEFIRE_COMPANY, ...imported.companies];
const games = [DEMO_FREEFIRE_GAME, ...imported.games];

const gameById = new Map(games.map((game) => [game.id, game]));
const companyById = new Map(companies.map((company) => [company.id, company]));

export const gameMoveMapping: Record<keyof GameMove, string> = {
  gameId: "games.id；厂商动态无 game_id 时使用 company-{companies.id}",
  name: "games.name；厂商动态无 game_id 时使用 companies.name",
  category: "games.genres[0]；厂商动态无 game_id 时为厂商动态",
  moveType: "旧库无直接字段；根据 updates.summary/detail + games.stage/latest_progress 推断",
  summary: "updates.summary；为空时使用 games.latest_progress",
  source: "updates.source_name；为空时使用 games.discovery_source / companies.name",
  date: "updates.update_date；为空时使用 games.expected_launch_date / games.updated_at",
};

function normalizeText(value: string) {
  return value.toLowerCase();
}

function inferMoveType(game: GameProject, update?: Pick<GameUpdate, "summary" | "detail">): GameMove["moveType"] {
  const text = normalizeText(`${game.stage} ${game.latestProgress} ${update?.summary ?? ""} ${update?.detail ?? ""}`);

  if (/(活动|挑战|赛事|联动|campaign|event|collab|tournament)/i.test(text)) {
    return "活动";
  }

  if (/(大版本|资料片|赛季|版本更新|更新|dlc|expansion|patch|season|update)/i.test(text)) {
    return "大版本";
  }

  if (/(新游|公测|首发|预约|发售|上线|launch|released|release date|pre-register|beta)/i.test(text)) {
    return "新游";
  }

  return "版本更新";
}

function inferImportance(update: Omit<GameUpdate, "updateType">, game?: GameProject) {
  const text = normalizeText(`${update.summary} ${update.detail} ${game?.stage ?? ""} ${game?.latestProgress ?? ""}`);
  let score = Math.max(1, Math.min(5, update.importance || 1));

  if (/(launch|launched|上线|公测|release date|pre-register|预约|beta|soft launch)/i.test(text)) {
    score += 1;
  }

  if (/(大版本|资料片|dlc|expansion|season|赛季|major update)/i.test(text)) {
    score += 1;
  }

  if (/(revenue|net bookings|downloads|sales|收入|流水|下载|销量|profit|net income)/i.test(text)) {
    score += 1;
  }

  if (/(acquisition|funding|layoff|cancels|shut down|end of service|收购|融资|裁员|取消|停服)/i.test(text)) {
    score += 1;
  }

  if (game && game.relevanceScore >= 80) {
    score += 1;
  }

  return Math.min(5, score);
}

function getLatestUpdateDate() {
  return updates.map((update) => update.updateDate).sort().at(-1) ?? "";
}

function isWithinDateWindow(date: string, dateWindow?: DateWindow | null) {
  if (!dateWindow || dateWindow === "all") {
    return true;
  }

  const latest = getLatestUpdateDate();
  const latestTime = Date.parse(latest);
  const currentTime = Date.parse(date);
  if (Number.isNaN(latestTime) || Number.isNaN(currentTime)) {
    return true;
  }

  const days = dateWindow === "24h" ? 1 : dateWindow === "7d" ? 7 : 30;
  return latestTime - currentTime <= days * 24 * 60 * 60 * 1000;
}

function getOperationMeaning(move: GameMove, update: GameUpdate, company?: VendorCompany) {
  const owner = company?.name ? `${company.name} 的` : "";
  const sourceHint = update.sourceName ? `来源 ${update.sourceName}` : "来源已记录";

  if (move.moveType === "新游") {
    return `${owner}${move.name}进入上线/测试窗口，适合优先确认发行节奏、目标地区和 GIP 首轮达人预算。${sourceHint}。`;
  }

  if (move.moveType === "大版本") {
    return `${owner}${move.name}出现大版本或资料片节点，适合围绕新内容做诊断，并评估是否承接版本营销预算。${sourceHint}。`;
  }

  if (move.moveType === "活动") {
    return `${owner}${move.name}出现赛事、联动或活动信号，适合快速判断活动周期内是否能组织短视频/直播达人放量。${sourceHint}。`;
  }

  if (move.category === "厂商动态") {
    return `${move.name}出现厂商级经营动态，适合运营关注该厂商近期预算、组织或发行策略变化，判断是否需要跟进拜访。${sourceHint}。`;
  }

  return `${owner}${move.name}有持续动态更新，适合纳入日常巡逻，结合诊断与 GIP 消耗判断是否存在跟进机会。${sourceHint}。`;
}

const updates: GameUpdate[] = [...DEMO_FREEFIRE_RAW_UPDATES, ...imported.updates].map((update) => {
  const game = gameById.get(update.gameId);

  return {
    ...update,
    importance: inferImportance(update, game),
    updateType: game ? inferMoveType(game, update) : "版本更新",
  };
});

function saveImportedData() {
  // serverless/只读文件系统（如 Vercel）上写 bundle 目录会抛 EROFS。
  // 刷新后的数据已在内存里更新并返回，落盘失败不应让请求 500，因此吞掉写盘错误。
  try {
    writeFileSync(
      dataPath,
      `${JSON.stringify(
        {
          ...(imported as object),
          importedAt: new Date().toISOString(),
          // 落盘只保留真实抓取数据；DEMO（Free Fire）仅存在于内存，不写回 radar-data.json
          companies: imported.companies,
          games: imported.games,
          updates: imported.updates,
        },
        null,
        2
      )}\n`,
      "utf8"
    );
  } catch (error) {
    console.warn("[radar] 跳过 radar-data.json 落盘（只读文件系统/serverless）：", error);
    return;
  }
}

function findGame(gameId: string) {
  return gameById.get(gameId);
}

function findCompany(companyId: string) {
  return companyById.get(companyId);
}

function includesKeyword(values: Array<string | number | boolean | string[] | undefined>, query?: string | null) {
  const keyword = query?.trim().toLowerCase();
  if (!keyword) {
    return true;
  }

  return values.some((value) => {
    if (value === undefined) {
      return false;
    }

    const text = Array.isArray(value) ? value.join(" ") : String(value);
    return text.toLowerCase().includes(keyword);
  });
}

export function mapUpdateToGameMove(update: GameUpdate): GameMove | null {
  const game = findGame(update.gameId);
  const company = findCompany(update.companyId || game?.companyId || "");

  if (!game && !company) {
    return {
      gameId: `update-${update.id}`,
      name: update.summary,
      category: "未分类",
      moveType: "版本更新",
      summary: update.summary,
      source: update.sourceName || "未知来源",
      date: update.updateDate || update.updatedAt,
    };
  }

  return {
    gameId: game?.id ?? `company-${company?.id}`,
    name: game?.name ?? company?.name ?? update.summary,
    category: game ? game.genres[0] ?? "未分类" : "厂商动态",
    moveType: game ? update.updateType ?? inferMoveType(game, update) : update.updateType ?? "版本更新",
    summary: update.summary || game?.latestProgress || company?.description || "",
    source: update.sourceName || game?.discoverySource || company?.name || "未知来源",
    date: update.updateDate || game?.expectedLaunchDate || game?.updatedAt || update.updatedAt,
  };
}

export function mapUpdateToIntelligenceItem(update: GameUpdate): IntelligenceItem | null {
  const move = mapUpdateToGameMove(update);
  if (!move) {
    return null;
  }

  const game = findGame(update.gameId);
  const company = findCompany(update.companyId || game?.companyId || "");

  return {
    ...move,
    id: update.id,
    companyId: company?.id ?? "",
    companyName: company?.name ?? "",
    region: company?.region || game?.releaseRegions[0] || "未知地区",
    importance: update.importance,
    operationMeaning: getOperationMeaning(move, update, company),
    detail: update.detail,
    sourceUrl: update.sourceUrl,
  };
}

export function listIntelligenceItems(filters: RadarFilters = {}): IntelligenceItem[] {
  const query = filters.q?.trim().toLowerCase();

  return updates
    .map(mapUpdateToIntelligenceItem)
    .filter((item): item is IntelligenceItem => Boolean(item))
    .filter((item) => {
      const matchedGame = !filters.gameId || item.gameId === filters.gameId;
      const matchedType = !filters.type || item.moveType === filters.type;
      const matchedImportance = !filters.minImportance || item.importance >= filters.minImportance;
      const matchedDate = isWithinDateWindow(item.date, filters.dateWindow);
      const matchedQuery =
        !query ||
        [
          item.name,
          item.category,
          item.moveType,
          item.summary,
          item.source,
          item.companyName,
          item.region,
          item.date,
          item.operationMeaning,
        ].some((field) => field.toLowerCase().includes(query));

      return matchedGame && matchedType && matchedImportance && matchedDate && matchedQuery;
    })
    .sort((a, b) => b.importance - a.importance || b.date.localeCompare(a.date));
}

export function listGameMoves(filters: RadarFilters = {}): GameMove[] {
  return listIntelligenceItems(filters).map(({ id, companyId, companyName, region, importance, operationMeaning, detail, sourceUrl, ...move }) => move);
}

export function getTodayHighlights() {
  const recentItems = listIntelligenceItems({ dateWindow: "7d" });
  return recentItems.slice(0, 3);
}

export function getDailySummaries(): DailySummary[] {
  const byDate = new Map<string, IntelligenceItem[]>();

  listIntelligenceItems({ dateWindow: "all" }).forEach((item) => {
    const items = byDate.get(item.date) ?? [];
    items.push(item);
    byDate.set(item.date, items);
  });

  return Array.from(byDate.entries())
    .map(([date, items]) => ({
      date,
      total: items.length,
      highImportanceCount: items.filter((item) => item.importance >= 4).length,
      items: items.sort((a, b) => b.importance - a.importance || b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTodaySummaryStats(): TodaySummaryStats {
  const date = getLatestUpdateDate();
  const items = listIntelligenceItems({ dateWindow: "all" }).filter((item) => item.date === date);
  const gameNames = Array.from(
    new Set(items.filter((item) => item.category !== "厂商动态").map((item) => item.name).filter(Boolean))
  ).sort();
  const companyNames = Array.from(new Set(items.map((item) => item.companyName).filter(Boolean))).sort();

  return {
    date,
    updateCount: items.length,
    gameNames,
    companyNames,
    topItems: items.slice(0, 5),
  };
}

const rssSources = [
  { name: "GamesIndustry.biz", url: "https://www.gamesindustry.biz/feed" },
  { name: "PocketGamer.biz", url: "https://www.pocketgamer.biz/rss/" },
  { name: "Gematsu", url: "https://www.gematsu.com/feed" },
  { name: "Game Developer", url: "https://www.gamedeveloper.com/rss.xml" },
];

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function pickXmlValue(item: string, tag: string) {
  return decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
}

function matchKnownEntity(text: string) {
  const normalized = text.toLowerCase();
  const game = games.find((candidate) =>
    [candidate.name, ...candidate.aliases].some((name) => name && normalized.includes(name.toLowerCase()))
  );
  const company = game
    ? findCompany(game.companyId)
    : companies.find((candidate) =>
        [candidate.name, ...candidate.aliases].some((name) => name && normalized.includes(name.toLowerCase()))
      );

  return { game, company };
}

function createContentHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return `rss-${hash.toString(16)}`;
}

export async function runRadarRefresh(): Promise<RefreshResult> {
  const today = new Date().toISOString().slice(0, 10);
  const knownHashes = new Set(imported.updates.map((update) => update.contentHash).filter(Boolean));
  let inserted = 0;
  let skipped = 0;

  for (const source of rssSources) {
    try {
      const response = await fetch(source.url, { cache: "no-store" });
      const xml = await response.text();
      const items = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).slice(0, 12);

      for (const match of items) {
        const raw = match[0];
        const title = pickXmlValue(raw, "title");
        const link = pickXmlValue(raw, "link") || pickXmlValue(raw, "guid");
        const description = pickXmlValue(raw, "description").replace(/<[^>]+>/g, " ");
        const publishedAt = pickXmlValue(raw, "pubDate");
        const contentHash = createContentHash(`${source.name}|${link || title}`);

        if (!title || knownHashes.has(contentHash)) {
          skipped += 1;
          continue;
        }

        const { game, company } = matchKnownEntity(`${title} ${description}`);
        const rawUpdate: Omit<GameUpdate, "updateType"> = {
          id: String(Math.max(0, ...imported.updates.map((update) => Number(update.id) || 0)) + inserted + 1),
          summary: title,
          updateDate: today,
          gameId: game?.id ?? "",
          companyId: company?.id ?? game?.companyId ?? "",
          detail: description || title,
          sourceUrl: link,
          sourceName: source.name,
          sourcePublishedAt: publishedAt,
          contentHash,
          importance: 2,
          feishuRecordId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const inferredUpdate: GameUpdate = {
          ...rawUpdate,
          importance: inferImportance(rawUpdate, game),
          updateType: game ? inferMoveType(game, rawUpdate) : "版本更新",
        };

        imported.updates.push(rawUpdate);
        updates.push(inferredUpdate);
        knownHashes.add(contentHash);
        inserted += 1;
      }
    } catch {
      skipped += 1;
    }
  }

  if (inserted > 0) {
    saveImportedData();
  }

  return {
    inserted,
    skipped,
    date: today,
    sources: rssSources.map((source) => source.name),
  };
}

export function ensureRadarScheduler() {
  // 定时器只在长期运行的进程（本地 dev / 自托管 node）里才有意义。
  // serverless（Vercel/Lambda、edge runtime）是临时实例，setInterval 不会可靠触发，
  // 反而每个热实例泄漏一个计时器，故这里直接跳过；定时刷新改由外部 cron 打 /radar/api/refresh。
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const globalState = globalThis as typeof globalThis & {
    __radarSchedulerStarted?: boolean;
    __radarSchedulerLastRun?: string;
  };

  if (globalState.__radarSchedulerStarted) {
    return;
  }

  globalState.__radarSchedulerStarted = true;
  setInterval(() => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    const runKey = `${get("year")}-${get("month")}-${get("day")}`;

    if (get("hour") === "00" && get("minute") === "00" && globalState.__radarSchedulerLastRun !== runKey) {
      globalState.__radarSchedulerLastRun = runKey;
      void runRadarRefresh();
    }
  }, 60 * 1000);
}

export function getRadarDatabaseSnapshot(filters: RadarFilters = {}): RadarDatabaseSnapshot {
  const gameMoves = listGameMoves(filters);
  const filteredUpdates = listIntelligenceItems(filters).sort(
    (a, b) => b.date.localeCompare(a.date) || b.importance - a.importance
  );
  const relatedCompanyIds = new Set(filteredUpdates.map((update) => update.companyId).filter(Boolean));
  const relatedGameIds = new Set(filteredUpdates.map((update) => update.gameId).filter((gameId) => gameById.has(gameId)));
  const hasQuery = Boolean(filters.q?.trim());
  const filteredCompanies = companies.filter((company) => {
    const matchedKeyword = includesKeyword(
      [
        company.name,
        company.aliases,
        company.region,
        company.headquartersCountry,
        company.description,
        company.updatedAt,
        company.createdAt,
      ],
      filters.q
    );

    return matchedKeyword || (hasQuery && relatedCompanyIds.has(company.id));
  });
  const filteredGames = games
    .map((game) => ({
      ...game,
      companyName: findCompany(game.companyId)?.name ?? "",
    }))
    .filter((game) => {
      const matchedKeyword = includesKeyword(
        [
          game.name,
          game.companyName,
          game.aliases,
          game.stage,
          game.expectedLaunchDate,
          game.releaseDate,
          game.genres,
          game.releaseRegions,
          game.latestProgress,
          game.otherInfo,
          game.ttOperationStatus,
          game.discoverySource,
          game.createdAt,
          game.updatedAt,
        ],
        filters.q
      );

      return matchedKeyword || (hasQuery && relatedGameIds.has(game.id));
    });

  return {
    companies: filteredCompanies,
    games: filteredGames,
    updates: filteredUpdates,
    gameMoves,
    stats: {
      companyCount: companies.length,
      gameCount: games.length,
      updateCount: updates.length,
      gameMoveCount: gameMoves.length,
      latestUpdateDate: getLatestUpdateDate(),
    },
    mapping: gameMoveMapping,
  };
}

export function getRadarTable(table: RadarTableName, filters: RadarFilters = {}) {
  const snapshot = getRadarDatabaseSnapshot(filters);
  return snapshot[table];
}
