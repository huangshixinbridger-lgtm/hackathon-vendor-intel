import Link from "next/link";
import { ArrowRight, BarChart3, ExternalLink, FileText, Radio, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { resolveDiagnosisDocument, DocumentBlock } from "./diagnosisData";
import { resolveGame } from "@/lib/games";

type DiagnosisPageProps = { searchParams?: { gameId?: string; q?: string } };

const DEFAULT_KPI_CARDS = [
  { label: "短视频总 VV", value: "4.05 亿", note: "竞品第 3 / 5" },
  { label: "短视频投稿", value: "28.30 万", note: "供给第 2 / 5", tone: "sky" },
  { label: "条均 VV", value: "1432", note: "效率低于头部", tone: "amber" },
  { label: "直播看播", value: "1161 万 min", note: "需求已被验证", tone: "emerald" },
];

const DEFAULT_MARKET_BARS = [
  { market: "DE", shortVideo: 92, live: 36 },
  { market: "VN", shortVideo: 86, live: 88 },
  { market: "US", shortVideo: 84, live: 82 },
  { market: "ID", shortVideo: 80, live: 90 },
  { market: "PK", shortVideo: 62, live: 20 },
];

const DEFAULT_ECOSYSTEM_CHARTS = [
  {
    title: "短视频竞品 VV 对比",
    unit: "亿 VV",
    color: "bg-primary",
    rows: [
      { name: "Delta Force", value: 16.83 },
      { name: "Elden Ring", value: 10.04 },
      { name: "燕云十六声", value: 4.05 },
      { name: "逆水寒", value: 0.68 },
      { name: "黑神话：悟空", value: 0.19 }
    ]
  },
  {
    title: "直播看播规模对比",
    unit: "万 min",
    color: "bg-emerald-500",
    rows: [
      { name: "Delta Force", value: 14400 },
      { name: "Elden Ring", value: 4331 },
      { name: "黑神话：悟空", value: 1217 },
      { name: "燕云十六声", value: 1161 },
      { name: "逆水寒", value: 791 }
    ]
  }
];

function getTextBlocks(blocks: DocumentBlock[]) {
  return blocks.filter((block): block is Extract<DocumentBlock, { type: "paragraph" }> => block.type === "paragraph");
}

function getListBlocks(blocks: DocumentBlock[]) {
  return blocks.filter((block): block is Extract<DocumentBlock, { type: "bulletList" }> => block.type === "bulletList");
}

function pickParagraph(blocks: DocumentBlock[], keyword: string) {
  return getTextBlocks(blocks).find((block) => block.text.includes(keyword))?.text;
}

function pickListItems(blocks: DocumentBlock[], keywords: string[]) {
  const list = getListBlocks(blocks).find((block) => keywords.some((keyword) => block.items.some((item) => item.includes(keyword))));
  return list?.items.slice(0, 4) ?? [];
}

function pickStructuredNotes(blocks: DocumentBlock[]) {
  const shortVideo =
    pickParagraph(blocks, "短视频") ??
    "短视频侧需要结合内容效率、消费规模和创作者供给判断下一步打法。";
  const live =
    pickParagraph(blocks, "直播") ??
    "直播侧需要结合看播规模、开播供给和重点国家结构判断预算投向。";
  const budget =
    pickParagraph(blocks, "预算") ??
    "预算建议应围绕已验证的高承接市场和内容形态做结构化投入。";

  return [
    { icon: TrendingUp, title: "短视频", text: shortVideo },
    { icon: Radio, title: "直播", text: live },
    { icon: FileText, title: "建议", text: budget }
  ];
}

function shouldSkipBlock(block: DocumentBlock) {
  if (block.type === "sectionHeader") {
    return ["使用资产链接", "参考来源"].some((title) => block.title.includes(title));
  }

  if (block.type === "paragraph") {
    return block.text.startsWith("[") || block.text.includes("评论（") || block.text.includes("本次交付未单独渲染图片");
  }

  if (block.type === "bulletList") {
    return block.items.some((item) => item.includes("短视频主图表") || item.includes("直播主图表") || item.includes("参考复盘"));
  }

  return false;
}

function renderBlock(block: DocumentBlock, index: number) {
  if (shouldSkipBlock(block)) {
    return null;
  }

  switch (block.type) {
    case "sectionHeader":
      return (
        <div key={index} className="border-b border-slate-200 pb-3 pt-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">{block.title}</h2>
        </div>
      );

    case "paragraph":
      return (
        <p key={index} className="text-sm leading-7 text-slate-600">
          {block.text}
        </p>
      );

    case "bulletList":
      return (
        <ul key={index} className="space-y-2 text-sm leading-6 text-slate-600">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div key={index} className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                {block.headers.map((header) => (
                  <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={row.some((cell) => cell.includes("燕云") || cell.includes("NTE")) ? "bg-indigo-50/60" : "bg-white"}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "image":
      return (
        <figure key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={block.src} alt={block.alt} className="w-full object-cover" />
          {block.caption ? <figcaption className="p-3 text-sm text-slate-500">{block.caption}</figcaption> : null}
        </figure>
      );

    case "callout":
      return (
        <div
          key={index}
          className={cn(
            "rounded-lg border p-4 text-sm leading-6",
            block.variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-950",
            block.variant === "warning" && "border-amber-200 bg-amber-50 text-amber-950",
            block.variant === "info" && "border-sky-200 bg-sky-50 text-sky-950"
          )}
        >
          {block.title ? <p className="mb-2 font-semibold">{block.title}</p> : null}
          <p>{block.text}</p>
        </div>
      );

    default:
      return null;
  }
}

export default async function DiagnosisPage({ searchParams }: DiagnosisPageProps) {
  const requestedId = searchParams?.gameId || searchParams?.q;
  const { document: diagnosisDocument, matched } = await resolveDiagnosisDocument(requestedId);
  const requestedName = requestedId ? resolveGame(requestedId)?.name ?? requestedId : "";
  const conclusion =
    diagnosisDocument.summary?.conclusion ??
    pickParagraph(diagnosisDocument.blocks, "继续投") ??
    pickParagraph(diagnosisDocument.blocks, "当前更接近") ??
    "诊断报告已生成，建议先查看结论卡和预算建议，再下钻短视频、直播和竞品对比。";
  const headline = diagnosisDocument.summary?.headline ?? "建议继续投，但打法从粗放扩量切到结构优化";
  const priorityActions = diagnosisDocument.summary?.priorityActions ?? ["短视频提效", "直播补供给", "重点国家定向"];
  const priorityItems =
    diagnosisDocument.summary?.talkTrack
      ? [diagnosisDocument.summary.talkTrack]
      : pickListItems(diagnosisDocument.blocks, ["短视频优先", "直播优先", "国家建议"]);
  const kpiCards = diagnosisDocument.kpis ?? DEFAULT_KPI_CARDS;
  const ecosystemCharts = diagnosisDocument.charts ?? DEFAULT_ECOSYSTEM_CHARTS;
  const marketBars = diagnosisDocument.marketBars ?? DEFAULT_MARKET_BARS;
  const structuredNotes = pickStructuredNotes(diagnosisDocument.blocks);

  return (
    <div className="space-y-6">
      {!matched && requestedName ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          诊断模块暂无「{requestedName}」的报告，下方为默认示例（{diagnosisDocument.gameName}）。
        </div>
      ) : null}
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">情报诊断</Badge>
            <Badge variant="secondary">{diagnosisDocument.badge}</Badge>
            <Badge variant="outline">近 3 个月</Badge>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{diagnosisDocument.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{diagnosisDocument.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {diagnosisDocument.sourceUrl ? (
            <a className={buttonVariants({ variant: "outline", size: "sm" })} href={diagnosisDocument.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Lark 原始诊断文档
            </a>
          ) : null}
          <Link className={buttonVariants({ variant: "default", size: "sm" })} href={`/gip?gameId=${diagnosisDocument.gameId}`}>
            查 GIP 消耗
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardDescription>结论先行</CardDescription>
            <CardTitle className="text-xl">{headline}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-7 text-slate-600">{conclusion}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {priorityActions.map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-xs text-muted-foreground">优先动作</p>
                  <p className="mt-1 text-sm font-medium text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>拜访可复用</CardDescription>
            <CardTitle className="text-base">项目方话术摘要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(priorityItems.length ? priorityItems : ["短视频优先：DE、VN、US、ID。", "直播优先：VN、US、ID。", "谨慎控制低承接市场的粗放铺量。"]).map((item) => (
              <div key={item} className="rounded-lg bg-accent px-3 py-2 text-sm leading-6 text-accent-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {ecosystemCharts.map((chart) => {
          const max = Math.max(...chart.rows.map((row) => row.value));
          return (
            <Card key={chart.title}>
              <CardHeader>
                <CardDescription>由文档指标表直接渲染</CardDescription>
                <CardTitle className="text-base">{chart.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chart.rows.map((row) => (
                  <div key={row.name} className="grid grid-cols-[92px_1fr_72px] items-center gap-3 text-sm">
                    <span className={cn("truncate", row.name === diagnosisDocument.gameName ? "font-semibold text-primary" : "text-slate-600")}>
                      {row.name}
                    </span>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn("h-3 rounded-full", chart.color)} style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }} />
                    </div>
                    <span className="text-right text-xs text-muted-foreground">
                      {row.value.toLocaleString()} {chart.unit}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardDescription>图文摘要</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              重点市场优先级
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketBars.map((item) => (
              <div key={item.market} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-950">{item.market}</span>
                  <span className="text-xs text-muted-foreground">短视频 / 直播</span>
                </div>
                <div className="grid gap-2">
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${item.shortVideo}%` }} />
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.live}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>诊断解释</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              结构性问题拆解
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {structuredNotes.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-4">
                <Icon className="h-4 w-4 text-primary" />
                <p className="mt-3 font-medium text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardDescription>平台生态、竞品对比与预算建议</CardDescription>
          <CardTitle>完整诊断正文</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">{diagnosisDocument.blocks.map(renderBlock)}</CardContent>
      </Card>
    </div>
  );
}
