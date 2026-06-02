import type { GameMove } from "@/types/contract";

export type VendorCompany = {
  id: string;
  name: string;
  aliases: string[];
  region: string;
  headquartersCountry: string;
  description: string;
  website: string;
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
  latestProgress: string;
  officialSite: string;
  platforms: string[];
  relevanceScore: number;
  discoverySource: string;
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
  importance: number;
  updateType?: GameMove["moveType"];
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

const companies: VendorCompany[] = [
  {
    id: "c-deepspace",
    name: "深空互动",
    aliases: ["Deep Space Interactive"],
    region: "中国",
    headquartersCountry: "中国",
    description: "SLG 与科幻题材游戏厂商，近期在海外内容营销动作频繁。",
    website: "https://example.com/deepspace",
    updatedAt: "2026-05-28",
  },
  {
    id: "c-aetherlight",
    name: "幻光游戏",
    aliases: ["Aetherlight Games"],
    region: "全球",
    headquartersCountry: "新加坡",
    description: "RPG 新游发行商，公测期重点观察投放与达人内容表现。",
    website: "https://example.com/aetherlight",
    updatedAt: "2026-05-30",
  },
  {
    id: "c-orbitjoy",
    name: "环星娱乐",
    aliases: ["Orbit Joy"],
    region: "欧美",
    headquartersCountry: "美国",
    description: "休闲竞技与社交玩法厂商，适合跟踪活动节点与 UGC 爆发。",
    website: "https://example.com/orbitjoy",
    updatedAt: "2026-05-26",
  },
];

const games: GameProject[] = [
  {
    id: "g-1001",
    name: "星海远征 (Star Voyage)",
    aliases: ["Star Voyage", "星海远征"],
    companyId: "c-deepspace",
    releaseRegions: ["北美", "东南亚"],
    stage: "上线运营",
    expectedLaunchDate: "2026-05-28",
    genres: ["SLG"],
    otherInfo: "2.0 资料片后适合观察赛季制内容与舰队玩法传播。",
    ttOperationStatus: "已合作",
    latestProgress: "上线 2.0 资料片『深空纪元』，新增舰队系统与赛季玩法。",
    officialSite: "https://example.com/star-voyage",
    platforms: ["iOS", "Android", "PC"],
    relevanceScore: 92,
    discoverySource: "厂商官方公告",
    updatedAt: "2026-05-28",
  },
  {
    id: "g-1002",
    name: "幻塔纪元 (Aether Tower)",
    aliases: ["Aether Tower", "幻塔纪元"],
    companyId: "c-aetherlight",
    releaseRegions: ["全球"],
    stage: "公测",
    expectedLaunchDate: "2026-05-30",
    genres: ["RPG"],
    otherInfo: "全球公测首周冲榜，海外买量与内容投放同步加码。",
    ttOperationStatus: "待拓展",
    latestProgress: "全球公测开启，首周冲榜，海外买量明显加码。",
    officialSite: "https://example.com/aether-tower",
    platforms: ["iOS", "Android"],
    relevanceScore: 88,
    discoverySource: "App Store 榜单 + 投放监测",
    updatedAt: "2026-05-30",
  },
  {
    id: "g-1003",
    name: "极速派对 (Turbo Party)",
    aliases: ["Turbo Party"],
    companyId: "c-orbitjoy",
    releaseRegions: ["北美", "欧洲"],
    stage: "上线运营",
    expectedLaunchDate: "2026-05-26",
    genres: ["休闲竞技"],
    otherInfo: "短视频挑战赛素材丰富，适合观察活动带来的 UGC 变化。",
    ttOperationStatus: "观察中",
    latestProgress: "开启夏季竞速挑战活动，新增多人限时赛和达人榜单。",
    officialSite: "https://example.com/turbo-party",
    platforms: ["iOS", "Android"],
    relevanceScore: 78,
    discoverySource: "TikTok 话题热度 + 官方社媒",
    updatedAt: "2026-05-26",
  },
];

const updates: GameUpdate[] = [
  {
    id: "u-2001",
    summary: "上线 2.0 资料片『深空纪元』，新增舰队系统与赛季玩法。",
    updateDate: "2026-05-28",
    gameId: "g-1001",
    companyId: "c-deepspace",
    detail: "资料片带来新舰队养成、跨服赛季和限定剧情，预计带动硬核 SLG 达人内容产出。",
    sourceUrl: "https://example.com/star-voyage/2-0",
    sourceName: "厂商官方公告",
    sourcePublishedAt: "2026-05-28",
    importance: 5,
    updateType: "大版本",
    updatedAt: "2026-05-28",
  },
  {
    id: "u-2002",
    summary: "全球公测开启，首周冲榜，海外买量明显加码。",
    updateDate: "2026-05-30",
    gameId: "g-1002",
    companyId: "c-aetherlight",
    detail: "上线后进入多个地区下载榜前列，同时出现密集信息流素材与首发达人内容。",
    sourceUrl: "https://example.com/aether-tower/launch",
    sourceName: "App Store 榜单 + 投放监测",
    sourcePublishedAt: "2026-05-30",
    importance: 5,
    updateType: "新游",
    updatedAt: "2026-05-30",
  },
  {
    id: "u-2003",
    summary: "开启夏季竞速挑战活动，新增多人限时赛和达人榜单。",
    updateDate: "2026-05-26",
    gameId: "g-1003",
    companyId: "c-orbitjoy",
    detail: "活动机制天然适合短视频挑战，建议观察话题播放和达人报名趋势。",
    sourceUrl: "https://example.com/turbo-party/summer-race",
    sourceName: "TikTok 话题热度 + 官方社媒",
    sourcePublishedAt: "2026-05-26",
    importance: 3,
    updateType: "活动",
    updatedAt: "2026-05-26",
  },
];

export const gameMoveMapping: Record<keyof GameMove, string> = {
  gameId: "games.id",
  name: "games.name",
  category: "games.genres[0]",
  moveType: "updates.updateType；缺省时根据 games.stage / updates.summary 推断",
  summary: "updates.summary；缺省时使用 games.latestProgress",
  source: "updates.sourceName；缺省时使用 games.discoverySource / companies.name",
  date: "updates.updateDate；缺省时使用 games.expectedLaunchDate / games.updatedAt",
};

function findGame(gameId: string) {
  return games.find((game) => game.id === gameId);
}

function findCompany(companyId: string) {
  return companies.find((company) => company.id === companyId);
}

function inferMoveType(game: GameProject, update?: GameUpdate): GameMove["moveType"] {
  if (update?.updateType) {
    return update.updateType;
  }

  const text = `${game.stage} ${game.latestProgress} ${update?.summary ?? ""}`;
  if (text.includes("公测") || text.includes("首发") || text.includes("上线")) {
    return "新游";
  }
  if (text.includes("资料片") || text.includes("大版本") || text.includes("赛季")) {
    return "大版本";
  }
  if (text.includes("活动") || text.includes("挑战")) {
    return "活动";
  }
  return "版本更新";
}

function includesKeyword(values: Array<string | number | string[]>, query?: string | null) {
  const keyword = query?.trim().toLowerCase();
  if (!keyword) {
    return true;
  }

  return values.some((value) => {
    const text = Array.isArray(value) ? value.join(" ") : String(value);
    return text.toLowerCase().includes(keyword);
  });
}

export function mapUpdateToGameMove(update: GameUpdate): GameMove | null {
  const game = findGame(update.gameId);
  if (!game) {
    return null;
  }

  const company = findCompany(update.companyId);

  return {
    gameId: game.id,
    name: game.name,
    category: game.genres[0] ?? "未分类",
    moveType: inferMoveType(game, update),
    summary: update.summary || game.latestProgress,
    source: update.sourceName || game.discoverySource || company?.name || "未知来源",
    date: update.updateDate || game.expectedLaunchDate || game.updatedAt,
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
      [game.name, game.aliases, game.stage, game.genres, game.releaseRegions, game.latestProgress, game.otherInfo],
      filters.q
    )
  );
  const filteredUpdates = updates.filter((update) =>
    includesKeyword(
      [update.summary, update.detail, update.sourceName, update.updateType ?? "", update.gameId, update.companyId],
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
