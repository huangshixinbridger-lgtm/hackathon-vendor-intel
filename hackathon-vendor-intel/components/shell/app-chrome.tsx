"use client";

// 条件式骨架：驾驶舱(沉浸式星图)路由全屏无导航；其余「朴素(导航栏)版」页面照常带导航。
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "./nav";
import { GameContextBar } from "./game-context-bar";

// 这些路由是全屏沉浸式驾驶舱，不要导航栏 / 容器内边距。
const FULLSCREEN_ROUTES = new Set(["/", "/cockpit"]);

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FULLSCREEN_ROUTES.has(pathname)) {
    return <>{children}</>;
  }
  return (
    <>
      <Nav />
      <Suspense fallback={null}>
        <GameContextBar />
      </Suspense>
      <main className="container py-8">{children}</main>
    </>
  );
}
