"use client";

// 第一屏「驾驶舱/星图」原型 v2（presentation-only）。
// 构图 D：五个品类聚成星系团、环形排布、机位拉远看全景。
// 质感 A：程序化主题星球贴图 + 大气层辉光 + 真实光照 + bloom + 海量星尘 + 星云雾。
// 镜头可自由飞行（OrbitControls 阻尼 + 回正 + 锁定逼近），无声音。

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Billboard, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  CATEGORIES,
  CAT_ORDER,
  PLANETS,
  TOP_INTEL,
  clusterCenter,
  planetPosition,
  planetScale,
  planetLogo,
  seedOf,
  type CategoryKey,
  type Planet,
} from "./cockpit-data";
import { generatePlanetTexture } from "./planet-texture";
import { resolveGame } from "@/lib/games";
import gsap from "gsap";
import { CONTENT } from "./content-registry";
import { ContentHolo, DiagnosisHolo, RadarHolo } from "./cockpit-holo";
import type { DiagnosisDocument } from "@/app/diagnosis/diagnosisData";
import type { RadarDatabaseSnapshot, TodaySummaryStats } from "@/app/radar/database";

type CockpitMode = "content" | "diagnosis";
const RADAR_ACCENT = "#39c6e6";

const DEFAULT_CAM = new THREE.Vector3(0, 14, 52);

