import type { GameMove } from "@/types/contract";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import radarData from "./radar-data.json";
import {
  applyWikipediaInfoToGame,
  readWikipediaGameInfo,
  shouldUpdateWikipediaGame,
  type WikipediaBackfillMode,
  type WikipediaBackfillResult,
} from "./wikipedia";

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
  wikipediaLastCheckedAt?: string;
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

const companies = imported.companies;
const games = imported.games;

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

const updates: GameUpdate[] = imported.updates.map((update) => {
  const game = gameById.get(update.gameId);

  return {
    ...update,
    importance: inferImportance(update, game),
    updateType: game ? inferMoveType(game, update) : "版本更新",
  };
});

function saveImportedData() {
  writeFileSync(
    dataPath,
    `${JSON.stringify(
      {
        ...(imported as object),
        importedAt: new Date().toISOString(),
        companies,
        games,
        updates: imported.updates,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
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

export async function runWikipediaGameBackfill(
  mode: WikipediaBackfillMode = "incremental",
  limit = 25,
  offset = 0
): Promise<WikipediaBackfillResult> {
  const candidates = games.filter((game) => shouldUpdateWikipediaGame(game, mode));
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 25;
  const normalizedOffset = Number.isFinite(offset) && offset > 0 ? offset : 0;
  const selectedGames = candidates.slice(normalizedOffset, normalizedOffset + normalizedLimit);
  const nextOffset = normalizedOffset + selectedGames.length;
  const result: WikipediaBackfillResult = {
    mode,
    total: candidates.length,
    offset: normalizedOffset,
    limit: normalizedLimit,
    nextOffset: nextOffset < candidates.length ? nextOffset : null,
    done: nextOffset >= candidates.length,
    checked: 0,
    updated: 0,
    skipped: candidates.length - selectedGames.length,
    failed: 0,
    failures: [],
  };

  for (const game of selectedGames) {
    result.checked += 1;
    try {
      const info = await readWikipediaGameInfo(game);
      if (applyWikipediaInfoToGame(game, info)) {
        result.updated += 1;
      }
    } catch (error) {
      result.failed += 1;
      result.failures.push({
        game: game.name,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (result.updated > 0 || result.checked > 0) {
    saveImportedData();
  }

  return result;
}

export function ensureRadarScheduler() {
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

    if (get("hour") === "01" && get("minute") === "00" && globalState.__radarSchedulerLastRun !== `wiki-${runKey}`) {
      globalState.__radarSchedulerLastRun = `wiki-${runKey}`;
      void runWikipediaGameBackfill("incremental", 25);
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
