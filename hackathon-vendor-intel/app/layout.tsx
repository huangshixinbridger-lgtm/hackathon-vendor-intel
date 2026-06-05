import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/shell/app-chrome";

// ⚠️ 共享文件：只有黄士鑫 / Jeff 改。其他模块不要动 layout.tsx。
// 导航/容器由 AppChrome 按路由条件渲染：驾驶舱(/、/cockpit)全屏无导航，其余朴素版带导航。
export const metadata: Metadata = {
  title: "厂商情报与运营台 | TikTok GIP",
  description: "给厂商运营用的情报与运营台：发现动作 → 平台诊断 → GIP 预算消耗。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
