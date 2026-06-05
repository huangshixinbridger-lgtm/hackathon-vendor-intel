// Native MediaWiki/Wikidata API smoke test.
// This script does not depend on Codex Wikipedia MCP or any external skill runtime.
const contactEmail = "gardner@bytedance.com";
const appVersion = "gamemove/1.0";
const userAgent = `${appVersion} (${contactEmail})`;
const title = process.argv.slice(2).join(" ") || "Grand Theft Auto VI";
const languages = ["en", "zh", "ja", "ko", "es"];

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function readWikipediaPage(language, pageTitle) {
  const params = new URLSearchParams({
    action: "query",
    titles: pageTitle,
    prop: "pageprops|description|info",
    inprop: "url",
    redirects: "1",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://${language}.wikipedia.org/w/api.php?${params}`);
  const page = Object.values(json.query?.pages ?? {})[0];

  if (!page || page.missing !== undefined) {
    throw new Error(`Wikipedia page not found: ${language}:${pageTitle}`);
  }

  return page;
}

async function searchWikipediaPage(language, query) {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `${query} video game`,
    srlimit: "5",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://${language}.wikipedia.org/w/api.php?${params}`);
  const normalizedQuery = query.toLowerCase();
  const result =
    json.query?.search?.find((item) => item.title.toLowerCase() === normalizedQuery) ?? json.query?.search?.[0];

  return result?.title;
}

async function findWikipediaPage(pageTitle) {
  for (const language of languages) {
    try {
      return { language, page: await readWikipediaPage(language, pageTitle) };
    } catch {
      // Try the next language.
    }
  }

  for (const language of languages) {
    const searchedTitle = await searchWikipediaPage(language, pageTitle);
    if (!searchedTitle) {
      continue;
    }

    try {
      return { language, page: await readWikipediaPage(language, searchedTitle) };
    } catch {
      // Keep searching.
    }
  }

  throw new Error(`Wikipedia page not found: ${pageTitle}`);
}

async function readWikidataEntity(entityId) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: entityId,
    props: "claims|labels|descriptions|sitelinks",
    languages: "en|zh|ja|ko|es|mul",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://www.wikidata.org/w/api.php?${params}`);
  return json.entities?.[entityId];
}

async function labelsForEntityIds(ids) {
  if (ids.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: Array.from(new Set(ids)).join("|"),
    props: "labels",
    languages: "en|zh|ja|ko|es|mul",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://www.wikidata.org/w/api.php?${params}`);

  return ids
    .map((id) => {
      const labels = json.entities?.[id]?.labels;
      return labels?.en?.value ?? labels?.mul?.value ?? labels?.zh?.value ?? labels?.ja?.value ?? labels?.ko?.value ?? labels?.es?.value;
    })
    .filter(Boolean);
}

function claimValues(entity, property) {
  return (entity?.claims?.[property] ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter(Boolean);
}

function entityIds(entity, property) {
  return claimValues(entity, property)
    .map((value) => value?.id)
    .filter(Boolean);
}

const { language, page } = await findWikipediaPage(title);
const wikidataId = page.pageprops?.wikibase_item;
const entity = wikidataId ? await readWikidataEntity(wikidataId) : null;
const releaseDates = claimValues(entity, "P577")
  .map((value) => value.time?.replace(/^\+/, "").slice(0, 10))
  .filter((value) => value && !value.includes("00"))
  .sort();
const publisherIds = entityIds(entity, "P123");
const developerIds = entityIds(entity, "P178");

console.log(
  JSON.stringify(
    {
      ok: true,
      userAgent,
      language,
      title: page.title,
      wikipediaUrl: page.fullurl,
      wikidataId,
      description: page.description ?? entity?.descriptions?.en?.value ?? "",
      publishers: await labelsForEntityIds(publisherIds),
      developers: await labelsForEntityIds(developerIds),
      releaseDates,
    },
    null,
    2
  )
);
