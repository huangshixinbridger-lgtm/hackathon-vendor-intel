"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 搜索入口：Demo 动线的起点。输入游戏名 → 进情报雷达（带 q 参数）。
// 各模块页面通过读取 ?q= / ?gameId= 来联动，契约见 types/contract.ts。
export function SearchBox({ placeholder = "搜索一个游戏，例如：星海远征 / 幻塔纪元" }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function go() {
    const query = q.trim();
    router.push(query ? `/radar?q=${encodeURIComponent(query)}` : "/radar");
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
