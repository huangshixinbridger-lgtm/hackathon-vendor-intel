"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RadarRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refresh() {
    setIsRefreshing(true);
    try {
      await fetch("/radar/api/refresh", {
        method: "POST",
        cache: "no-store",
      });
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={refresh} disabled={isRefreshing}>
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      手动抓取全网新动态
    </Button>
  );
}
