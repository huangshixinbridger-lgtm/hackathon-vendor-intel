"use client";

// 驾驶舱「全息页」承载层：过渡视频显形座舱后，直接铺一张大面积全息高级感页面。
// 两屏共用同一外壳 HoloShell（网格底纹 + 扫描线 + 四角支架 + 霓虹描边 + 渐显）：
//   · ContentHolo   = 屏2 内容洞察（复用内容雷达 ContentRadarDetail）
//   · DiagnosisHolo = 屏3 经营诊断（复用 diagnosis + GIP 的 Free Fire 数字）
// 纯 CSS 呈现，不动各模块产品逻辑。

import { useEffect, useRef, useState } from "react";
import type { ContentRadarDetail } from "@/types/contract.contentRadar";
import type { DiagnosisDocument, DocumentBlock } from "@/app/diagnosis/diagnosisData";
import {
  resolveGipRecord,
  getBenchmarks,
  getStrategy,
  formatMoney,
  formatNumber,
  calcCpm,
} from "./cockpit-gip";
import type { RadarDatabaseSnapshot, TodaySummaryStats, RadarTableName } from "@/app/radar/database";
import { localCover } from "./content-covers";
import { resolveInsight, type ContentInsight } from "./content-insights";

function fmtVV(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)} 亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)} 万`;
  return `${n}`;
}

// ============== 共享外壳 ==============
function HoloShell({
  accent,
  eyebrow,
  heading,
  sub,
  badge,
  footer,
  children,
}: {
  accent: string;
  eyebrow: string;
  heading: string;
  sub?: string;
  badge?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // 每次挂载（含切换 content↔diagnosis 的 keyed 重挂）都从顶部开始，避免浏览器恢复旧滚动位。
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, []);

  return (
    <div className="absolute inset-0">
      {/* 让座舱视频边缘透出来的暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 72% at 50% 46%, transparent 40%, rgba(2,3,9,0.78) 100%)" }}
      />
      <div
        className="absolute inset-x-[3.5%] top-[7.5%] bottom-[4.5%] flex flex-col overflow-hidden rounded-2xl border backdrop-blur-md"
        style={{
          borderColor: `${accent}55`,
          background: "linear-gradient(160deg, rgba(8,12,22,0.82), rgba(4,6,14,0.9))",
          boxShadow: `0 0 0 1px ${accent}22, 0 0 80px ${accent}26, inset 0 0 120px ${accent}10`,
        }}
      >
        {/* 全息网格底纹 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
            backgroundSize: "46px 46px",
            maskImage: "radial-gradient(ellipse 90% 90% at 50% 30%, black, transparent 90%)",
          }}
        />
        {/* 扫描线 */}
        <div
          className="pointer-events-none absolute inset-x-0 h-24 opacity-30 holo-scan"
          style={{ background: `linear-gradient(180deg, transparent, ${accent}30, transparent)` }}
        />
        {/* 四角支架 */}
        {[
          "left-3 top-3 border-l-2 border-t-2",
          "right-3 top-3 border-r-2 border-t-2",
          "left-3 bottom-3 border-l-2 border-b-2",
          "right-3 bottom-3 border-r-2 border-b-2",
        ].map((c) => (
          <span key={c} className={`pointer-events-none absolute h-6 w-6 ${c}`} style={{ borderColor: accent }} />
        ))}

        {/* 头部 */}
        <div className="relative flex shrink-0 items-end justify-between gap-4 border-b px-7 py-4" style={{ borderColor: `${accent}33` }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accent }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
              {eyebrow}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <h2 className="truncate text-3xl font-bold tracking-tight text-white">{heading}</h2>
              {sub && <span className="truncate text-sm text-white/55">{sub}</span>}
            </div>
          </div>
          {badge && (
            <span className="shrink-0 rounded-full border px-3 py-1 text-[11px] tracking-wide text-white/75" style={{ borderColor: `${accent}55`, background: `${accent}14` }}>
              {badge}
            </span>
          )}
        </div>

        {/* 主体（可滚动） */}
        <div ref={bodyRef} className="holo-body relative min-h-0 flex-1 overflow-y-auto px-7 py-5">{children}</div>

        {/* 底部动作条 */}
        {footer && (
          <div className="relative flex shrink-0 items-center justify-between gap-3 border-t px-7 py-3" style={{ borderColor: `${accent}33` }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes holoScan { 0% { top: -10%; } 100% { top: 110%; } }
        .holo-scan { animation: holoScan 6s linear infinite; }
        .holo-body::-webkit-scrollbar { width: 6px; }
        .holo-body::-webkit-scrollbar-thumb { background: ${accent}55; border-radius: 999px; }
        @keyframes holoRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .holo-rise { animation: holoRise 0.5s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>
    </div>
  );
}

function GhostBtn({ children, onClick, accent }: { children: React.ReactNode; onClick: () => void; accent: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-4 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/10"
      style={{ borderColor: `${accent}66` }}
    >
      {children}
    </button>
  );
}

// 滚轮进入视口时淡入上浮（「滚轮展开延展空间」的动效）。
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShown(true)),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(22px)",
        transition: `opacity .55s ease ${delay}s, transform .55s cubic-bezier(.2,.7,.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// 全息分区标题
function SectionTitle({ accent, eyebrow, title, right }: { accent: string; eyebrow?: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 border-b pb-2" style={{ borderColor: `${accent}26` }}>
      <div>
        {eyebrow && <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>{eyebrow}</div>}
        <h3 className="mt-0.5 text-base font-semibold text-white">{title}</h3>
      </div>
      {right}
    </div>
  );
}

function Panel({ accent, children, className = "" }: { accent: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border p-4 ${className}`} style={{ borderColor: `${accent}22`, background: "rgba(255,255,255,0.02)" }}>
      {children}
    </div>
  );
}

function StatTile({ label, value, note, accent }: { label: string; value: string; note: string; accent: string }) {
  return (
    <div className="rounded-xl border px-4 py-3" style={{ borderColor: `${accent}33`, background: "rgba(255,255,255,0.03)" }}>
      <div className="text-[11px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-[11px]" style={{ color: accent }}>{note}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] text-white/45">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

// 诊断正文块 → 全息风格（保留 diagnosis 模块的 table / callout / bulletList / paragraph 全部内容）
function HoloBlock({ block, accent, gameName }: { block: DocumentBlock; accent: string; gameName: string }) {
  switch (block.type) {
    case "sectionHeader":
      return <h4 className="pt-2 text-sm font-semibold tracking-wide" style={{ color: accent }}>{block.title}</h4>;
    case "paragraph":
      return <p className="text-[13px] leading-7 text-white/70">{block.text}</p>;
    case "bulletList":
      return (
        <ul className="space-y-1.5">
          {block.items.map((it) => (
            <li key={it} className="flex gap-2 text-[13px] leading-6 text-white/75">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: `${accent}22` }}>
          <table className="min-w-full text-left text-[12px]">
            <thead>
              <tr style={{ background: `${accent}14` }}>
                {block.headers.map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2 font-medium text-white/80">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => {
                const hi = row.some((c) => c.includes(gameName));
                return (
                  <tr key={ri} style={{ background: hi ? `${accent}12` : "transparent", borderTop: `1px solid ${accent}14` }}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="whitespace-nowrap px-3 py-2 text-white/70">{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div
          className="rounded-lg border px-3.5 py-3 text-[13px] leading-6"
          style={{
            borderColor: block.variant === "warning" ? "#f59e0b55" : block.variant === "info" ? "#38bdf855" : `${accent}55`,
            background: block.variant === "warning" ? "#f59e0b14" : block.variant === "info" ? "#38bdf814" : `${accent}12`,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {block.title && <div className="mb-1 font-semibold text-white">{block.title}</div>}
          <div>{block.text}</div>
        </div>
      );
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.src} alt={block.alt} className="w-full rounded-lg border" style={{ borderColor: `${accent}22` }} />;
    default:
      return null;
  }
}

// ============== 屏2：内容洞察 ==============
export function ContentHolo({
  data,
  accent,
  gameName,
  vendor,
  category,
  onClose,
  onDiagnosis,
}: {
  data: ContentRadarDetail | null;
  accent: string;
  gameName: string;
  vendor: string;
  category: string;
  onClose: () => void;
  onDiagnosis: () => void;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<ContentInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const totalVV = data ? data.topVideos.reduce((s, v) => s + v.vv, 0) : 0;
  const top = data ? [...data.topVideos].sort((a, b) => b.vv - a.vv) : [];
  const curated = data ? resolveInsight(data.gameId) : null;
  const insight = aiInsight ?? curated; // 先显策展，AI 实时分析回来后替换
  const gameId = data?.gameId;

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    setAiInsight(null);
    setInsightLoading(true);
    fetch(`/cockpit/api/insight?gameId=${encodeURIComponent(gameId)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.insight) setAiInsight(d.insight as ContentInsight); })
      .catch(() => { /* 失败保留策展洞察 */ })
      .finally(() => { if (!cancelled) setInsightLoading(false); });
    return () => { cancelled = true; };
  }, [gameId]);

  return (
    <HoloShell
      accent={accent}
      eyebrow="Surface Scan · 内容洞察"
      heading={gameName}
      sub={`${vendor} · ${category}`}
      badge={data ? `${fmtVV(totalVV)} 播放 · Top ${Math.min(top.length, 8)}` : "数据接入中"}
      footer={
        <>
          <GhostBtn onClick={onClose} accent={accent}>↑ 回舷窗</GhostBtn>
          <button
            onClick={onDiagnosis}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
          >
            经营诊断 →
          </button>
        </>
      }
    >
      {!data ? (
        <div className="flex h-full items-center justify-center text-sm text-white/50">
          仪表盘暂无「{gameName}」的内容数据。
        </div>
      ) : (
        <div className="space-y-6">
          {/* 总结性洞察（单独模块）*/}
          {insight && (
            <div className="holo-rise rounded-2xl border px-5 py-4" style={{ borderColor: `${accent}44`, background: `linear-gradient(120deg, ${accent}12, transparent)` }}>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                内容洞察总结
                <span className="ml-1 rounded-full border px-1.5 py-0.5 text-[9px] tracking-normal text-white/45" style={{ borderColor: `${accent}44` }}>
                  {insightLoading ? "AI 分析中…" : insight.source === "ai" ? "AI 实时分析" : "策展洞察"}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-7 text-white/85">{insight.summary}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {[
                  { k: "内容特点", v: insight.traits },
                  { k: "热门梗 · 玩法", v: insight.memes },
                  { k: "达人营销怎么做", v: insight.playbook },
                ].map((b) => (
                  <div key={b.k} className="rounded-xl border px-3.5 py-3" style={{ borderColor: `${accent}22`, background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[11px] font-medium" style={{ color: accent }}>{b.k}</div>
                    <div className="mt-1.5 text-[12px] leading-6 text-white/70">{b.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* 内容类型 */}
          <div className="holo-rise space-y-2.5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">内容类型 · 按播放占比</div>
            {data.contentTypes.map((t) => {
              const on = activeTag === t.tag;
              return (
                <button
                  key={t.tag}
                  onClick={() => setActiveTag(on ? null : t.tag)}
                  className="w-full rounded-xl border px-3.5 py-3 text-left transition-colors"
                  style={{ borderColor: on ? accent : "rgba(255,255,255,0.1)", background: on ? `${accent}1f` : "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-white/90">
                      {t.tag}
                      {t.isGap && <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-300">缺口</span>}
                    </span>
                    <span className="text-sm font-semibold text-white">{Math.round(t.vvShare * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(6, t.vvShare * 100)}%`, background: accent, boxShadow: `0 0 10px ${accent}` }} />
                  </div>
                  {on && <div className="mt-2 text-[11px] leading-snug text-white/60">{t.note}</div>}
                </button>
              );
            })}
          </div>

          {/* Top 视频墙 */}
          <div className="holo-rise" style={{ animationDelay: "0.08s" }}>
            <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-white/45">为什么火 · Top 视频墙</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {top.slice(0, 8).map((v, i) => {
                const dim = activeTag ? !data.contentTypes.find((t) => t.tag === activeTag)?.exampleVideoIds.includes(v.id) : false;
                const cover = v.coverUrl || localCover(v.id);
                return (
                  <a
                    key={v.id}
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{ borderColor: `${accent}33`, background: "rgba(255,255,255,0.03)", opacity: dim ? 0.22 : 1 }}
                  >
                    <div className="relative flex h-36 items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}26, #05060f)` }}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl font-black text-white/15">#{i + 1}</span>
                      )}
                      <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: accent }}>#{i + 1}</span>
                      <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">▶ {fmtVV(v.vv)}</span>
                    </div>
                    <div className="flex-1 p-2.5">
                      <div className="text-xs leading-snug text-white/85 line-clamp-3">{v.whyViral.oneLine}</div>
                      <div className="mt-1.5 truncate text-[10px] text-white/40">@{v.author}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      )}
    </HoloShell>
  );
}

// ============== 屏3：经营诊断（diagnosis + GIP 合并） ==============
export function DiagnosisHolo({
  doc,
  accent,
  gameName,
  gameId,
  onClose,
  onContent,
}: {
  doc: DiagnosisDocument | null;
  accent: string;
  gameName: string;
  gameId: string;
  onClose: () => void;
  onContent: () => void;
}) {
  const gip = resolveGipRecord(gameId);
  const peers = gip ? getBenchmarks(gip) : [];
  const strategy = gip ? getStrategy(gip, peers) : null;
  const burn = gip && gip.budget > 0 ? Math.round((gip.consumption / gip.budget) * 100) : 0;

  // markdown-only 诊断（如燕云十六声）没有 summary/kpis，从正文里兜底出 hero，避免空白。
  const blocks = doc?.blocks ?? [];
  const firstCallout = blocks.find((b): b is Extract<DocumentBlock, { type: "callout" }> => b.type === "callout");
  const firstPara = blocks.find((b): b is Extract<DocumentBlock, { type: "paragraph" }> => b.type === "paragraph");
  const headline = doc?.summary?.headline ?? (doc ? firstCallout?.title ?? doc.title : undefined);
  const conclusion = doc?.summary?.conclusion ?? firstCallout?.text ?? firstPara?.text;
  const priorityActions = doc?.summary?.priorityActions ?? [];
  const talkTrack = doc?.summary?.talkTrack;
  const kpis = doc?.kpis ?? [];
  const charts = doc?.charts ?? [];
  const marketBars = doc?.marketBars ?? [];

  return (
    <HoloShell
      accent={accent}
      eyebrow="Deep Scan · 经营诊断"
      heading={gameName}
      sub={doc?.subtitle}
      badge={doc ? "诊断 + GIP 合并" : "数据接入中"}
      footer={
        <>
          <div className="flex items-center gap-2">
            <GhostBtn onClick={onClose} accent={accent}>↑ 回舷窗</GhostBtn>
            <GhostBtn onClick={onContent} accent={accent}>← 内容洞察</GhostBtn>
          </div>
          {doc?.sourceUrl && (
            <a href={doc.sourceUrl} target="_blank" rel="noreferrer" className="text-[11px] text-white/45 hover:text-white/80">Lark 原始诊断文档 ↗</a>
          )}
        </>
      }
    >
      {!doc ? (
        <div className="flex h-full items-center justify-center text-sm text-white/50">
          暂无「{gameName}」的经营诊断数据。
        </div>
      ) : (
        <div className="space-y-8 pb-2">
          {/* ===== 诊断报告 ===== */}
          {/* 结论先行 + 话术 */}
          <Reveal>
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-2xl border px-5 py-4" style={{ borderColor: `${accent}44`, background: `linear-gradient(120deg, ${accent}14, transparent)` }}>
                <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>结论先行</div>
                {headline && <h3 className="mt-1 text-lg font-bold text-white">{headline}</h3>}
                {conclusion && <p className="mt-2 text-[13px] leading-7 text-white/75">{conclusion}</p>}
                {priorityActions.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {priorityActions.map((a) => (
                      <div key={a} className="rounded-lg border px-3 py-2" style={{ borderColor: `${accent}33`, background: "rgba(255,255,255,0.03)" }}>
                        <div className="text-[10px] text-white/45">优先动作</div>
                        <div className="mt-0.5 text-[13px] font-medium text-white">{a}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Panel accent={accent}>
                <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>项目方话术 · 可复用</div>
                <p className="mt-2 text-[13px] leading-7 text-white/80">{talkTrack ?? "短视频优先高承接市场，直播补节点，谨慎控制低承接市场的粗放铺量。"}</p>
              </Panel>
            </div>
          </Reveal>

          {/* KPI 四联 */}
          {kpis.length > 0 && (
            <Reveal>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map((k) => (
                  <StatTile key={k.label} label={k.label} value={k.value} note={k.note} accent={accent} />
                ))}
              </div>
            </Reveal>
          )}

          {/* 生态指标 / 竞品图表 */}
          {charts.length > 0 && (
            <Reveal>
              <SectionTitle accent={accent} eyebrow="Ecosystem" title="平台生态 · 指标对比" />
              <div className="grid gap-4 lg:grid-cols-2">
                {charts.map((chart) => {
                  const max = Math.max(...chart.rows.map((r) => r.value), 1);
                  return (
                    <Panel key={chart.title} accent={accent}>
                      <div className="mb-3 text-sm font-medium text-white/85">{chart.title}</div>
                      <div className="space-y-2.5">
                        {chart.rows.map((row) => {
                          const hi = row.name === gameName;
                          return (
                            <div key={row.name} className="grid grid-cols-[120px_1fr_82px] items-center gap-2 text-[12px]">
                              <span className={hi ? "truncate font-semibold" : "truncate text-white/65"} style={hi ? { color: accent } : undefined}>{row.name}</span>
                              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full" style={{ width: `${Math.max((row.value / max) * 100, 3)}%`, background: accent, boxShadow: `0 0 8px ${accent}` }} />
                              </div>
                              <span className="text-right text-white/55">{row.value.toLocaleString()} {chart.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </Reveal>
          )}

          {/* 重点市场优先级（短视频 / 直播 双条） */}
          {marketBars.length > 0 && (
            <Reveal>
              <SectionTitle accent={accent} eyebrow="Markets" title="重点市场优先级" right={
                <div className="flex items-center gap-3 text-[11px] text-white/55">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: accent }} />短视频</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />直播</span>
                </div>
              } />
              <Panel accent={accent}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {marketBars.map((m) => (
                    <div key={m.market} className="space-y-1.5">
                      <div className="text-sm font-medium text-white/85">{m.market}</div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${m.shortVideo}%`, background: accent }} /></div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${m.live}%` }} /></div>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>
          )}

          {/* 完整诊断正文（表格 / callout / 列表 / 段落全保留） */}
          <Reveal>
            <SectionTitle accent={accent} eyebrow="Full Report" title="完整诊断正文" />
            <Panel accent={accent} className="space-y-3">
              {doc.blocks.map((b, i) => (
                <HoloBlock key={i} block={b} accent={accent} gameName={gameName} />
              ))}
            </Panel>
          </Reveal>

          {/* ===== GIP 经营投放 ===== */}
          <Reveal>
            <div className="flex items-center gap-3 pt-1">
              <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${accent}66)` }} />
              <span className="text-[11px] uppercase tracking-[0.35em]" style={{ color: accent }}>GIP 经营投放</span>
              <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent}66, transparent)` }} />
            </div>
          </Reveal>

          {!gip || !strategy ? (
            <Reveal>
              <Panel accent={accent}>
                <div className="text-sm text-white/55">GIP 面板暂无「{gameName}」的投放数据。</div>
              </Panel>
            </Reveal>
          ) : (
            <>
              {/* GIP 策略报告：建议预算 + 方向 + T0/T1/T2 节点 */}
              <Reveal>
                <SectionTitle accent={accent} eyebrow="Strategy" title="GIP 策略报告输出" right={
                  <span className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ background: `${accent}1f`, color: accent }}>{gip.stage}</span>
                } />
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <Panel accent={accent}>
                    <div className="text-[10px] uppercase tracking-wider text-white/45">Strategy for {gip.game}</div>
                    <div className="mt-1 text-2xl font-bold text-white">{formatMoney(strategy.suggestedBudget)} <span className="text-sm font-normal text-white/55">建议投放预算</span></div>
                    <p className="mt-2 text-[13px] leading-6 text-white/70">{strategy.conclusion}</p>
                    <p className="mt-1 text-[13px] leading-6 text-white/70">{strategy.direction}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Mini label="优先市场" value={strategy.peerRegions} />
                      <Mini label="历史/参考 CPM" value={`$${strategy.cpm.toFixed(2)}`} />
                      <Mini label="互动率" value={`${strategy.engagementRate.toFixed(2)}%`} />
                    </div>
                  </Panel>
                  <div className="space-y-2.5">
                    {strategy.nodes.map((node) => (
                      <div key={node.name} className="rounded-xl border px-4 py-3" style={{ borderColor: `${accent}26`, background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">{node.name}</span>
                          <span className="rounded-full border px-2 py-0.5 text-[11px] text-white/80" style={{ borderColor: `${accent}44` }}>{formatMoney(node.budget)}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-white/45">市场：{node.market}</div>
                        <div className="mt-1 text-[12px] leading-6 text-white/75">{node.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* GIP 汇总 + 自然量 */}
              <Reveal>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatTile label="GIP 预算" value={formatMoney(gip.budget)} note={`${gip.period} · ${gip.region}`} accent={accent} />
                  <StatTile label="GIP 消耗" value={formatMoney(gip.consumption)} note={`消耗率 ${burn}%`} accent={accent} />
                  <StatTile label="自然 VV" value={formatNumber(gip.organic.vv)} note={`${gip.organic.position}身位`} accent={accent} />
                  <StatTile label="直播观众 / 创作者" value={`${formatNumber(gip.organic.liveViewers)}`} note={`创作者 ${formatNumber(gip.organic.creators)}`} accent={accent} />
                </div>
                <div className="mt-3">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${burn}%`, background: `linear-gradient(90deg, ${accent}, #fff8)`, boxShadow: `0 0 12px ${accent}` }} />
                  </div>
                  <div className="mt-1 text-right text-[11px]" style={{ color: accent }}>预算燃料已消耗 {burn}%</div>
                </div>
              </Reveal>

              {/* 历史投放复盘（活动全量明细） */}
              <Reveal>
                <SectionTitle accent={accent} eyebrow="Review" title="历史投放复盘" />
                <div className="grid gap-3 lg:grid-cols-2">
                  {gip.activities.map((a) => (
                    <Panel key={`${a.name}-${a.region}`} accent={accent}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white">{a.name}</div>
                          <div className="mt-0.5 text-[11px] text-white/50">{a.period} · {a.region} · {a.billingMode} · {a.creatorTier}</div>
                        </div>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px]" style={{ background: `${accent}1f`, color: accent }}>{formatMoney(a.spend)}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        <Mini label="VV" value={formatNumber(a.vv)} />
                        <Mini label="投稿" value={formatNumber(a.posts)} />
                        <Mini label="达人" value={formatNumber(a.creators)} />
                        <Mini label="CPM" value={`$${calcCpm(a.spend, a.vv).toFixed(2)}`} />
                      </div>
                      <p className="mt-2.5 text-[12px] leading-6 text-white/70"><b className="text-white/85">内容模板：</b>{a.contentAngle}。<b className="text-white/85">复盘：</b>{a.review}</p>
                    </Panel>
                  ))}
                </div>
              </Reveal>

              {/* 同品类 Benchmark */}
              <Reveal>
                <SectionTitle accent={accent} eyebrow="Benchmark" title="同品类 Benchmark" />
                <div className="grid gap-3 lg:grid-cols-2">
                  {peers.map((peer) => (
                    <Panel key={`${peer.category}-${peer.region}`} accent={accent}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">{peer.region} · {peer.category}</span>
                        <span className="rounded-full border px-2 py-0.5 text-[11px] text-white/80" style={{ borderColor: `${accent}44` }}>CPM ${peer.avgCpm.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Mini label="均值预算" value={formatMoney(peer.avgSpend)} />
                        <Mini label="均值 VV" value={formatNumber(peer.avgVv)} />
                        <Mini label="互动率" value={`${peer.avgEngagementRate.toFixed(1)}%`} />
                      </div>
                      <p className="mt-2.5 text-[12px] leading-6 text-white/70">标杆：{peer.bestCase}。{peer.insight}</p>
                    </Panel>
                  ))}
                </div>
              </Reveal>
            </>
          )}
        </div>
      )}
    </HoloShell>
  );
}

// ============== 屏1 入口：情报雷达（完整功能：今日摘要 + 库存量 + 三表 tab/搜索/分页）==============
const MOVE_TONE: Record<string, string> = {
  新游: "#34d399",
  版本更新: "#38bdf8",
  大版本: "#fbbf24",
  活动: "#e879f9",
};

type RadarCol = [string, string];
const RADAR_TABLES: { name: RadarTableName; title: string; columns: RadarCol[] }[] = [
  {
    name: "updates",
    title: "游戏动态表",
    columns: [["date", "日期"], ["moveType", "动作"], ["name", "游戏/厂商"], ["companyName", "公司"], ["category", "品类"], ["summary", "摘要"], ["source", "来源"], ["importance", "重要度"]],
  },
  {
    name: "games",
    title: "游戏项目表",
    columns: [["name", "游戏"], ["vendorName", "游戏厂商"], ["stage", "阶段"], ["genres", "品类"], ["platforms", "平台"], ["releaseRegions", "区域"], ["officialSite", "官网"], ["wikipediaUrl", "Wikipedia"], ["latestProgress", "最新进展"], ["relevanceScore", "关注度"]],
  },
  {
    name: "companies",
    title: "游戏厂商表",
    columns: [["name", "厂商"], ["marketRegion", "区域/国家地区"], ["description", "描述"], ["website", "官网"], ["wikipediaUrl", "Wikipedia"], ["updatedAt", "更新时间"]],
  },
];

function fmtCell(v: unknown): string {
  if (Array.isArray(v)) return v.join(" / ");
  if (v === null || v === undefined) return "";
  return String(v);
}

function RadarCell({ row, col, accent }: { row: Record<string, unknown>; col: string; accent: string }) {
  if (col === "vendorName") return <span className="line-clamp-2">{fmtCell(row.publisher || row.developer || row.companyName)}</span>;
  if (col === "marketRegion") {
    const region = fmtCell(row.region);
    const country = fmtCell(row.headquartersCountry);
    const val = [region, country].filter((x, i, l) => x && l.indexOf(x) === i).join(" / ");
    return <span className="line-clamp-2">{val}</span>;
  }
  if ((col === "updatedAt" || col === "createdAt") && typeof row[col] === "string") return <span>{(row[col] as string).slice(0, 10)}</span>;
  if (col === "moveType") {
    const c = MOVE_TONE[fmtCell(row.moveType)] ?? accent;
    return <span className="rounded px-1.5 py-0.5 text-[11px]" style={{ background: `${c}22`, color: c }}>{fmtCell(row.moveType)}</span>;
  }
  if (col === "importance") {
    const n = Number(row.importance) || 0;
    return <span className="font-semibold" style={{ color: n >= 4 ? accent : "rgba(255,255,255,0.6)" }}>{n}</span>;
  }
  if (col === "source" && typeof row.source === "string" && typeof row.sourceUrl === "string" && row.sourceUrl) {
    return <a className="hover:underline" style={{ color: accent }} href={row.sourceUrl as string} target="_blank" rel="noreferrer">{row.source as string}</a>;
  }
  if ((col === "website" || col === "officialSite" || col === "wikipediaUrl") && typeof row[col] === "string" && row[col]) {
    return <a className="hover:underline" style={{ color: accent }} href={row[col] as string} target="_blank" rel="noreferrer">{col === "wikipediaUrl" ? "打开" : (row[col] as string)}</a>;
  }
  return <span className="line-clamp-2">{fmtCell(row[col])}</span>;
}

export function RadarHolo({
  snapshot: initialSnapshot,
  summary,
  accent,
  onClose,
}: {
  snapshot: RadarDatabaseSnapshot | null;
  summary: TodaySummaryStats | null;
  accent: string;
  onClose: () => void;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [tab, setTab] = useState<RadarTableName>("updates");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fetching, setFetching] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  // 手动抓取全网新动态：触发 radar 后端 RSS 抓取 → 重新拉取最新库快照（原地刷新，不退出座舱）。
  async function manualFetch() {
    setFetching(true);
    try {
      await fetch("/radar/api/refresh", { method: "POST", cache: "no-store" });
      const res = await fetch("/radar/api/tables", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as RadarDatabaseSnapshot;
        setSnapshot(data);
        setFetchedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
      }
    } catch {
      /* 抓取失败静默，保留现有数据 */
    } finally {
      setFetching(false);
    }
  }

  const cfg = RADAR_TABLES.find((t) => t.name === tab) ?? RADAR_TABLES[0];
  const allRows = (snapshot ? (snapshot[tab] as Array<Record<string, unknown>>) : []) ?? [];
  const kw = query.trim().toLowerCase();
  const rows = kw
    ? allRows.filter((r) => Object.values(r).some((v) => fmtCell(v).toLowerCase().includes(kw)))
    : allRows;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const cur = Math.min(page, totalPages);
  const pageRows = rows.slice((cur - 1) * pageSize, cur * pageSize);
  const start = rows.length === 0 ? 0 : (cur - 1) * pageSize + 1;
  const end = Math.min(rows.length, cur * pageSize);

  useEffect(() => { setPage(1); }, [tab, pageSize, query]);

  return (
    <HoloShell
      accent={accent}
      eyebrow="Long-Range Scan · 情报雷达"
      heading="情报雷达 · 我该关注谁"
      sub="自动追踪厂商/市场动作"
      badge={snapshot ? `${snapshot.stats.updateCount} 条情报流` : "数据接入中"}
      footer={
        <>
          <GhostBtn onClick={onClose} accent={accent}>↑ 回舷窗</GhostBtn>
          <div className="flex items-center gap-3">
            {fetchedAt && <span className="text-[11px] text-white/40">已更新 {fetchedAt}</span>}
            <button
              onClick={manualFetch}
              disabled={fetching}
              className="rounded-full border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              {fetching ? "抓取中…" : "↻ 手动抓取全网新动态"}
            </button>
          </div>
        </>
      }
    >
      {!snapshot ? (
        <div className="flex h-full items-center justify-center text-sm text-white/50">情报雷达数据接入中。</div>
      ) : (
        <div className="space-y-7 pb-2">
          {/* 今日摘要 */}
          {summary && (
            <Reveal>
              <SectionTitle accent={accent} eyebrow="Daily" title={`今日摘要 · ${summary.date}`} right={
                <span className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ background: `${accent}1f`, color: accent }}>高重要度 {summary.topItems.filter((i) => i.importance >= 4).length} 条</span>
              } />
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="今日新增动态" value={`${summary.updateCount}`} note="updates" accent={accent} />
                <StatTile label="涉及游戏" value={`${summary.gameNames.length}`} note="games" accent={accent} />
                <StatTile label="涉及厂商" value={`${summary.companyNames.length}`} note="companies" accent={accent} />
              </div>
              <Panel accent={accent} className="mt-3">
                <div className="mb-2 text-[11px] uppercase tracking-wider text-white/45">重要摘要 Top 5</div>
                <div className="space-y-1.5">
                  {summary.topItems.map((item) => {
                    const c = MOVE_TONE[item.moveType] ?? accent;
                    return (
                      <div key={item.id} className="grid grid-cols-[80px_110px_1fr] items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] hover:bg-white/[0.04]">
                        <span className="text-white/45">{item.date}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: `${c}22`, color: c }}>{item.moveType}</span>
                          <span className="text-white/45">{item.importance}</span>
                        </span>
                        <span className="line-clamp-1 text-white/80">{item.name}：{item.summary}</span>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </Reveal>
          )}

          {/* 数据库快照 */}
          <Reveal>
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="厂商表" value={`${snapshot.stats.companyCount}`} note="companies" accent={accent} />
              <StatTile label="游戏项目表" value={`${snapshot.stats.gameCount}`} note="games" accent={accent} />
              <StatTile label="情报流" value={`${snapshot.stats.updateCount}`} note={`updates · 最新 ${snapshot.stats.latestUpdateDate}`} accent={accent} />
            </div>
          </Reveal>

          {/* 三表：tab + 搜索 + 分页 */}
          <Reveal>
            <SectionTitle accent={accent} eyebrow="Database" title="情报数据库" right={
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="实时搜索表内容"
                className="h-8 w-48 rounded-md border bg-black/30 px-2.5 text-[12px] text-white placeholder:text-white/30 focus:outline-none"
                style={{ borderColor: `${accent}44` }}
              />
            } />
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-4">
                {RADAR_TABLES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTab(t.name)}
                    className="border-b-2 pb-1 text-sm transition-colors"
                    style={{ borderColor: tab === t.name ? accent : "transparent", color: tab === t.name ? "#fff" : "rgba(255,255,255,0.5)" }}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[11px] text-white/45">
                每页
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-7 rounded border bg-black/30 px-1.5 text-white" style={{ borderColor: `${accent}33` }}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                条
              </label>
            </div>
            <div className="mb-2 text-[11px] text-white/45">{rows.length} 条记录，当前显示 {start}-{end}</div>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: `${accent}22` }}>
              <table className="w-full min-w-[820px] text-left text-[12px]">
                <thead>
                  <tr style={{ background: `${accent}12` }}>
                    {cfg.columns.map(([, label]) => (
                      <th key={label} className="whitespace-nowrap px-3 py-2 font-medium text-white/75">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, i) => (
                    <tr key={`${tab}-${String(row.id ?? row.name ?? i)}-${cur}`} style={{ borderTop: `1px solid ${accent}14` }}>
                      {cfg.columns.map(([key]) => (
                        <td key={key} className="max-w-[300px] px-3 py-2.5 align-top text-white/70">
                          <RadarCell row={row} col={key} accent={accent} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td className="px-3 py-8 text-center text-white/40" colSpan={cfg.columns.length}>暂无匹配记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-white/55">
              <span>第 {cur} / {totalPages} 页</span>
              <div className="flex gap-2">
                {[["首页", () => setPage(1), cur <= 1], ["上一页", () => setPage((v) => Math.max(1, v - 1)), cur <= 1], ["下一页", () => setPage((v) => Math.min(totalPages, v + 1)), cur >= totalPages], ["末页", () => setPage(totalPages), cur >= totalPages]].map(([label, fn, dis]) => (
                  <button key={label as string} onClick={fn as () => void} disabled={dis as boolean} className="rounded border px-2.5 py-1 disabled:opacity-40" style={{ borderColor: `${accent}33` }}>{label as string}</button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </HoloShell>
  );
}
