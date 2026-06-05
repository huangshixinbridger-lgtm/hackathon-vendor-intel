"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveGame } from "@/lib/games";

// 搜索入口（动线第一步「找游戏 · 情报雷达」内）：输入游戏名 → 经注册表解析后，
//  · 命中 → 留在情报雷达并「选定」该游戏（/radar?gameId=规范id），由右侧「下一步」箭头继续走动线；
//  · 未命中 → /radar?q= 做关键词发现。
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
      router.push(`/radar?gameId=${encodeURIComponent(game.id)}`);
      return;
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
