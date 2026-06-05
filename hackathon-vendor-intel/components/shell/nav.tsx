"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, Stethoscope, BarChart3, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/classic", label: "总览", icon: LayoutGrid },
  { href: "/radar", label: "情报雷达", icon: Radar },
  { href: "/content-radar", label: "内容洞察", icon: Sparkles },
  { href: "/diagnosis", label: "诊断报告", icon: Stethoscope },
  { href: "/gip", label: "GIP 面板", icon: BarChart3 },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur">
      <div className="container flex h-14 items-center gap-6">
        <Link href="/classic" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-xs">GIP</span>
          <span className="hidden sm:inline">厂商情报与运营台</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto text-xs text-muted-foreground hidden lg:block">TikTok GIP · Hackathon Demo</div>
      </div>
    </header>
  );
}
