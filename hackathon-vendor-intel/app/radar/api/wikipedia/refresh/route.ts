import { NextResponse } from "next/server";
import { runWikipediaGameBackfill } from "../../../database";
import type { WikipediaBackfillMode } from "../../../wikipedia";

export const runtime = "nodejs";

const modes = new Set<WikipediaBackfillMode>(["full", "incremental"]);

function parseLimit(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseOffset(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const requestedMode = url.searchParams.get("mode") as WikipediaBackfillMode | null;
  const mode = requestedMode && modes.has(requestedMode) ? requestedMode : "incremental";
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));
  const result = await runWikipediaGameBackfill(mode, limit, offset);

  return NextResponse.json(result);
}
