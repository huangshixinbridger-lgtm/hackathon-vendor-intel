"use client";

// 游戏上下文条（集成层，黄士鑫/Jeff）：当 URL 带 ?gameId=（或可解析的 ?q=）时出现，
// 把"当前游戏"钉在导航下方，并提供四个模块的快捷跳转——每个都带同一个 gameId，
// 这样"搜一个游戏 → 情报雷达 → 内容雷达 → 诊断 → GIP"能始终围绕同一个游戏串起来。
// 某模块若没有该游戏数据，链接会变灰并标注「·无数据」（点进去对应模块会给出明确提示）。

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  resolveGame,
  moduleGameId,
  gameHasModule,
  MODULE_PATH,
  MODULE_LABEL,
  type ModuleKey,
} from "@/lib/games";
import { cn } from "@/lib/utils";

const ORDER: ModuleKey[] = ["radar", "contentRadar", "diagnosis", "gip"];

export function GameContextBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const rawId = searchParams.get("gameId") || searchParams.get("q");
  const game = resolveGame(rawId);

  if (!game) {
    return null;
  }

  return (
    <div className="border-b bg-accent/40">
      <div className="container flex h-11 items-center gap-2 overflow-x-auto text-sm">
        <span className="shrink-0 text-muted-foreground">当前游戏</span>
        <span className="shrink-0 font-semibold">{game.name}</span>
        <span className="mx-1 shrink-0 text-muted-foreground">·</span>
        <nav className="flex items-center gap-1">
          {ORDER.map((module) => {
            const localId = moduleGameId(game, module) ?? game.id;
            const has = gameHasModule(game, module);
            const active = pathname.startsWith(MODULE_PATH[module]);
            return (
              <Link
                key={module}
                href={`${MODULE_PATH[module]}?gameId=${encodeURIComponent(localId)}`}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  !has && "opacity-50"
                )}
                title={has ? undefined : `${MODULE_LABEL[module]}暂无该游戏数据`}
              >
                {MODULE_LABEL[module]}
                {!has && <span className="ml-1 text-xs">·无数据</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
