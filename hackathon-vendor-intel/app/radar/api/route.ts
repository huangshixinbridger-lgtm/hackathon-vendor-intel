import { NextResponse } from "next/server";
import { mockGameMoves } from "@/lib/mock";
import type { GameMove } from "@/types/contract";

const validMoveTypes = new Set<GameMove["moveType"]>(["新游", "版本更新", "大版本", "活动"]);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const query = searchParams.get("q")?.trim().toLowerCase();
  const moveType = searchParams.get("type") as GameMove["moveType"] | null;

  const data = mockGameMoves.filter((move) => {
    const matchedGame = !gameId || move.gameId === gameId;
    const matchedType = !moveType || (validMoveTypes.has(moveType) && move.moveType === moveType);
    const matchedQuery =
      !query ||
      [move.name, move.category, move.summary, move.source].some((field) =>
        field.toLowerCase().includes(query)
      );

    return matchedGame && matchedType && matchedQuery;
  });

  return NextResponse.json({
    data,
    total: data.length,
  });
}
