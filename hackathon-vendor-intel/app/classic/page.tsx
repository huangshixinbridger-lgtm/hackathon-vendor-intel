// app/classic/page.tsx —— 朴素(导航栏)版首页：保留原始模块网格 + 搜索入口。
// 与沉浸式驾驶舱(/)互为切换：驾驶舱右上角「经典视图」进来这里，这里可「进入驾驶舱」回去。
import Link from "next/link";
import { Radar, Stethoscope, BarChart3, ArrowRight, Sparkles, Rocket } from "lucide-react";
import { SearchBox } from "@/components/shell/search-box";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MODULES = [
  { href: "/radar", icon: Radar, title: "① 情报雷达", desc: "最近谁有动作：新游、版本更新、大动作。先解决「我该关注谁」。", owner: "Gardner" },
  { href: "/content-radar", icon: Sparkles, title: "② 内容雷达", desc: "这游戏在 TikTok 靠什么内容活着：top 内容为什么火 + 内容类型分布。", owner: "Jeff" },
  { href: "/diagnosis", icon: Stethoscope, title: "③ 诊断报告", desc: "选中一个游戏，一键出它在平台的生态、竞品对比、推荐营销动作。", owner: "Rena" },
  { href: "/gip", icon: BarChart3, title: "④ GIP 面板", desc: "分时段/游戏/品类/厂商看预算与消耗，可下钻到活动明细。", owner: "白思宇" },
];

export default function ClassicHomePage() {
  return (
    <div className="space-y-12">
      <section className="flex flex-col items-center gap-5 pt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Rocket className="h-3.5 w-3.5" />
          进入驾驶舱 · 星图视图
        </Link>
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
