# 联调与换皮说明（给重做前端的 agent / 士鑫）

> 由 Jeff 做完整体联调后输出。目的：让你用最小代价把"皮"换上去。
> 一句话：**5 个模块已经合到一起、能跑、能导航。你的任务是重做视觉层，不要碰数据和逻辑。**

## 0. TL;DR

- 全部模块已合进 `integration` 分支（已合并到 `main`），`npm run build` 通过，13 个路由都在。
- 串联的唯一 key 是 URL 的 `?gameId=`，所有模块页都读它。
- 换皮 = 只改**展示层**（globals.css 的 token、components/ui、各 page 的布局/className）。**别动**数据文件、types/contract*、api routes。

## 1. 现在能跑什么

| 路由 | 模块 | owner | 状态 |
|---|---|---|---|
| `/` | 首页（搜索 + 四模块导览） | 黄士鑫 | ✅ |
| `/radar` | ① 情报雷达 | Gardner | ✅ |
| `/content-radar` | ② 内容雷达 | Jeff | ✅ 真实数据 |
| `/diagnosis` | ③ 诊断报告 | Rena | ✅ 文档驱动 |
| `/gip` | ④ GIP 面板 | 白思宇 | ✅ |

- nav（`components/shell/nav.tsx`）和首页（`app/page.tsx`）已经含全部 4 个模块。
- `npm run build` 干净通过。

## 2. 串联契约：`gameId` 是唯一的钥匙

- 所有模块页都读 `searchParams.gameId`。
- 动线意图：首页搜索 → `/radar` 发现游戏 → 选中带 `?gameId=` → `/content-radar` → `/diagnosis` → `/gip`。
- 目前已接的跳转：`/content-radar` 页有「生成诊断报告 →」跳 `/diagnosis?gameId=`（示范）。
- 其余跨模块跳转待接（见 §5）。

## 3. 数据层 vs 展示层（换皮只动展示层）

| 模块 | 数据层（别动） | 展示层（在这换皮） |
|---|---|---|
| radar | `lib/mock.ts` (GameMove) | `app/radar/page.tsx` |
| content-radar | `lib/data.freefire.ts`、`lib/mock.contentRadar.ts`、`types/contract.contentRadar.ts` | `app/content-radar/page.tsx` + `radar-view.tsx` |
| diagnosis | `app/diagnosis/diagnosisData.ts`（读 md/pdf 文档） | `app/diagnosis/page.tsx` |
| gip | `app/gip/data.ts` | `app/gip/page.tsx` |
| 共享契约 | `types/contract.ts`（GameMove / DiagnosisReport / GIPRecord） | — |

## 4. 设计系统（换皮抓手）

- **颜色 / 圆角 / 间距的 token 全在 `app/globals.css` 的 CSS 变量 + `tailwind.config.ts`**。改主题就改这里，全站联动。
- 基础组件在 `components/ui/*`（shadcn）。
- **换皮原则**：用语义 token（`bg-card`、`text-muted-foreground`、`--accent`），别写死颜色（`bg-[#xxx]`）。这样改 token = 全站换肤，零返工。
- `content-radar` 页可作参考：已用 `framer-motion` 做动效 + 纯 CSS 漂浮气泡（Apple Music 风），编辑杂志风排版。

## 5. 已知缺口（需要团队/各 owner 补，不属于"换皮"）

1. ⚠️ **四模块的 demo 游戏 ID 不统一**：radar=`g-1001`、diagnosis=`nte`/`blood-strike`、gip=`yanyun`/`delta-force`…、content-radar=`freefire`。要做到"一个游戏从头跑到尾"，需各 owner 给**同一个 hero 游戏**（建议 Free Fire）各补一条 demo 数据。现状：跳转不崩，但每个模块各显示自己的 demo 游戏（gip / diagnosis 有兜底）。
2. **跨模块跳转**目前只接了 content-radar→diagnosis；radar→下游、diagnosis→gip 的 `?gameId=` 跳转待接（即 PRD 里的"游戏上下文条"）。
3. **搜索框**（`components/shell/search-box.tsx`）目前只 push 到 `/radar?q=`，没把 query 解析成 `gameId`。
4. content-radar 的 **TikTok embed 真视频加载偏慢**，封面 + 分析是稳的（embed 是点击封面后才挂载）。

## 6. 换皮 checklist（给前端 agent）

- ✅ 可以改：`app/globals.css`（token）、`components/ui/*`、各 `page.tsx` 的布局/className、`nav.tsx`/`layout.tsx` 的视觉、动效
- ❌ 不要改：`lib/data*`、`types/contract*`、各模块 data 文件里的**数据内容**、`api` routes 的逻辑
- 验证：`npm run build` 通过 + `npm run dev` 点一遍 nav 五个页都能渲染
