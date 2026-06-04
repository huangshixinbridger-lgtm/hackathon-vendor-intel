const baseUrl = process.env.RADAR_BASE_URL || "http://localhost:3000";
const mode = process.argv.includes("--full") ? "full" : "incremental";
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = Number(limitArg?.split("=")[1] ?? 25);

let offset = 0;

while (true) {
  const url = new URL("/radar/api/wikipedia/refresh", baseUrl);
  url.searchParams.set("mode", mode);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log(JSON.stringify(result));

  if (result.done || result.nextOffset === null) {
    break;
  }

  offset = result.nextOffset;
}
