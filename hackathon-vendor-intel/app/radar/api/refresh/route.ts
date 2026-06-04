import { NextResponse } from "next/server";
import { runRadarRefresh } from "../../database";

export const runtime = "nodejs";

export async function POST() {
  const result = await runRadarRefresh();

  return NextResponse.json(result);
}
