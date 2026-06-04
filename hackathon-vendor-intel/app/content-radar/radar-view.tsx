"use client";
// app/content-radar/radar-view.tsx —— 内容雷达 · 编辑杂志风视图（Jeff）
// 极简留白 + 超大标题 + Apple Music 式漂浮气泡 + 大图编辑排版 + framer-motion 动效。
import { useState } from "react";
import { motion } from "framer-motion";
import type { ContentRadarDetail, ContentTypeBubble } from "@/types/contract.contentRadar";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: EASE } }),
};

// Apple Music 式气泡云：紧凑聚类 + 持续轻柔漂浮（纯 CSS 动画，稳定不受 framer 挂载问题影响）
function BubbleCloud({ types }: { types: ContentTypeBubble[] }) {
  const sorted = [...types].sort((a, b) => b.vvShare - a.vvShare);
  const GOLDEN = 2.39996323;
  const SPREAD = 60; // 越小越黏（聚类越紧）
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-2xl">
      <style>{`
        @keyframes ffIn { from { opacity: 0; scale: .4 } to { opacity: 1; scale: 1 } }
        @keyframes ffFloat { 0%,100% { translate: 0 0 } 50% { translate: 0 -12px } }
        @keyframes ffFloat2 { 0%,100% { translate: 0 0 } 50% { translate: 5px -8px } }
      `}</style>
      {sorted.map((t, i) => {
        const d = 100 + t.vvShare * 360; // 直径 ~130–185
        const r = SPREAD * Math.sqrt(i);
        const tx = Math.cos(i * GOLDEN) * r;
        const ty = Math.sin(i * GOLDEN) * r;
        const fill = 0.06 + t.vvShare * 0.5; // 越大越实
        return (
          <div
            key={t.tag}
            className="absolute"
            style={{ left: `calc(50% + ${tx}px)`, top: `calc(50% + ${ty}px)`, transform: "translate(-50%,-50%)", width: d, height: d }}
          >
            <div
              title={t.note}
              className="flex h-full w-full cursor-default flex-col items-center justify-center rounded-full border border-indigo-500/25 transition-[scale] duration-200 hover:scale-105"
              style={{
                backgroundColor: `rgba(99,102,241,${fill})`,
                animation: `ffIn .6s ease ${i * 0.09}s both, ${i % 2 ? "ffFloat2" : "ffFloat"} ${3.4 + i * 0.5}s ease-in-out ${0.6 + i * 0.09}s infinite`,
              }}
            >
              <span className="text-2xl font-light tabular-nums text-foreground">
                {Math.round(t.vvShare * 100)}
                <span className="align-top text-xs text-muted-foreground">%</span>
              </span>
              <span className="mt-0.5 max-w-[7.5rem] text-center text-xs leading-tight text-foreground/75">{t.tag}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RadarView({ data }: { data: ContentRadarDetail }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const totalVV = data.topVideos.reduce((s, v) => s + v.vv, 0);

  return (
    <div className="mx-auto max-w-5xl px-2 pb-32">
      {/* Hero */}
      <motion.header initial="hidden" animate="show" variants={fadeUp} className="pt-10 pb-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">内容雷达 · TikTok 内容生态</p>
        <h1 className="mt-4 text-6xl font-bold tracking-tight sm:text-7xl">{data.gameName}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          这款游戏在 TikTok 上靠什么内容活着 —— {fmt(totalVV)} 播放背后的内容语言，
          以及每条爆款<span className="text-foreground">为什么火</span>。
        </p>
      </motion.header>

      {/* 内容类型 · Apple Music 式漂浮气泡 */}
      <section className="mb-20">
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}
          className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          内容类型 · 按播放占比
        </motion.h2>
        <BubbleCloud types={data.contentTypes} />
      </section>

      {/* Top 内容 · 为什么火 */}
      <section>
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}
          className="mb-14 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Top 内容 · 为什么火
        </motion.h2>

        <div className="space-y-24">
          {data.topVideos.map((v, i) => {
            const isPlaying = playing === v.id;
            const flip = i % 2 === 1;
            return (
              <motion.article
                key={v.id}
                initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                className={`flex flex-col gap-8 md:flex-row md:items-start ${flip ? "md:flex-row-reverse" : ""}`}
              >
                {/* 视频大图 / 点击播放真视频（序号不再压在视频上） */}
                <div className="w-full shrink-0 md:w-[280px]">
                  <div
                    className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5"
                    onClick={() => setPlaying(isPlaying ? null : v.id)}
                  >
                    {isPlaying ? (
                      <iframe src={`https://www.tiktok.com/embed/v2/${v.id}`} className="h-full w-full" allow="encrypted-media; autoplay" title={v.id} />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/covers/${v.id}.jpg`} alt={v.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
                            <span className="ml-0.5 text-xl">▶</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 为什么火 —— 大序号在画布上 + 突出作者/点赞 */}
                <div className="flex-1">
                  <div className="flex items-start gap-5">
                    <span className="select-none text-6xl font-extralight leading-none tabular-nums text-foreground/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="pt-1">
                      <p className="text-xl font-semibold tracking-tight text-foreground">{v.author}</p>
                      <p className="mt-1.5 flex items-center gap-4 text-sm">
                        <span className="font-semibold text-rose-500">♥ {fmt(v.likes)}</span>
                        <span className="text-muted-foreground">▶ {fmt(v.vv)} 播放</span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-foreground">{v.whyViral.oneLine}</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground line-clamp-2">{v.caption}</p>

                  <dl className="mt-7 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                    {[
                      ["钩子", v.whyViral.hook],
                      ["梗 / 玩法", v.whyViral.meme],
                      ["音乐", v.whyViral.music],
                      ["节奏", v.whyViral.pacing],
                    ].map(([k, val]) => (
                      <div key={k}>
                        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k}</dt>
                        <dd className="mt-1 text-[15px] leading-relaxed text-foreground/90">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
