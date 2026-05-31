import Link from "next/link";
import { Radar, Stethoscope, BarChart3, ArrowRight } from "lucide-react";
import { SearchBox } from "@/components/shell/search-box";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MODULES = [
  { href: "/radar", icon: Radar, title: "① 情报雷达", desc: "最近谁有动作：新游、版本更新、大动作。先解决「我该关注谁」。", owner: "Gardner" },
  { href: "/diagnosis", icon: Stethoscope, title: "② 诊断报告", desc: "选中一个游戏，一键出它在平台的生态、竞品对比、推荐营销动作。", owner: "Rena" },
  { href: "/gip", icon: BarChart3, title: "③ GIP 面板", desc: "分时段/游戏/品类/厂商看预算与消耗，可下钻到活动明细。", owner: "白思宇" },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="flex flex-col items-center gap-5 pt-8 text-center">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          TikTok GIP · 厂商运营的情报与运营台
        </span>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          输入一个游戏，看清它的动作、平台表现和预算消耗
        </h1>
        <p className="max-w-xl text-muted-foreground">
          从「发现」到「诊断」的一条链路：发现有动作的游戏 → 出平台诊断报告 → 看 GIP 预算消耗。
        </p>
        <SearchBox />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {MODULES.map(({ href, icon: Icon, title, desc, owner }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {title}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">负责人：{owner}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
