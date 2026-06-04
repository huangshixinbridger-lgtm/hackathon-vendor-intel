"use client";
// app/content-radar/radar-view.tsx —— 内容雷达 · 编辑杂志风视图（Jeff）
// 极简留白 + 超大标题 + 视频大图 + 细线圆形气泡 + framer-motion 轻柔动效。
import { useState } from "react";
import { motion } from "framer-motion";
import type { ContentRadarDetail } from "@/types/contract.contentRadar";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function RadarView({ data }: { data: ContentRadarDetail }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const totalVV = data.topVideos.reduce((s, v) => s + v.vv, 0);

  return (
    <div className="mx-auto max-w-5xl px-2 pb-32">
      {/* Hero */}
      <motion.header
        initial="hidden" animate="show" variants={fadeUp}
        className="pt-10 pb-20"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          内容雷达 · TikTok 内容生态
        </p>
        <h1 className="mt-4 text-6xl font-bold tracking-tight sm:text-7xl">{data.gameName}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          这款游戏在 TikTok 上靠什么内容活着 —— {fmt(totalVV)} 播放背后的内容语言，
          以及每条爆款<span className="text-foreground">为什么火</span>。
        </p>
      </motion.header>

      {/* 内容类型 · 细线圆形气泡 */}
      <section className="mb-28">
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}
          className="mb-12 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          内容类型 · 按播放占比
        </motion.h2>
        <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-10">
          {data.contentTypes.map((t, i) => {
            const d = 88 + t.vvShare * 460; // 直径 ~125–190px
            const lead = t.vvShare === Math.max(...data.contentTypes.map((x) => x.vvShare));
            return (
              <motion.div
                key={t.tag}
                custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
                title={t.note}
              >
                <div
                  className={`flex items-center justify-center rounded-full border text-center transition-colors ${
                    t.isGap ? "border-destructive/60" : lead ? "border-foreground/50" : "border-foreground/15"
                  }`}
                  style={{ width: d, height: d }}
                >
                  <span className="text-2xl font-light tabular-nums">{Math.round(t.vvShare * 100)}<span className="text-sm align-top text-muted-foreground">%</span></span>
                </div>
                <span className="mt-3 max-w-[7rem] text-center text-sm leading-tight text-foreground/80">{t.tag}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Top 内容 · 为什么火 —— 编辑式大图 + 交替排版 */}
      <section>
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}
          className="mb-14 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Top 内容 · 为什么火
        </motion.h2>

        <div className="space-y-28">
          {data.topVideos.map((v, i) => {
            const isPlaying = playing === v.id;
            const flip = i % 2 === 1;
            return (
              <motion.article
                key={v.id}
                initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                className={`flex flex-col gap-8 md:flex-row md:items-center ${flip ? "md:flex-row-reverse" : ""}`}
              >
                {/* 视频大图 / 点击播放真视频 */}
                <div className="w-full shrink-0 md:w-[300px]">
                  <div
                    className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl bg-muted"
                    onClick={() => setPlaying(isPlaying ? null : v.id)}
                  >
                    {isPlaying ? (
                      <iframe
                        src={`https://www.tiktok.com/embed/v2/${v.id}`}
                        className="h-full w-full" allow="encrypted-media; autoplay"
                        title={v.id}
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/covers/${v.id}.jpg`} alt={v.caption}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
                            <span className="ml-0.5 text-xl">▶</span>
                          </div>
                        </div>
                        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                          #{i + 1} · {fmt(v.vv)} 播放
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 为什么火 */}
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.author}　·　{fmt(v.likes)} 赞</p>
                  <p className="mt-3 text-2xl font-semibold leading-snug tracking-tight">{v.whyViral.oneLine}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{v.caption}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    {[
                      ["钩子", v.whyViral.hook],
                      ["梗 / 玩法", v.whyViral.meme],
                      ["音乐", v.whyViral.music],
                      ["节奏", v.whyViral.pacing],
                    ].map(([k, val]) => (
                      <div key={k}>
                        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                        <dd className="mt-0.5 text-foreground/85">{val}</dd>
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