function useLogoTexture(url?: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) {
      setTex(null);
      return;
    }
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

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function Nebula({ position, color, glow }: { position: [number, number, number]; color: string; glow: THREE.Texture }) {
  return (
    <sprite position={position} scale={[15, 15, 1]}>
      <spriteMaterial map={glow} color={color} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

function PlanetView({
  planet,
  selected,
  glow,
  onSelect,
  onHover,
}: {
  planet: Planet;
  selected: boolean;
  glow: THREE.Texture;
  onSelect: (p: Planet) => void;
  onHover: (p: Planet | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const pos = useMemo(() => planetPosition(planet), [planet]);
  const scale = planetScale(planet);
  const active = hovered || selected;
  const catColor = CATEGORIES[planet.category].color;
  const logo = useLogoTexture(planetLogo(planet));

  const { map, emissiveMap, emissive, emissiveIntensity, roughness, metalness } = useMemo(() => {
    const gen = generatePlanetTexture(planet.theme, seedOf(planet.id));
    const map = new THREE.CanvasTexture(gen.map);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    const emissiveMap = gen.emissiveMap ? new THREE.CanvasTexture(gen.emissiveMap) : null;
    return {
      map,
      emissiveMap,
      emissive: gen.spec.emissive ?? "#000000",
      emissiveIntensity: gen.spec.emissiveIntensity ?? 0,
      roughness: gen.spec.roughness ?? 0.8,
      metalness: gen.spec.metalness ?? 0.1,
    };
  }, [planet.id, planet.theme]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.12;
    if (planet.hot && ringRef.current) ringRef.current.rotation.z += dt * 0.5;
  });

  return (
    <group position={pos}>
      {/* 星球本体 */}
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(planet);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planet);
        }}
      >
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          map={map}
          emissiveMap={emissiveMap ?? undefined}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={active ? emissiveIntensity * 1.5 + 0.2 : emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* 大气层辉光（背面壳） */}
      <mesh scale={scale * 1.22}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={catColor} transparent opacity={active ? 0.28 : 0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 选中/锁定光圈 */}
      <sprite scale={[scale * 4.2, scale * 4.2, 1]}>
        <spriteMaterial map={glow} color={catColor} transparent opacity={active ? 0.5 : 0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* 大动作脉冲环 */}
      {planet.hot && (
        <mesh ref={ringRef} scale={scale * 1.7} rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[1.1, 1.22, 64]} />
          <meshBasicMaterial color={catColor} transparent opacity={active ? 0.85 : 0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {/* 有 logo 的星球：始终贴官方图标圆盘（正面）。无 logo 的靠主题贴图 + hover 显名。 */}
      {logo && (
        <Billboard>
          <group position={[0, 0, scale * 1.05]}>
            <mesh scale={scale * 1.2}>
              <circleGeometry args={[1, 64]} />
              <meshBasicMaterial map={logo} toneMapped={false} />
            </mesh>
            <mesh scale={scale * 1.2}>
              <ringGeometry args={[1.0, 1.07, 64]} />
              <meshBasicMaterial color={catColor} transparent opacity={active ? 0.85 : 0.45} depthWrite={false} />
            </mesh>
          </group>
        </Billboard>
      )}

      {/* hover/选中 → 名字 + 微提案卡 */}
      {active && (
        <Html center position={[0, scale + 1.0, 0]} distanceFactor={12} zIndexRange={[40, 20]}>
          <div className="pointer-events-none -translate-y-1/2 whitespace-nowrap rounded-md border border-white/15 bg-black/80 px-2.5 py-1.5 text-center backdrop-blur">
            <div className="text-xs font-semibold text-white">{planet.name}</div>
            <div className="mt-0.5 text-[10px] text-white/60">{planet.vendor} · {CATEGORIES[planet.category].label}</div>
            {planet.hook && <div className="mt-0.5 text-[10px] text-white/80">{planet.hook}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function FocusController({
  selected,
  controls,
}: {
  selected: Planet | null;
  controls: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const tween = useRef<{
    active: boolean;
    t: number;
    fromCam: THREE.Vector3;
    toCam: THREE.Vector3;
    fromTgt: THREE.Vector3;
    toTgt: THREE.Vector3;
  } | null>(null);

  useEffect(() => {
    const ctrl = controls.current;
    if (!ctrl) return;
    const fromCam = camera.position.clone();
    const fromTgt = ctrl.target.clone();
    let toCam: THREE.Vector3;
    let toTgt: THREE.Vector3;

    if (selected) {
      const p = new THREE.Vector3(...planetPosition(selected));
      const dist = planetScale(selected) * 5 + 3.5;
      const dir = fromCam.clone().sub(p).normalize();
      toCam = p.clone().add(dir.multiplyScalar(dist));
      toTgt = p;
    } else {
      toTgt = new THREE.Vector3(0, 0, 0);
      toCam = camera.position.clone().normalize().multiplyScalar(DEFAULT_CAM.length());
      if (!isFinite(toCam.x)) toCam = DEFAULT_CAM.clone();
    }

    tween.current = { active: true, t: 0, fromCam, toCam, fromTgt, toTgt };
    ctrl.enabled = false;
    ctrl.autoRotate = false;
  }, [selected, camera, controls]);

  useFrame((_, dt) => {
    const tw = tween.current;
    const ctrl = controls.current;
    if (!tw || !tw.active || !ctrl) return;
    tw.t = Math.min(1, tw.t + dt / 0.85);
    const e = easeInOutCubic(tw.t);
    camera.position.lerpVectors(tw.fromCam, tw.toCam, e);
    ctrl.target.lerpVectors(tw.fromTgt, tw.toTgt, e);
    ctrl.update();
    if (tw.t >= 1) {
      tw.active = false;
      ctrl.enabled = true;
      ctrl.autoRotate = !selected;
    }
  });

  return null;
}

function SceneContents({
  selected,
  onSelect,
  onHover,
  controls,
}: {
  selected: Planet | null;
  onSelect: (p: Planet) => void;
  onHover: (p: Planet | null) => void;
  controls: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const glow = useMemo(() => makeGlowTexture(), []);

  return (
    <>
      {/* 飞船外 = 纯 3D 星海（星球原生融合），座舱罩由前景视频提供 */}
      <color attach="background" args={["#04050d"]} />
      <fog attach="fog" args={["#070a16", 60, 130]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[14, 24, 18]} intensity={1.3} color="#cdd8ff" />
      <directionalLight position={[-18, -6, -12]} intensity={0.45} color="#ff77aa" />
      <hemisphereLight args={["#6a7bff", "#120a20", 0.5]} />

      <Stars radius={200} depth={100} count={14000} factor={4.5} saturation={0} fade speed={0.35} />

      {CAT_ORDER.map((cat: CategoryKey) => (
        <Nebula key={cat} position={clusterCenter(cat)} color={CATEGORIES[cat].color} glow={glow} />
      ))}

      {PLANETS.map((p) => (
        <PlanetView key={p.id} planet={p} selected={selected?.id === p.id} glow={glow} onSelect={onSelect} onHover={onHover} />
      ))}

      <OrbitControls
        ref={controls as React.MutableRefObject<OrbitControlsImpl>}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={5}
        maxDistance={72}
        maxPolarAngle={Math.PI * 0.92}
        autoRotate
        autoRotateSpeed={0.14}
      />

      <FocusController selected={selected} controls={controls} />

      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.45} luminanceSmoothing={0.9} mipmapBlur radius={0.6} />
      </EffectComposer>
    </>
  );
}

export function CockpitScene({
  diagnosisDocs = {},
  radarSnapshot = null,
  radarSummary = null,
}: {
  diagnosisDocs?: Record<string, DiagnosisDocument>;
  radarSnapshot?: RadarDatabaseSnapshot | null;
  radarSummary?: TodaySummaryStats | null;
}) {
  const [selected, setSelected] = useState<Planet | null>(null);
  const [, setHovered] = useState<Planet | null>(null);
  const [query, setQuery] = useState("");
  // progress: 0 = 舷窗看星海, 1 = 全息页（内容洞察 / 经营诊断 / 情报雷达）。GSAP 驱动座舱显形缓动。
  const [progress, setProgress] = useState(0);
  const [activeGame, setActiveGame] = useState<Planet | null>(null);
  const [mode, setMode] = useState<CockpitMode>("content");
  const [radarOpen, setRadarOpen] = useState(false);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const canopyRef = useRef<HTMLVideoElement | null>(null);
  const tweenObj = useRef({ v: 0 });

  function warp() {
    const q = query.trim();
    if (!q) return;
    const game = resolveGame(q);
    const planet = PLANETS.find((p) => p.id === game?.id || p.name === q);
    if (planet) setSelected(planet);
  }

  // 进入全息页：播放视频后段 → 座舱罩显形（= 转场），星球淡出，全息页大面积铺开。
  function enter(targetMode: CockpitMode) {
    if (!selected) return;
    setMode(targetMode);
    setActiveGame(selected);
    const v = canopyRef.current;
    if (v) {
      v.currentTime = 0.6;
      v.playbackRate = 2.2;
      v.play().catch(() => {});
    }
    gsap.killTweensOf(tweenObj.current);
    gsap.to(tweenObj.current, {
      v: 1,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => setProgress(tweenObj.current.v),
    });
  }

  // 已在座舱内：内容洞察 ↔ 经营诊断 互切（不退舷窗，全息页淡入重演入场动画）。
  function switchTo(targetMode: CockpitMode) {
    setMode(targetMode);
  }

  // 情报雷达 learn more：同一套座舱显形转场 → 铺开完整情报雷达全息页（与星球无关，全局入口）。
  function enterRadar() {
    setRadarOpen(true);
    const v = canopyRef.current;
    if (v) {
      v.currentTime = 0.6;
      v.playbackRate = 2.2;
      v.play().catch(() => {});
    }
    gsap.killTweensOf(tweenObj.current);
    gsap.to(tweenObj.current, {
      v: 1,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => setProgress(tweenObj.current.v),
    });
  }

  // 回概览：星球淡入、全息页淡出、座舱罩淡隐，视频退回「开阔太空」帧。
  function close() {
    gsap.killTweensOf(tweenObj.current);
    gsap.to(tweenObj.current, {
      v: 0,
      duration: 1.0,
      ease: "power2.inOut",
      onUpdate: () => setProgress(tweenObj.current.v),
      onComplete: () => {
        const v = canopyRef.current;
        if (v) {
          v.pause();
          v.playbackRate = 1;
          v.currentTime = 0.6;
        }
        setActiveGame(null);
        setRadarOpen(false);
      },
    });
  }

  // 挡风玻璃固定抠透明（星球透过窗口可见）；座舱罩在视频里，随播放显形。
  const maskImage = "radial-gradient(ellipse 66% 44% at 50% 37%, transparent 46%, rgba(0,0,0,0.9) 74%, black 90%)";
  const activeAccent = activeGame ? CATEGORIES[activeGame.category].color : "#39c6e6";
  const activeContent = activeGame ? CONTENT[activeGame.id] ?? null : null;
  const activeDoc = activeGame ? diagnosisDocs[activeGame.id] ?? null : null;

  return (
    <div className="fixed inset-0 z-0">
      <div className="relative h-full w-full overflow-hidden bg-[#04050d]">
          {/* 底层：纯 3D 星海（星球原生融合）。下移到仪表盘时星球淡出后退。 */}
          <Canvas
            className="absolute inset-0"
            camera={{ position: [0, 14, 52], fov: 55 }}
            onPointerMissed={() => setSelected(null)}
            dpr={[1, 2]}
            style={{ opacity: 1 - progress * 0.85, pointerEvents: progress > 0.4 ? "none" : "auto" }}
          >
            <SceneContents selected={selected} onSelect={setSelected} onHover={setHovered} controls={controls} />
          </Canvas>

          {/* 前景：座舱罩视频。概览态停在前 1s「无舷窗的开阔太空」帧、几乎透明，
              让星球铺满主导画面；点内容洞察才向后播放，座舱罩 + 仪表盘逐渐显形。 */}
          <video
            ref={canopyRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            src="/cockpit-canopy.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={(e) => {
              // 转场播完保持在最后一帧（完整座舱 + 仪表盘）；回概览时再 seek 回 0.6
              const v = e.currentTarget;
              v.pause();
              v.currentTime = Math.max(0, v.duration - 0.05);
            }}
            onLoadedData={(e) => {
              // 先 play 一拍把解码器喂起来（避免纯暂停视频不绘制），再回落到
              // 「开阔太空」帧（前 1s 无舷窗）暂停，作为屏 1 概览背景。
              const v = e.currentTarget;
              v.play()
                .then(() => {
                  v.pause();
                  v.currentTime = 0.6;
                })
                .catch(() => {
                  v.currentTime = 0.6;
                });
            }}
            style={{
              WebkitMaskImage: maskImage,
              maskImage,
              // 概览态视频淡到很弱（星球主导），详情态实体化（座舱罩落定）
              opacity: 0.22 + progress * 0.78,
            }}
          />

          {/* 全息页（座舱显形后大面积铺开）：随 progress 淡入 */}
          {progress > 0.02 && (radarOpen || activeGame) && (
            <div
              className="absolute inset-0"
              style={{ opacity: progress, pointerEvents: progress > 0.6 ? "auto" : "none" }}
            >
              {radarOpen ? (
                <RadarHolo
                  key="radar"
                  snapshot={radarSnapshot}
                  summary={radarSummary}
                  accent={RADAR_ACCENT}
                  onClose={close}
                />
              ) : mode === "content" ? (
                <ContentHolo
                  key={`content-${activeGame!.id}`}
                  data={activeContent}
                  accent={activeAccent}
                  gameName={activeGame!.name}
                  vendor={activeGame!.vendor}
                  category={CATEGORIES[activeGame!.category].label}
                  onClose={close}
                  onDiagnosis={() => switchTo("diagnosis")}
                />
              ) : (
                <DiagnosisHolo
                  key={`diag-${activeGame!.id}`}
                  doc={activeDoc}
                  gameId={activeGame!.id}
                  accent={activeAccent}
                  gameName={activeGame!.name}
                  onClose={close}
                  onContent={() => switchTo("content")}
                />
              )}
            </div>
          )}

          {/* ===== DOM HUD 叠层（星图态，下移时淡出） ===== */}
          <div
            className="pointer-events-none absolute inset-0 select-none"
            style={{ opacity: 1 - progress, pointerEvents: progress > 0.4 ? "none" : undefined }}
          >
            {/* 左上 标题 */}
            <div className="absolute left-6 top-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">Stellar Cartography</div>
              <div className="mt-1 text-sm font-semibold text-white/90">情报雷达 · 我该关注谁</div>
            </div>

            {/* 右上 品类星云图例 */}
            <div className="absolute right-6 top-5 flex flex-col items-end gap-1.5">
              {CAT_ORDER.map((cat) => (
                <div key={cat} className="flex items-center gap-2 text-[11px] text-white/70">
                  <span>{CATEGORIES[cat].label}</span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORIES[cat].color, boxShadow: `0 0 8px ${CATEGORIES[cat].color}` }} />
                </div>
              ))}
            </div>

            {/* 右侧 情报推送 Top5 */}
            <div className="pointer-events-auto absolute right-6 top-36 w-72 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">情报推送 · Top 5</span>
              </div>
              <div className="space-y-1.5">
                {TOP_INTEL.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => {
                      const planet = PLANETS.find((p) => p.id === item.id);
                      if (planet) setSelected(planet);
                    }}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80">{item.tag}</span>
                    <span className="text-xs leading-snug text-white/85">{item.text}</span>
                  </button>
                ))}
              </div>
              {/* learn more → 完整情报雷达全息页 */}
              <button
                onClick={enterRadar}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/10"
                style={{ borderColor: `${RADAR_ACCENT}55`, color: RADAR_ACCENT }}
              >
                查看完整情报雷达 →
              </button>
            </div>

            {/* 右下 回正 */}
            <button
              onClick={() => setSelected(null)}
              className="pointer-events-auto absolute bottom-6 right-6 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs text-white/80 backdrop-blur transition-colors hover:bg-white/10"
            >
              ⟲ 回正视角
            </button>

            {/* 底部中央 曲速输入器 */}
            <div className="pointer-events-auto absolute bottom-6 left-1/2 flex w-[min(560px,72%)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/50 px-2 py-2 backdrop-blur">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && warp()}
                placeholder="请输入你想探索的游戏"
                className="flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button onClick={warp} className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90">
                直达 →
              </button>
            </div>

            {/* 选中 → 目标锁定详情卡 */}
            {selected && (
              <div className="pointer-events-auto absolute bottom-24 left-1/2 w-[min(420px,86%)] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/70 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-300/90">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
                  Target Lock · 目标锁定
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xl font-bold text-white">
                      <span>{selected.glyph}</span>
                      {selected.name}
                    </div>
                    <div className="mt-0.5 text-xs text-white/60">{selected.vendor} · {CATEGORIES[selected.category].label}</div>
                  </div>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORIES[selected.category].color, boxShadow: `0 0 10px ${CATEGORIES[selected.category].color}` }} />
                </div>
                {selected.hook && <div className="mt-2 text-xs text-white/75">{selected.hook}</div>}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => enter("content")} className="rounded-lg bg-white/10 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/20">
                    内容洞察 ↓
                  </button>
                  <button onClick={() => enter("diagnosis")} className="rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-black transition-opacity hover:opacity-90">
                    经营诊断 →
                  </button>
                </div>
              </div>
            )}

            {/* 左下 提示 */}
            <div className="absolute bottom-6 left-6 text-[11px] text-white/40">拖拽飞行 · 滚轮缩放 · 点击星球锁定 · 点空白处取消</div>
          </div>

          {/* 不显眼入口：切回朴素(导航栏)版 */}
          <a
            href="/classic"
            className="absolute right-4 top-3 z-50 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] text-white/30 backdrop-blur transition-colors hover:border-white/30 hover:text-white/70"
          >
            经典视图 ↗
          </a>
        </div>
      </div>
  );
}
