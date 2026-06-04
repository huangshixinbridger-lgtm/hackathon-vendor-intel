// app/content-radar/page.tsx —— 内容雷达（Jeff，纯增量模块）
// 服务端取数 → 交给客户端 RadarView 渲染（编辑杂志风 + 动效）。
// 数据：hero 游戏 Free Fire 用真实数据；g-1001 用 mock 走端到端动线。
import type { ContentRadarDetail } from "@/types/contract.contentRadar";
import { mockContentRadar } from "@/lib/mock.contentRadar";
import { freeFireRadar } from "@/lib/data.freefire";
import { robloxRadar } from "@/lib/data.roblox";
import { minecraftRadar } from "@/lib/data.minecraft";
import { mlbbRadar } from "@/lib/data.mlbb";
import RadarView from "./radar-view";

// 真实数据的 4 个 hero 游戏（TikTok 全球 Top10 真实榜单）放前面，mock 走端到端动线兜底
const REGISTRY: Record<string, ContentRadarDetail> = {
  freefire: freeFireRadar,
  mlbb: mlbbRadar,
  roblox: robloxRadar,
  minecraft: minecraftRadar,
  ...mockContentRadar,
};

// 切换器展示的游戏（带真实数据的）
const GAMES = [
  { id: "freefire", name: "Free Fire" },
  { id: "mlbb", name: "Mobile Legends" },
  { id: "roblox", name: "Roblox" },
  { id: "minecraft", name: "Minecraft" },
];

export default function ContentRadarPage({
  searchParams,
}: {
  searchParams: { gameId?: string };
}) {
  const gameId = searchParams.gameId ?? "freefire";
  const data = REGISTRY[gameId];

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-2 py-20">
        <h1 className="text-3xl font-bold tracking-tight">内容雷达</h1>
        <p className="mt-3 text-muted-foreground">
          暂无该游戏分析，试试 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">?gameId=freefire</code>
        </p>
      </div>
    );
  }

  return <RadarView data={data} games={GAMES} current={gameId} />;
}
