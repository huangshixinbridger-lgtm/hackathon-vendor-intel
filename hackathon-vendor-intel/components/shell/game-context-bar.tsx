"use client";

// 动线导航（经典视图共享骨架）：把四个模块串成一条用户链路
//   ① 找讯息 · 情报雷达 → ② 理解内容 · 内容洞察 → ③ 经营诊断 · 诊断报告 + GIP
// 选中游戏时把「当前游戏」钉在最前，并用同一个 gameId 串到 ②③ 阶段（情报雷达=纯发现入口，不带 gameId）。
// 未选游戏时也渲染三段作为引导，②③ 提示「搜索游戏后解锁」。
// 首页 /classic 有自己的动线叙事，这里不重复；cockpit 路由本就不挂此组件。

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveGame, moduleGameId, gameHasModule } from "@/lib/games";
import { cn } from "@/lib/utils";

function moduleHref(game: ReturnType<typeof resolveGame>, module: "contentRadar" | "diagnosis" | "gip", path: string) {
  if (!game) return undefined;
  const id = moduleGameId(game, module) ?? game.id;
  return `${path}?gameId=${encodeURIComponent(id)}`;
}

function StageShell({ n, active, children }: { n: string; active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1",
        active ? "bg-primary text-primary-foreground" : "text-foreground"
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
          active ? "bg-primary-foreground/20" : "bg-muted text-foreground"
        )}
      >
        {n}
      </span>
      <span className="leading-tight">{children}</span>
    </span>
  );
}

function Arrow() {
  return <span className="shrink-0 text-muted-foreground">→</span>;
}

export function GameContextBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pathname === "/classic") return null;

  const game = resolveGame(searchParams.get("gameId") || searchParams.get("q"));
  const stage =
    pathname.startsWith("/content-radar") ? 2 :
    pathname.startsWith("/diagnosis") || pathname.startsWith("/gip") ? 3 :
    pathname.startsWith("/radar") ? 1 : 0;

  const contentHref = moduleHref(game, "contentRadar", "/content-radar");
  const diagHref = moduleHref(game, "diagnosis", "/diagnosis");
  const gipHref = moduleHref(game, "gip", "/gip");
  const hasContent = gameHasModule(game, "contentRadar");
  const hasDiag = gameHasModule(game, "diagnosis");
  const hasGip = gameHasModule(game, "gip");

  return (
    <div className="border-b bg-accent/40">
      <div className="container flex h-12 items-center gap-2.5 overflow-x-auto whitespace-nowrap text-sm">
        {game ? (
          <span className="shrink-0">
            <span className="text-muted-foreground">当前游戏 </span>
            <span className="font-semibold">{game.name}</span>
          </span>
        ) : (
          <span className="shrink-0 font-medium text-muted-foreground">动线导航</span>
        )}
        <span className="shrink-0 text-muted-foreground">·</span>

        {/* ① 找讯息 · 情报雷达（纯发现入口，不带 gameId） */}
        <Link href="/radar" className="shrink-0">
          <StageShell n="1" active={stage === 1}>
            <span className="block text-[13px] font-medium">找讯息</span>
            <span className="block text-[10px] opacity-70">情报雷达</span>
          </StageShell>
        </Link>

        <Arrow />

        {/* ② 理解内容 · 内容洞察 */}
        {hasContent && contentHref ? (
          <Link href={contentHref} className="shrink-0">
            <StageShell n="2" active={stage === 2}>
              <span className="block text-[13px] font-medium">理解内容</span>
              <span className="block text-[10px] opacity-70">内容洞察</span>
            </StageShell>
          </Link>
        ) : (
          <span className="shrink-0 opacity-50" title={game ? "内容洞察暂无该游戏数据" : "搜索游戏后解锁"}>
            <StageShell n="2" active={stage === 2}>
              <span className="block text-[13px] font-medium">理解内容</span>
              <span className="block text-[10px] opacity-70">内容洞察{game ? " · 无数据" : " · 搜索游戏后解锁"}</span>
            </StageShell>
          </span>
        )}

        <Arrow />

        {/* ③ 经营诊断 · 诊断报告 + GIP */}
        <StageShell n="3" active={stage === 3}>
          <span className="block text-[13px] font-medium">经营诊断</span>
          <span className="block text-[10px]">
            {hasDiag && diagHref ? (
              <Link href={diagHref} className={cn("hover:underline", pathname.startsWith("/diagnosis") ? "font-semibold underline" : "opacity-80")}>诊断报告</Link>
            ) : (
              <span className="opacity-60">诊断报告{game ? "·无数据" : ""}</span>
            )}
            <span className="mx-1 opacity-50">·</span>
            {hasGip && gipHref ? (
              <Link href={gipHref} className={cn("hover:underline", pathname.startsWith("/gip") ? "font-semibold underline" : "opacity-80")}>GIP</Link>
            ) : (
              <span className="opacity-60">GIP{game ? "·无数据" : ""}</span>
            )}
            {!game && <span className="opacity-60"> · 搜索游戏后解锁</span>}
          </span>
        </StageShell>
      </div>
    </div>
  );
}
