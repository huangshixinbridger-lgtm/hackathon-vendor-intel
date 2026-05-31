import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/shell/nav";

// ⚠️ 共享文件：只有黄士鑫 / Jeff 改。其他模块不要动 layout.tsx。
export const metadata: Metadata = {
  title: "厂商情报与运营台 | TikTok GIP",
  description: "给厂商运营用的情报与运营台：发现动作 → 平台诊断 → GIP 预算消耗。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Nav />
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
