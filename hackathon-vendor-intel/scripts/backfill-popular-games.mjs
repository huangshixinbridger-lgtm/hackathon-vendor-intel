import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const contactEmail = "gardner@bytedance.com";
const appVersion = "gamemove/1.0";
const userAgent = `${appVersion} (${contactEmail})`;
const dataPath = path.join(process.cwd(), "app/radar/radar-data.json");

const popularGames = [
  "Elden Ring",
  "Baldur's Gate 3",
  "Palworld",
  "Hogwarts Legacy",
  "Helldivers 2",
  "Black Myth: Wukong",
  "Starfield (video game)",
  "The Legend of Zelda: Tears of the Kingdom",
  "Final Fantasy XVI",
  "Diablo IV",
  "Street Fighter 6",
  "Resident Evil 4 (2023 video game)",
  "Marvel Rivals",
  "Zenless Zone Zero",
  "Wuthering Waves",
  "Honkai: Star Rail",
  "Pokemon TCG Pocket",
  "Monopoly Go!",
  "Lethal Company",
  "Manor Lords",
  "Enshrouded",
  "Stellar Blade",
  "Dragon's Dogma 2",
  "Warhammer 40,000: Space Marine 2",
  "Indiana Jones and the Great Circle",
  "Astro Bot",
  "Balatro",
  "Split Fiction",
  "Clair Obscur: Expedition 33",
  "Kingdom Come: Deliverance II",
  "Monster Hunter Wilds",
  "Assassin's Creed Shadows",
];

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

