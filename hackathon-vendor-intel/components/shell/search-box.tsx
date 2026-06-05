"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveGame, moduleGameId, firstAvailableModule, hrefForModule } from "@/lib/games";

// 搜索入口：Demo 动线的起点。输入游戏名 → 先经游戏注册表(lib/games.ts)解析：
//  · 解析到的游戏在情报雷达有数据 → 进 /radar?gameId=（PRD 动线的入口），再用顶部「游戏上下文条」串到诊断/GIP；
//  · 解析到但雷达没有 → 进该游戏第一个有数据的模块；
//  · 解析不到（如普通厂商名/关键词）→ 沿用原行为，进情报雷达 ?q= 做关键词检索。
export function SearchBox({ placeholder = "搜索一个游戏，例如：Free Fire / 燕云十六声" }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function go() {
    const query = q.trim();
    if (!query) {
      router.push("/radar");
      return;
    }
    const game = resolveGame(query);
    if (game) {
      const radarId = moduleGameId(game, "radar");
      if (radarId) {
        router.push(`/radar?gameId=${encodeURIComponent(radarId)}`);
        return;
      }
      const first = firstAvailableModule(game);
      const href = first ? hrefForModule(game, first) : undefined;
      if (href) {
        router.push(href);
        return;
      }
    }
    router.push(`/radar?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex w-full max-w-2xl items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      <Button onClick={go}>搜索</Button>
    </div>
  );
}
