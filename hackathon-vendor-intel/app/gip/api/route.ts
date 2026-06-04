import { NextResponse } from "next/server";
import { mockGIPRecords } from "../data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    source: "mock",
    records: mockGIPRecords,
    generatedAt: new Date().toISOString(),
  });
}
