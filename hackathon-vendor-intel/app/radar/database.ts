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

const updates: GameUpdate[] = imported.updates.map((update) => {
  const game = gameById.get(update.gameId);

  return {
    ...update,
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

export function listGameMoves(filters: RadarFilters = {}): GameMove[] {
  const query = filters.q?.trim().toLowerCase();

  return updates
    .map(mapUpdateToGameMove)
    .filter((move): move is GameMove => Boolean(move))
    .filter((move) => {
      const matchedGame = !filters.gameId || move.gameId === filters.gameId;
      const matchedType = !filters.type || move.moveType === filters.type;
      const matchedQuery =
        !query ||
        [move.name, move.category, move.moveType, move.summary, move.source].some((field) =>
          field.toLowerCase().includes(query)
        );

      return matchedGame && matchedType && matchedQuery;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
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
      latestUpdateDate: updates.map((update) => update.updateDate).sort().at(-1) ?? "",
    },
    mapping: gameMoveMapping,
  };
}

export function getRadarTable(table: RadarTableName, filters: RadarFilters = {}) {
  const snapshot = getRadarDatabaseSnapshot(filters);
  return snapshot[table];
}
