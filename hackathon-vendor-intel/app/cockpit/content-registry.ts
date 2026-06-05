// app/cockpit/content-registry.ts —— 内容雷达数据的统一注册表（client + server 共用）。
// 复用内容雷达模块真实数据；座舱内容洞察页 & AI 洞察 API 都从这里取，避免两处不一致。
import type { ContentRadarDetail } from "@/types/contract.contentRadar";
import { mockContentRadar } from "@/lib/mock.contentRadar";
import { freeFireRadar } from "@/lib/data.freefire";
import { robloxRadar } from "@/lib/data.roblox";
import { minecraftRadar } from "@/lib/data.minecraft";
import { mlbbRadar } from "@/lib/data.mlbb";

export const CONTENT: Record<string, ContentRadarDetail> = {
  freefire: freeFireRadar,
  mlbb: mlbbRadar,
  roblox: robloxRadar,
  minecraft: minecraftRadar,
  ...mockContentRadar,
};

export function resolveContent(gameId?: string): ContentRadarDetail | null {
  if (!gameId) return null;
  return CONTENT[gameId] ?? null;
}
