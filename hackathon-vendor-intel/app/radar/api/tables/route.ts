import { NextResponse } from "next/server";
import {
  getRadarDatabaseSnapshot,
  getRadarTable,
  type RadarTableName,
} from "../../database";

const tableNames = new Set<RadarTableName>(["companies", "games", "updates", "gameMoves"]);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table") as RadarTableName | null;
  const filters = {
    q: searchParams.get("q"),
    gameId: searchParams.get("gameId"),
  };

  if (table) {
    if (!tableNames.has(table)) {
      return NextResponse.json({ error: "Unknown table" }, { status: 400 });
    }

    const rows = getRadarTable(table, filters);
    return NextResponse.json({
      table,
      data: rows,
      total: rows.length,
    });
  }

  return NextResponse.json(getRadarDatabaseSnapshot(filters));
}
