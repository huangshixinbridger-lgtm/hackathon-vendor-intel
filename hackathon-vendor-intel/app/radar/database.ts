import type { GameMove } from "@/types/contract";
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
  platforms: string[];
  relevanceScore: number;
  relevanceReasons?: string[];
  discoverySource: string;
  isBackfilled?: boolean;
  feishuRecordId?: string;
  createdAt?: string;
  updatedAt: string;
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

export type RadarTableName = "companies" | "games" | "updates" | "gameMoves";
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
  games: GameProject[];
  updates: GameUpdate[];
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

const imported = radarData as ImportedRadarData;

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

export function getRadarDatabaseSnapshot(filters: RadarFilters = {}): RadarDatabaseSnapshot {
  const gameMoves = listGameMoves(filters);
  const filteredCompanies = companies.filter((company) =>
    includesKeyword(
      [company.name, company.aliases, company.region, company.headquartersCountry, company.description],
      filters.q
    )
  );
  const filteredGames = games.filter((game) =>
    includesKeyword(
      [
        game.name,
        game.aliases,
        game.stage,
        game.genres,
        game.releaseRegions,
        game.latestProgress,
        game.otherInfo,
        game.ttOperationStatus,
        game.discoverySource,
      ],
      filters.q
    )
  );
  const filteredUpdates = updates.filter((update) =>
    includesKeyword(
      [
        update.summary,
        update.detail,
        update.sourceName,
        update.updateType,
        update.gameId,
        update.companyId,
        update.sourceUrl,
      ],
      filters.q
    )
  );

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
