"use client";

// 经典视图的「动线外壳」：把四个模块串成一条线性流程（取代顶部导航栏 + 动线导航条）。
//   ① 找游戏 · 情报雷达 → ② 理解内容 · 内容洞察 → ③ 经营诊断 · 诊断报告 → ④ 历史付费分析
// 顶部：返回驾驶舱 + 四步进度(可点跳转) + 常驻「当前游戏」；两侧：大「上一步 / 下一步」翻页箭头。
// 在情报雷达选定游戏后，同一个 gameId 串到后续每一步；未选游戏时「下一步」锁定提示先选游戏。

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { resolveGame, moduleGameId, type ModuleKey } from "@/lib/games";
import { cn } from "@/lib/utils";

type Step = { path: string; n: number; label: string; sub: string; module?: ModuleKey };
const STEPS: Step[] = [
  { path: "/radar", n: 1, label: "找游戏", sub: "情报雷达" },
  { path: "/content-radar", n: 2, label: "理解内容", sub: "内容洞察", module: "contentRadar" },
  { path: "/diagnosis", n: 3, label: "经营诊断", sub: "诊断报告", module: "diagnosis" },
  { path: "/gip", n: 4, label: "历史付费分析", sub: "投放复盘", module: "gip" },
];

type Game = ReturnType<typeof resolveGame>;

function hrefFor(step: Step, game: Game): string | undefined {
  if (!step.module) return game ? `/radar?gameId=${encodeURIComponent(game.id)}` : "/radar";
  if (!game) return undefined;
  const id = moduleGameId(game, step.module) ?? game.id;
  return `${step.path}?gameId=${encodeURIComponent(id)}`;
}

function FlowBars() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const game = resolveGame(sp.get("gameId") || sp.get("q"));
  const idx = Math.max(0, STEPS.findIndex((s) => pathname.startsWith(s.path)));
  const prev = idx > 0 ? STEPS[idx - 1] : undefined;
  const next = idx < STEPS.length - 1 ? STEPS[idx + 1] : undefined;
  const prevHref = prev ? hrefFor(prev, game) : undefined;
  const nextHref = next ? hrefFor(next, game) : undefined;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold" title="返回驾驶舱">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs text-primary-foreground">GIP</span>
            <span className="hidden text-muted-foreground sm:inline">驾驶舱</span>
          </Link>

          {/* 四步进度（可点击跳转，未选游戏时 ②③④ 置灰） */}
          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
            {STEPS.map((s, i) => {
              const href = hrefFor(s, game);
              const enabled = !s.module || Boolean(game);
              const active = i === idx;
              const inner = (
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
                    active ? "bg-primary text-primary-foreground" : enabled ? "text-foreground hover:bg-accent" : "text-muted-foreground opacity-50"
                  )}
                >
                  <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold", active ? "bg-primary-foreground/25" : "bg-muted")}>{s.n}</span>
                  <span className="hidden font-medium md:inline">{s.label}</span>
                  <span className="hidden text-[10px] opacity-70 lg:inline">{s.sub}</span>
                </span>
              );
              return (
                <span key={s.path} className="flex shrink-0 items-center">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />}
                  {enabled && href ? <Link href={href}>{inner}</Link> : <span title="先在情报雷达选择一个游戏">{inner}</span>}
                </span>
              );
            })}
          </nav>

          {/* 常驻：当前游戏 */}
          <div className="shrink-0">
            {game ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
                <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                <span className="hidden text-muted-foreground sm:inline">当前游戏</span>
                <span className="font-semibold">{game.name}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <Gamepad2 className="h-3.5 w-3.5" />未选游戏
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 侧翼大翻页箭头（lg） */}
      {prev && prevHref && (
        <Link href={prevHref} className="group fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1 lg:flex" title={`上一步 · ${prev.label}`}>
          <span className="grid h-12 w-12 place-items-center rounded-full border bg-card/90 shadow-md backdrop-blur transition-colors group-hover:bg-accent">
            <ChevronLeft className="h-6 w-6" />
          </span>
          <span className="text-[10px] text-muted-foreground">{prev.label}</span>
        </Link>
      )}
      {next &&
        (nextHref ? (
          <Link href={nextHref} className="group fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1 lg:flex" title={`下一步 · ${next.label}`}>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
              <ChevronRight className="h-7 w-7" />
            </span>
            <span className="text-[11px] font-medium">下一步</span>
            <span className="text-[10px] text-muted-foreground">{next.label}</span>
          </Link>
        ) : (
          <div className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1 opacity-50 lg:flex" title="先在情报雷达选择一个游戏">
            <span className="grid h-14 w-14 place-items-center rounded-full border bg-card/80">
              <ChevronRight className="h-7 w-7 text-muted-foreground" />
            </span>
            <span className="text-[10px] text-muted-foreground">先选游戏</span>
          </div>
        ))}

      {/* 移动端：底部翻页条 */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 border-t bg-card/95 px-4 py-2 backdrop-blur lg:hidden">
        {prev && prevHref ? (
          <Link href={prevHref} className="inline-flex items-center gap-1 text-sm">
            <ChevronLeft className="h-4 w-4" />
            {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          nextHref ? (
            <Link href={nextHref} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              {next.label}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">先选游戏</span>
          )
        ) : (
          <span />
        )}
      </div>
    </>
  );
}

export function FlowChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-14 border-b" />}>
        <FlowBars />
      </Suspense>
      <main className="container py-8 pb-24 lg:px-24 lg:pb-8">{children}</main>
    </>
  );
}
