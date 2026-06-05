// app/cockpit/planet-texture.ts —— 程序化「主题星球」贴图生成（presentation-only）
// 按游戏调性给每颗星球生成 canvas 贴图（颜色 map + 可选自发光 emissiveMap），
// 在真实光照 + bloom 下产生体积感。没有真实 logo 时的高级回退方案。
// 之后若 public/planets/<id>.png 提供了官方 logo，可在 scene 里优先贴 logo。

export type Pattern = "lava" | "voxel" | "studs" | "ink" | "gold" | "arcane" | "rocky" | "ice";

export type ThemeSpec = {
  pattern: Pattern;
  base: string;
  accents: string[];
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
};

export const THEMES: Record<string, ThemeSpec> = {
  lava: { pattern: "lava", base: "#180806", accents: ["#ff5a1f", "#ff8a3d", "#ffd24a"], emissive: "#ff4d12", emissiveIntensity: 1.5, roughness: 0.7, metalness: 0.1 },
  voxel: { pattern: "voxel", base: "#2f5a26", accents: ["#4f8a3a", "#6fae4d", "#8a5a3c", "#79502f", "#3c6b30"], roughness: 1, metalness: 0 },
  studs: { pattern: "studs", base: "#c23838", accents: ["#3aa0ff", "#ffd23a", "#39d98a", "#ff6fae", "#ffffff"], roughness: 0.6, metalness: 0.1 },
  ink: { pattern: "ink", base: "#0d2826", accents: ["#1f6b5e", "#3aa890", "#bfe9dd"], emissive: "#1f8f78", emissiveIntensity: 0.45, roughness: 0.8, metalness: 0.1 },
  gold: { pattern: "gold", base: "#191307", accents: ["#d4a23a", "#f5d27a", "#7a5a1f"], emissive: "#caa23a", emissiveIntensity: 0.7, roughness: 0.5, metalness: 0.45 },
  arcane: { pattern: "arcane", base: "#150a28", accents: ["#7b4bff", "#b07bff", "#39c6e6", "#ff5ad6"], emissive: "#7b4bff", emissiveIntensity: 0.85, roughness: 0.6, metalness: 0.2 },
  rocky: { pattern: "rocky", base: "#39342d", accents: ["#5a5046", "#6e6356", "#8a7a66", "#2c2822"], roughness: 0.95, metalness: 0.15 },
  ice: { pattern: "ice", base: "#0c1830", accents: ["#3a6bd6", "#7ab0ff", "#cfe6ff", "#9fd0ff"], emissive: "#5a8aff", emissiveIntensity: 0.4, roughness: 0.35, metalness: 0.3 },
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE = 512;

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

export type GeneratedTexture = {
  map: HTMLCanvasElement;
  emissiveMap: HTMLCanvasElement | null;
  spec: ThemeSpec;
};

/** 生成一颗星球的贴图。seed 来自 gameId，保证同一游戏每次一致。 */
export function generatePlanetTexture(themeKey: string, seed: number): GeneratedTexture {
  const spec = THEMES[themeKey] ?? THEMES.rocky;
  const r = mulberry32(seed);

  const map = document.createElement("canvas");
  map.width = map.height = SIZE;
  const ctx = map.getContext("2d")!;
  ctx.fillStyle = spec.base;
  ctx.fillRect(0, 0, SIZE, SIZE);

  let emissiveMap: HTMLCanvasElement | null = null;
  let ectx: CanvasRenderingContext2D | null = null;
  if (spec.emissive) {
    emissiveMap = document.createElement("canvas");
    emissiveMap.width = emissiveMap.height = SIZE;
    ectx = emissiveMap.getContext("2d")!;
    ectx.fillStyle = "#000";
    ectx.fillRect(0, 0, SIZE, SIZE);
  }

  const drawVein = (c: CanvasRenderingContext2D, color: string, width: number) => {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineCap = "round";
    c.beginPath();
    let x = r() * SIZE;
    let y = r() * SIZE;
    c.moveTo(x, y);
    const segs = 4 + Math.floor(r() * 5);
    for (let i = 0; i < segs; i++) {
      x += (r() - 0.5) * 160;
      y += (r() - 0.5) * 120;
      c.lineTo(x, y);
    }
    c.stroke();
  };

  switch (spec.pattern) {
    case "lava": {
      for (let i = 0; i < 26; i++) {
        const color = pick(spec.accents, r);
        const w = 2 + r() * 6;
        drawVein(ctx, color, w);
        if (ectx) drawVein(ectx, color, w);
      }
      // 暗色岩壳斑块
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.ellipse(r() * SIZE, r() * SIZE, 8 + r() * 30, 8 + r() * 24, r() * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "voxel":
    case "studs": {
      const cells = 16;
      const cs = SIZE / cells;
      for (let gx = 0; gx < cells; gx++) {
        for (let gy = 0; gy < cells; gy++) {
          ctx.fillStyle = pick(spec.accents, r);
          ctx.globalAlpha = 0.85 + r() * 0.15;
          ctx.fillRect(gx * cs, gy * cs, cs + 1, cs + 1);
          ctx.globalAlpha = 1;
          if (spec.pattern === "studs") {
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.beginPath();
            ctx.arc(gx * cs + cs / 2, gy * cs + cs / 2, cs * 0.22, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      break;
    }
    case "ink": {
      for (let i = 0; i < 22; i++) {
        const color = pick(spec.accents, r);
        const cx = r() * SIZE;
        const cy = r() * SIZE;
        const rad = 30 + r() * 120;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.25 + r() * 0.3;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      break;
    }
    case "gold": {
      // 从底部向上分叉的金色枝条
      const branch = (c: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, depth: number) => {
        if (depth <= 0 || len < 6) return;
        const nx = x + Math.cos(ang) * len;
        const ny = y + Math.sin(ang) * len;
        c.strokeStyle = pick(spec.accents, r);
        c.lineWidth = depth;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(nx, ny);
        c.stroke();
        branch(c, nx, ny, ang - 0.4 + r() * 0.2, len * 0.72, depth - 1);
        branch(c, nx, ny, ang + 0.4 - r() * 0.2, len * 0.72, depth - 1);
      };
      for (let i = 0; i < 4; i++) {
        const x = SIZE * (0.2 + r() * 0.6);
        branch(ctx, x, SIZE, -Math.PI / 2 + (r() - 0.5) * 0.4, 70 + r() * 40, 5);
        if (ectx) branch(ectx, x, SIZE, -Math.PI / 2 + (r() - 0.5) * 0.4, 70 + r() * 40, 5);
      }
      break;
    }
    case "arcane": {
      for (let i = 0; i < 18; i++) {
        const color = pick(spec.accents, r);
        const cx = r() * SIZE;
        const cy = r() * SIZE;
        const rad = 20 + r() * 90;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        if (ectx) {
          ectx.fillStyle = g;
          ectx.globalAlpha = 0.6;
          ectx.beginPath();
          ectx.arc(cx, cy, rad, 0, Math.PI * 2);
          ectx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // 星点
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 120; i++) {
        ctx.globalAlpha = r();
        ctx.fillRect(r() * SIZE, r() * SIZE, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "ice": {
      for (let i = 0; i < 30; i++) {
        const color = pick(spec.accents, r);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 + r() * 2.5;
        ctx.beginPath();
        const x = r() * SIZE;
        const y = r() * SIZE;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 140, y + (r() - 0.5) * 140);
        ctx.stroke();
        if (ectx && r() > 0.5) {
          ectx.strokeStyle = color;
          ectx.lineWidth = 1.5;
          ectx.beginPath();
          ectx.moveTo(x, y);
          ectx.lineTo(x + (r() - 0.5) * 100, y + (r() - 0.5) * 100);
          ectx.stroke();
        }
      }
      break;
    }
    case "rocky":
    default: {
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = pick(spec.accents, r);
        ctx.globalAlpha = 0.4 + r() * 0.5;
        const x = r() * SIZE;
        const y = r() * SIZE;
        const rad = 2 + r() * 16;
        ctx.beginPath();
        ctx.ellipse(x, y, rad, rad * (0.6 + r() * 0.6), r() * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
  }

  return { map, emissiveMap, spec };
}
