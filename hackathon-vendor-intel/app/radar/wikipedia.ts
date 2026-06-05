import type { GameProject } from "./database";

// Native MediaWiki/Wikidata API client for radar data backfill.
// This module does not depend on Codex Wikipedia MCP or any external skill runtime.
export type WikipediaBackfillMode = "full" | "incremental";

export type WikipediaGameInfo = {
  title: string;
  url: string;
  language: string;
  wikidataId: string;
  description: string;
  publishers: string[];
  developers: string[];
  releaseDates: string[];
  platforms: string[];
  genres: string[];
};

export type WikipediaBackfillResult = {
  mode: WikipediaBackfillMode;
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  done: boolean;
  checked: number;
  updated: number;
  skipped: number;
  failed: number;
  failures: Array<{ game: string; reason: string }>;
};

const contactEmail = "gardner@bytedance.com";
const appVersion = "gamemove/1.0";
const userAgent = `${appVersion} (${contactEmail})`;
const languages = ["en", "zh", "ja", "ko", "es"];

type WikipediaPage = {
  title: string;
  fullurl: string;
  description?: string;
  missing?: unknown;
  pageprops?: {
    wikibase_item?: string;
  };
};

type WikidataEntity = {
  claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>>;
  labels?: Record<string, { value?: string }>;
  descriptions?: Record<string, { value?: string }>;
};

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function normalizeTitle(value: string) {
  return value.replace(/_/g, " ").trim().toLowerCase();
}

