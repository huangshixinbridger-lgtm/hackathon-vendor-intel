import { NextResponse } from "next/server";
import { listGameMoves, type DateWindow } from "../database";
import type { GameMove } from "@/types/contract";

const validMoveTypes = new Set<GameMove["moveType"]>(["新游", "版本更新", "大版本", "活动"]);
const validDateWindows = new Set<DateWindow>(["24h", "7d", "30d", "all"]);

function parseMinImportance(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as GameMove["moveType"] | null;
  const dateWindow = searchParams.get("window") as DateWindow | null;

  const data = listGameMoves({
    gameId: searchParams.get("gameId"),
    q: searchParams.get("q"),
    type: type && validMoveTypes.has(type) ? type : null,
    dateWindow: dateWindow && validDateWindows.has(dateWindow) ? dateWindow : null,
    minImportance: parseMinImportance(searchParams.get("importance")),
  });

  return NextResponse.json({
    data,
    total: data.length,
    contract: "GameMove",
  });
}
