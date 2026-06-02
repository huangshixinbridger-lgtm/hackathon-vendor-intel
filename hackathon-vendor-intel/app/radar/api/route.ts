import { NextResponse } from "next/server";
import { listGameMoves } from "../database";
import type { GameMove } from "@/types/contract";

const validMoveTypes = new Set<GameMove["moveType"]>(["新游", "版本更新", "大版本", "活动"]);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as GameMove["moveType"] | null;

  const data = listGameMoves({
    gameId: searchParams.get("gameId"),
    q: searchParams.get("q"),
    type: type && validMoveTypes.has(type) ? type : null,
  });

  return NextResponse.json({
    data,
    total: data.length,
    contract: "GameMove",
  });
}