function titleFromWikipediaUrl(url?: string) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const language = parsed.hostname.split(".")[0];
    const title = decodeURIComponent(parsed.pathname.replace(/^\/wiki\//, ""));

    if (!language || !title || parsed.pathname === title) {
      return null;
    }

    return { language, title };
  } catch {
    return null;
  }
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

async function readWikipediaPage(language: string, pageTitle: string) {
  const params = new URLSearchParams({
    action: "query",
    titles: pageTitle,
    prop: "pageprops|description|info",
    inprop: "url",
    redirects: "1",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson<{ query?: { pages?: Record<string, WikipediaPage> } }>(
    `https://${language}.wikipedia.org/w/api.php?${params}`
  );
  const page = Object.values(json.query?.pages ?? {})[0];

  if (!page || page.missing !== undefined) {
    throw new Error(`Wikipedia page not found: ${language}:${pageTitle}`);
  }

  return page;
}

async function searchWikipediaPage(language: string, query: string) {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `${query} video game`,
    srlimit: "5",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson<{ query?: { search?: Array<{ title: string }> } }>(
    `https://${language}.wikipedia.org/w/api.php?${params}`
  );
  const normalizedQuery = normalizeTitle(query);
  const result = json.query?.search?.find((item) => normalizeTitle(item.title) === normalizedQuery) ?? json.query?.search?.[0];

  return result?.title;
}

async function readWikidataEntity(entityId: string) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: entityId,
    props: "claims|labels|descriptions|sitelinks",
    languages: "en|zh|ja|ko|es|mul",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson<{ entities?: Record<string, WikidataEntity> }>(
    `https://www.wikidata.org/w/api.php?${params}`
  );

  return json.entities?.[entityId] ?? null;
}

function claimValues(entity: WikidataEntity | null, property: string) {
  return (entity?.claims?.[property] ?? []).map((claim) => claim.mainsnak?.datavalue?.value).filter(Boolean);
}

function entityIds(entity: WikidataEntity | null, property: string) {
  return claimValues(entity, property)
    .map((value) => (typeof value === "object" && value && "id" in value ? String(value.id) : ""))
    .filter(Boolean);
}

function releaseDates(entity: WikidataEntity | null) {
  return claimValues(entity, "P577")
    .map((value) => (typeof value === "object" && value && "time" in value ? String(value.time) : ""))
    .map((value) => value.replace(/^\+/, "").slice(0, 10))
    .filter((value) => value && !value.includes("00"))
    .sort();
}

async function labelsForEntityIds(ids: string[]) {
  const uniqueIds = unique(ids);

  if (uniqueIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: uniqueIds.join("|"),
    props: "labels",
    languages: "en|zh|ja|ko|es|mul",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson<{ entities?: Record<string, WikidataEntity> }>(
    `https://www.wikidata.org/w/api.php?${params}`
  );

  return uniqueIds
    .map((id) => {
      const labels = json.entities?.[id]?.labels;
      return labels?.en?.value ?? labels?.mul?.value ?? labels?.zh?.value ?? labels?.ja?.value ?? labels?.ko?.value ?? labels?.es?.value;
    })
    .filter((value): value is string => Boolean(value));
}

async function findWikipediaPage(game: Pick<GameProject, "name" | "aliases" | "wikipediaTitle" | "wikipediaUrl">) {
  const urlCandidate = titleFromWikipediaUrl(game.wikipediaUrl);
  const titles = unique([urlCandidate?.title, game.wikipediaTitle, game.name, ...(game.aliases ?? [])]);
  const preferredLanguages = unique([urlCandidate?.language, ...languages]);

  for (const language of preferredLanguages) {
    for (const title of titles) {
      try {
        return { language, page: await readWikipediaPage(language, title) };
      } catch {
        // Try the next title/language pair.
      }
    }
  }

  for (const language of preferredLanguages) {
    for (const title of titles) {
      const searchedTitle = await searchWikipediaPage(language, title);
      if (!searchedTitle) {
        continue;
      }

      try {
        return { language, page: await readWikipediaPage(language, searchedTitle) };
      } catch {
        // Keep searching.
      }
    }
  }

  throw new Error(`No Wikipedia page found for ${game.name}`);
}

export async function readWikipediaGameInfo(
  game: Pick<GameProject, "name" | "aliases" | "wikipediaTitle" | "wikipediaUrl">
): Promise<WikipediaGameInfo> {
  const { language, page } = await findWikipediaPage(game);
  const wikidataId = page.pageprops?.wikibase_item ?? "";
  const entity = wikidataId ? await readWikidataEntity(wikidataId) : null;
  const publishers = await labelsForEntityIds(entityIds(entity, "P123"));
  const developers = await labelsForEntityIds(entityIds(entity, "P178"));
  const platforms = await labelsForEntityIds(entityIds(entity, "P400"));
  const genres = await labelsForEntityIds(entityIds(entity, "P136"));

  return {
    title: page.title,
    url: page.fullurl,
    language,
    wikidataId,
    description: page.description ?? entity?.descriptions?.en?.value ?? entity?.descriptions?.mul?.value ?? "",
    publishers,
    developers,
    releaseDates: releaseDates(entity),
    platforms,
    genres,
  };
}

export function applyWikipediaInfoToGame(game: GameProject, info: WikipediaGameInfo) {
  let changed = false;
  const next = new Date().toISOString();

  function setString<K extends keyof GameProject>(key: K, value: string | undefined) {
    if (value && game[key] !== value) {
      (game[key] as string) = value;
      changed = true;
    }
  }

  function setArrayIfMissing<K extends keyof GameProject>(key: K, value: string[]) {
    const currentValue = game[key];
    if (value.length > 0 && Array.isArray(currentValue) && currentValue.length === 0) {
      (game[key] as string[]) = value;
      changed = true;
    }
  }

  setString("wikipediaUrl", info.url);
  setString("wikipediaTitle", info.title);
  setString("wikipediaDescription", info.description);
  setString("publisher", info.publishers.join(" / "));
  setString("developer", info.developers.join(" / "));
  setString("releaseDate", info.releaseDates[0]);

  if (info.platforms.length > 0) {
    setArrayIfMissing("platforms", info.platforms);
  }

  if (info.genres.length > 0) {
    setArrayIfMissing("genres", info.genres);
  }

  const releaseDate = info.releaseDates[0];
  if (releaseDate) {
    const released = Date.parse(releaseDate) <= Date.now();
    const nextStage = released ? "正式上线" : "待上线";
    if (game.stage !== nextStage) {
      game.stage = nextStage;
      changed = true;
    }
  }

  if (changed) {
    game.updatedAt = next;
  }

  game.wikipediaLastCheckedAt = next;

  return changed;
}

export function shouldUpdateWikipediaGame(game: GameProject, mode: WikipediaBackfillMode) {
  if (mode === "full") {
    return true;
  }

  const hasVendor = Boolean(game.publisher || game.developer);
  const hasRelease = Boolean(game.releaseDate);
  const hasWiki = Boolean(game.wikipediaUrl);

  if (!hasVendor || !hasRelease || !hasWiki) {
    return true;
  }

  const lastCheckedAt = Date.parse(game.wikipediaLastCheckedAt ?? "");
  if (Number.isNaN(lastCheckedAt)) {
    return true;
  }

  return Date.now() - lastCheckedAt > 7 * 24 * 60 * 60 * 1000;
}
