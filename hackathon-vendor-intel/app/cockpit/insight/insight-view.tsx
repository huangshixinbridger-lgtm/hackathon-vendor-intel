"use client";

// 第二屏「行星扫描 / 内容洞察」原型（presentation-only）。
// 上半：3D —— 选中星球居中，内容类型化作绕行星运转的卫星（大小=播放占比），雷达扫描扫一圈。
// 下半：Top 视频网格（真实数据 whyViral）+ 内容类型条，太空主题换皮。
// 奢华度 ~60%：奇观在扫描与卫星，工作在下方可读网格。

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Html, OrbitControls, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { ContentRadarDetail, ContentTypeBubble, VideoInsight } from "@/types/contract.contentRadar";
import { PLANETS, CATEGORIES } from "../cockpit-data";
import { generatePlanetTexture } from "../planet-texture";
import { seedOf } from "../cockpit-data";

function fmtVV(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)} 亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)} 万`;
  return `${n}`;
}

function useLogoTexture(url?: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      if (!cancelled) setTex(t);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return tex;
}

function CentralPlanet({ gameId, accent }: { gameId: string; accent: string }) {
  const meta = PLANETS.find((p) => p.id === gameId);
  const meshRef = useRef<THREE.Mesh>(null!);
  const logo = useLogoTexture(meta?.logoUrl);
  const scale = 1.9;

  const gen = useMemo(() => generatePlanetTexture(meta?.theme ?? "rocky", seedOf(gameId)), [meta?.theme, gameId]);
  const map = useMemo(() => {
    const t = new THREE.CanvasTexture(gen.map);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [gen]);
  const emissiveMap = useMemo(() => (gen.emissiveMap ? new THREE.CanvasTexture(gen.emissiveMap) : null), [gen]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.1;
  });

  return (
    <group>
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          map={map}
          emissiveMap={emissiveMap ?? undefined}
          emissive={new THREE.Color(gen.spec.emissive ?? "#000000")}
          emissiveIntensity={gen.spec.emissiveIntensity ?? 0}
          roughness={gen.spec.roughness ?? 0.8}
          metalness={gen.spec.metalness ?? 0.1}
        />
      </mesh>
      {/* 大气层 */}
      <mesh scale={scale * 1.18}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.18} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* logo 圆盘 */}
      {logo && (
        <Billboard>
          <group position={[0, 0, scale * 1.05]}>
            <mesh scale={scale * 1.05}>
              <circleGeometry args={[1, 64]} />
              <meshBasicMaterial map={logo} toneMapped={false} />
            </mesh>
            <mesh scale={scale * 1.05}>
              <ringGeometry args={[1.0, 1.05, 64]} />
              <meshBasicMaterial color={accent} transparent opacity={0.6} depthWrite={false} />
            </mesh>
          </group>
        </Billboard>
      )}
    </group>
  );
}

function ScanSweep({ accent }: { accent: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame((state) => {
    const t = (state.clock.elapsedTime % 3) / 3;
    const s = 2 + t * 6;
    if (ref.current) ref.current.scale.set(s, s, s);
    if (mat.current) mat.current.opacity = (1 - t) * 0.5;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.96, 1, 96]} />
      <meshBasicMaterial ref={mat} color={accent} transparent blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Satellites({
  types,
  accent,
  activeTag,
  onPick,
}: {
  types: ContentTypeBubble[];
  accent: string;
  activeTag: string | null;
  onPick: (tag: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.18;
  });
  const n = types.length;
  return (
    <group ref={groupRef}>
      {types.map((t, i) => {
        const angle = (i / n) * Math.PI * 2;
        const radius = 4.2 + (i % 2) * 0.9;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 1.3) * 0.7;
        const size = 0.26 + t.vvShare * 1.7;
        const isActive = activeTag === t.tag;
        return (
          <group key={t.tag} position={[x, y, z]}>
            <mesh
              scale={size}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => (document.body.style.cursor = "auto")}
              onClick={(e) => {
                e.stopPropagation();
                onPick(isActive ? null : t.tag);
              }}
            >
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial
                color={accent}
                emissive={new THREE.Color(accent)}
                emissiveIntensity={isActive ? 1.4 : t.isGap ? 0.1 : 0.5}
                wireframe={t.isGap}
                roughness={0.5}
                metalness={0.2}
              />
            </mesh>
            <Html center position={[0, size + 0.5, 0]} distanceFactor={11} zIndexRange={[20, 0]}>
              <div className={`pointer-events-none -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-center text-[10px] ${isActive ? "bg-white text-black" : "bg-black/70 text-white/85"}`}>
                <span className="font-medium">{t.tag}</span>
                <span className="ml-1 opacity-70">{Math.round(t.vvShare * 100)}%</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function InsightView({ data, gameId }: { data: ContentRadarDetail | null; gameId: string }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const meta = PLANETS.find((p) => p.id === gameId);
  const accent = meta ? CATEGORIES[meta.category].color : "#7b9cff";

  if (!data) {
    return (
      <div className="space-y-3">
        <Link href="/cockpit" className="text-sm text-muted-foreground hover:text-foreground">← 回星图</Link>
        <div className="rounded-2xl border bg-[#05060f] p-16 text-center text-white/60">
          内容雷达暂无「{meta?.name ?? gameId}」的数据。试试 Free Fire / Mobile Legends / Roblox / Minecraft。
        </div>
      </div>
    );
  }

  const totalVV = data.topVideos.reduce((s, v) => s + v.vv, 0);
  const activeIds = activeTag ? new Set(data.contentTypes.find((t) => t.tag === activeTag)?.exampleVideoIds ?? []) : null;
  const videos: VideoInsight[] = [...data.topVideos].sort((a, b) => b.vv - a.vv);

  return (
    <div className="space-y-6">
      {/* ===== 上半：3D 扫描 ===== */}
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <div className="relative h-[56vh] w-full overflow-hidden border-y border-white/10 bg-[#04050d]">
          <Canvas camera={{ position: [0, 1.6, 9.5], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={["#04050d"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[6, 8, 8]} intensity={1.6} color="#cdd8ff" />
            <pointLight position={[-8, -4, -6]} intensity={0.4} color={accent} />
            <Stars radius={80} depth={50} count={4000} factor={4} saturation={0} fade speed={0.3} />
            <CentralPlanet gameId={gameId} accent={accent} />
            <ScanSweep accent={accent} />
            <Satellites types={data.contentTypes} accent={accent} activeTag={activeTag} onPick={setActiveTag} />
            <OrbitControls enablePan={false} enableZoom minDistance={6} maxDistance={16} autoRotate autoRotateSpeed={0.2} maxPolarAngle={Math.PI * 0.9} />
            <EffectComposer>
              <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Canvas>

          {/* HUD */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-6 top-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">Surface Scan · 内容洞察</div>
              <h1 className="mt-1 text-3xl font-bold text-white">{data.gameName}</h1>
              <p className="mt-1 max-w-md text-sm text-white/60">在 TikTok 靠什么内容活着 —— {fmtVV(totalVV)} 播放背后的内容语言。点卫星按内容类型筛选下方视频。</p>
            </div>
            <Link href="/cockpit" className="pointer-events-auto absolute left-6 bottom-5 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs text-white/80 backdrop-blur transition-colors hover:bg-white/10">← 回星图</Link>
            <Link href={`/diagnosis?gameId=${gameId}`} className="pointer-events-auto absolute right-6 bottom-5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90">经营诊断 →</Link>
          </div>
        </div>
      </div>

      {/* ===== 下半：内容类型 + Top 视频 ===== */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">内容类型 · 按播放占比</span>
          {data.contentTypes.map((t) => (
            <button
              key={t.tag}
              onClick={() => setActiveTag(activeTag === t.tag ? null : t.tag)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${activeTag === t.tag ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50"}`}
            >
              {t.tag} · {Math.round(t.vvShare * 100)}%{t.isGap ? " ·缺口" : ""}
            </button>
          ))}
          {activeTag && (
            <button onClick={() => setActiveTag(null)} className="text-xs text-muted-foreground underline">清除筛选</button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const dimmed = activeIds ? !activeIds.has(v.id) : false;
            return (
              <a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className={`group flex flex-col overflow-hidden rounded-xl border bg-card transition-all ${dimmed ? "opacity-30" : "hover:shadow-md"}`}
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}22, #05060f)` }}>
                  {v.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.coverUrl} alt={v.author} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-white/15">#{i + 1}</span>
                  )}
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">#{i + 1}</span>
                  <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">▶ {fmtVV(v.vv)}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div className="text-xs font-medium text-muted-foreground line-clamp-1">{v.author}</div>
                  <div className="text-sm leading-snug text-foreground line-clamp-3">{v.whyViral.oneLine}</div>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1 text-[10px] text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5">❤ {fmtVV(v.likes)}</span>
                    {v.comments != null && <span className="rounded bg-muted px-1.5 py-0.5">💬 {fmtVV(v.comments)}</span>}
                    <span className="rounded px-1.5 py-0.5" style={{ background: `${accent}22`, color: accent }}>钩子：{v.whyViral.hook.slice(0, 14)}…</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
