// app/cockpit/insight/page.tsx —— 第二屏「行星扫描 / 内容洞察」原型路由
// 复用内容雷达的真实数据（ContentRadarDetail），换成驾驶舱太空主题渲染。
import type { ContentRadarDetail } from "@/types/contract.contentRadar";
import { mockContentRadar } from "@/lib/mock.contentRadar";
import { freeFireRadar } from "@/lib/data.freefire";
import { robloxRadar } from "@/lib/data.roblox";
import { minecraftRadar } from "@/lib/data.minecraft";
import { mlbbRadar } from "@/lib/data.mlbb";
import { InsightView } from "./insight-view";

const REGISTRY: Record<string, ContentRadarDetail> = {
  freefire: freeFireRadar,
  mlbb: mlbbRadar,
  roblox: robloxRadar,
  minecraft: minecraftRadar,
  ...mockContentRadar,
};

export default function InsightPage({ searchParams }: { searchParams: { gameId?: string } }) {
  const gameId = searchParams.gameId ?? "freefire";
  const data = REGISTRY[gameId] ?? null;
  return <InsightView data={data} gameId={gameId} />;
}