function normalize(value) {
  return value.toLowerCase().replace(/[':!.,()]/g, "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
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

function releaseDates(entity) {
  return claimValues(entity, "P577")
    .map((value) => value?.time?.replace(/^\+/, "").slice(0, 10))
    .filter((value) => value && !value.includes("00"))
    .sort();
}

function pickRecentReleaseDate(dates) {
  return dates.find((date) => date >= "2021-01-01") ?? dates[0] ?? "";
}

async function readWikipediaPage(title) {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "pageprops|description|info",
    inprop: "url",
    redirects: "1",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://en.wikipedia.org/w/api.php?${params}`);
  const page = Object.values(json.query?.pages ?? {})[0];

  if (!page || page.missing !== undefined) {
    throw new Error(`Wikipedia page not found: ${title}`);
  }

  return page;
}

async function readWikidataEntities(ids, props = "claims|labels|descriptions|sitelinks") {
  const uniqueIds = unique(ids);
  if (uniqueIds.length === 0) {
    return {};
  }

  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: uniqueIds.join("|"),
    props,
    languages: "en|zh|ja|ko|es|mul",
    format: "json",
    origin: "*",
  });
  const json = await fetchJson(`https://www.wikidata.org/w/api.php?${params}`);
  return json.entities ?? {};
}

function entityLabel(entity) {
  const labels = entity?.labels;
  return labels?.en?.value ?? labels?.mul?.value ?? labels?.zh?.value ?? labels?.ja?.value ?? labels?.ko?.value ?? labels?.es?.value ?? "";
}

function entityDescription(entity) {
  const descriptions = entity?.descriptions;
  return descriptions?.en?.value ?? descriptions?.mul?.value ?? descriptions?.zh?.value ?? descriptions?.ja?.value ?? descriptions?.ko?.value ?? descriptions?.es?.value ?? "";
}

function entityWikipediaUrl(entity) {
  const title = entity?.sitelinks?.enwiki?.title;
  return title ? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}` : "";
}

function headquartersCountry(entity, countryEntities) {
  const countryId = entityIds(entity, "P17")[0] ?? entityIds(entity, "P495")[0];
  return countryId ? entityLabel(countryEntities[countryId]) : "";
}

function nextId(rows) {
  return String(Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1);
}

function findCompany(companies, name) {
  const normalizedName = normalize(name);
  return companies.find((company) => [company.name, ...(company.aliases ?? [])].some((item) => normalize(item) === normalizedName));
}

function findGame(games, title) {
  const normalizedTitle = normalize(title);
  return games.find((game) =>
    [game.name, game.wikipediaTitle, ...(game.aliases ?? [])].some((item) => item && normalize(item) === normalizedTitle)
  );
}

async function readGameInfo(title) {
  const page = await readWikipediaPage(title);
  const wikidataId = page.pageprops?.wikibase_item;
  const entity = wikidataId ? (await readWikidataEntities([wikidataId]))[wikidataId] : null;
  const publisherIds = entityIds(entity, "P123");
  const developerIds = entityIds(entity, "P178");
  const platformIds = entityIds(entity, "P400");
  const genreIds = entityIds(entity, "P136");
  const relatedEntities = await readWikidataEntities([...publisherIds, ...developerIds, ...platformIds, ...genreIds]);
  const companyIds = unique([...publisherIds, ...developerIds]);
  const companyCountryIds = companyIds.flatMap((id) => [entityIds(relatedEntities[id], "P17")[0], entityIds(relatedEntities[id], "P495")[0]]).filter(Boolean);
  const countryEntities = await readWikidataEntities(companyCountryIds, "labels");

  return {
    title: page.title,
    aliases: unique([title]),
    wikipediaUrl: page.fullurl,
    wikipediaTitle: page.title,
    wikipediaDescription: page.description ?? entityDescription(entity),
    publisherIds,
    developerIds,
    publishers: publisherIds.map((id) => entityLabel(relatedEntities[id])).filter(Boolean),
    developers: developerIds.map((id) => entityLabel(relatedEntities[id])).filter(Boolean),
    releaseDate: pickRecentReleaseDate(releaseDates(entity)),
    platforms: platformIds.map((id) => entityLabel(relatedEntities[id])).filter(Boolean),
    genres: genreIds.map((id) => entityLabel(relatedEntities[id])).filter(Boolean),
    companies: companyIds
      .map((id) => ({
        id,
        name: entityLabel(relatedEntities[id]),
        description: entityDescription(relatedEntities[id]),
        wikipediaUrl: entityWikipediaUrl(relatedEntities[id]),
        wikipediaTitle: relatedEntities[id]?.sitelinks?.enwiki?.title ?? entityLabel(relatedEntities[id]),
        wikipediaDescription: entityDescription(relatedEntities[id]),
        headquartersCountry: headquartersCountry(relatedEntities[id], countryEntities),
      }))
      .filter((company) => company.name),
  };
}

const data = JSON.parse(readFileSync(dataPath, "utf8"));
const now = new Date().toISOString();
const report = [];

for (const title of popularGames) {
  try {
    const info = await readGameInfo(title);
    const primaryCompanyName = info.publishers[0] ?? info.developers[0] ?? "";
    let primaryCompany = primaryCompanyName ? findCompany(data.companies, primaryCompanyName) : null;

    for (const companyInfo of info.companies) {
      let company = findCompany(data.companies, companyInfo.name);
      if (!company) {
        company = {
          id: nextId(data.companies),
          name: companyInfo.name,
          aliases: [],
          region: companyInfo.headquartersCountry || "未知",
          headquartersCountry: companyInfo.headquartersCountry || "",
          description: companyInfo.description,
          website: "",
          feishuRecordId: "",
          wikipediaUrl: companyInfo.wikipediaUrl,
          wikipediaTitle: companyInfo.wikipediaTitle,
          wikipediaDescription: companyInfo.wikipediaDescription,
          createdAt: now,
          updatedAt: now,
        };
        data.companies.push(company);
      } else {
        company.description ||= companyInfo.description;
        company.wikipediaUrl ||= companyInfo.wikipediaUrl;
        company.wikipediaTitle ||= companyInfo.wikipediaTitle;
        company.wikipediaDescription ||= companyInfo.wikipediaDescription;
        company.headquartersCountry ||= companyInfo.headquartersCountry;
        company.region ||= companyInfo.headquartersCountry || "未知";
        company.updatedAt = now;
      }

      if (companyInfo.name === primaryCompanyName) {
        primaryCompany = company;
      }
    }

    const game = findGame(data.games, info.title);
    const stage = info.releaseDate && Date.parse(info.releaseDate) <= Date.now() ? "正式上线" : "待上线";
    const patch = {
      name: info.title,
      aliases: info.aliases.filter((alias) => normalize(alias) !== normalize(info.title)),
      companyId: primaryCompany?.id ?? "",
      releaseRegions: ["全球"],
      stage,
      expectedLaunchDate: stage === "待上线" ? info.releaseDate : "",
      genres: info.genres,
      otherInfo: "近 5 年热门游戏；由 Wikipedia/Wikidata 批量补齐",
      ttOperationStatus: "未知",
      ttNotes: "",
      latestProgress: info.releaseDate ? `Wikipedia release date: ${info.releaseDate}` : "Wikipedia/Wikidata 已补齐基础资料",
      officialSite: "",
      publisher: info.publishers.join(" / "),
      developer: info.developers.join(" / "),
      releaseDate: info.releaseDate,
      platforms: info.platforms,
      relevanceScore: 90,
      relevanceReasons: ["近 5 年热门游戏", "Wikipedia/Wikidata 收录"],
      discoverySource: "Wikipedia/Wikidata popular games backfill",
      isBackfilled: true,
      feishuRecordId: "",
      wikipediaUrl: info.wikipediaUrl,
      wikipediaTitle: info.wikipediaTitle,
      wikipediaDescription: info.wikipediaDescription,
      wikipediaLastCheckedAt: now,
      updatedAt: now,
    };

    if (game) {
      Object.assign(game, {
        ...patch,
        aliases: unique([...(game.aliases ?? []), ...patch.aliases]),
        genres: game.genres?.length ? game.genres : patch.genres,
        platforms: game.platforms?.length ? game.platforms : patch.platforms,
        createdAt: game.createdAt,
      });
      report.push({ title: info.title, action: "updated" });
    } else {
      data.games.push({
        id: nextId(data.games),
        ...patch,
        createdAt: now,
      });
      report.push({ title: info.title, action: "inserted" });
    }
  } catch (error) {
    report.push({ title, action: "failed", reason: error instanceof Error ? error.message : String(error) });
  }
}

data.importedAt = now;
writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
