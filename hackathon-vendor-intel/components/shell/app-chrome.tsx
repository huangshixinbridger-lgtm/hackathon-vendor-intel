"use client";

// 条件式骨架：
//  · 驾驶舱(沉浸式星图，/ 与 /cockpit)：全屏无任何外壳。
//  · 其余「经典视图」：用 FlowChrome 线性动线外壳（顶部四步进度 + 常驻当前游戏 + 两侧翻页箭头），
//    取代了原来的顶部导航栏与动线导航条。
import { usePathname } from "next/navigation";
import { FlowChrome } from "./flow-chrome";

const FULLSCREEN_ROUTES = new Set(["/", "/cockpit"]);

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FULLSCREEN_ROUTES.has(pathname)) {
    return <>{children}</>;
  }
  return <FlowChrome>{children}</FlowChrome>;
}
