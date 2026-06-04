const contactEmail = "gardner@bytedance.com";
const appVersion = "gamemove/1.0";
const userAgent = `${appVersion} (${contactEmail})`;
const title = process.argv.slice(2).join(" ") || "Grand Theft Auto VI";

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

function claimValues(entity, property) {
  return (entity?.claims?.[property] ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter(Boolean);
}

async function readWikipediaPage(pageTitle) {
  const params = new URLSearchParams({
    action: "query",
    titles: pageTitle,
    prop: "pageprops|description|info",
    inprop: "url",
    redirects: "1",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://en.wikipedia.org/w/api.php?${params}`);
  const page = Object.values(json.query?.pages ?? {})[0];

  if (!page || page.missing !== undefined) {
    throw new Error(`Wikipedia page not found: ${pageTitle}`);
  }

  return page;
}

async function readWikidataEntity(entityId) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: entityId,
    props: "claims|labels|descriptions|sitelinks",
    languages: "en|mul",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://www.wikidata.org/w/api.php?${params}`);
  return json.entities?.[entityId];
}

const page = await readWikipediaPage(title);
const wikidataId = page.pageprops?.wikibase_item;
const entity = wikidataId ? await readWikidataEntity(wikidataId) : null;
const releaseDates = claimValues(entity, "P577").map((value) => value.time?.replace(/^\+/, "").slice(0, 10)).filter(Boolean);
const developerIds = claimValues(entity, "P178").map((value) => value.id).filter(Boolean);
const publisherIds = claimValues(entity, "P123").map((value) => value.id).filter(Boolean);

console.log(
  JSON.stringify(
    {
      ok: true,
      userAgent,
      title: page.title,
      wikipediaUrl: page.fullurl,
      wikidataId,
      description: page.description ?? entity?.descriptions?.en?.value ?? "",
      claimCounts: {
        publisher: publisherIds.length,
        developer: developerIds.length,
        release: releaseDates.length,
      },
      publisherIds,
      developerIds,
      releaseDates,
    },
    null,
    2
  )
);
