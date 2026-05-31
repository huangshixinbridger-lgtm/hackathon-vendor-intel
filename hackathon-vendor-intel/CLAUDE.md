# 厂商情报与运营台 — AI 编码统一规范

> 本文件与 `AGENTS.md` 内容**一字不差**。无论你用 Claude Code 还是 Codex，读的都是同一套规则，产出风格才一致、合并不打架。

## 这是什么
给 TikTok GIP「厂商运营」用的 Web 情报与运营台。输入一个游戏，能看它：最近有什么动作、在我们平台做得怎么样、GIP 花了多少钱。本期只做三块，**智能体是后续的事，本期不碰**。

## 技术栈（已定，不要换）
- Next.js 14 App Router + TypeScript
- Tailwind + shadcn/ui（组件已预置在 `components/ui/`）
- 数据：飞书多维表格 + Mock（本期 **Mock 优先**）
- LLM：Claude / GPT API，统一封装在 `lib/llm.ts`
- 部署：Vercel 一键
- **全用 TypeScript，不拆 Python 后端。** 情报抓取若必须用 Python 爬，写成独立产数据、往多维表格写库的脚本，不与前端耦合。

## 目录约定（一人一目录）
```
app/
├─ layout.tsx        ← 骨架 + 导航（黄士鑫，共享，别人不碰）
├─ page.tsx          ← 首页/搜索入口（黄士鑫，共享，别人不碰）
├─ radar/            ← ① 情报雷达 页+API（Gardner）
├─ diagnosis/        ← ② 诊断报告 页+API（Rena）
└─ gip/              ← ③ GIP 面板 页+API（白思宇）
lib/
├─ bitable.ts        ← 多维表格读写封装（Jeff）
├─ mock.ts           ← Mock 数据（Jeff）
├─ llm.ts            ← LLM 调用封装（共享）
└─ utils.ts          ← cn() 等工具（共享）
types/contract.ts    ← 冻结的数据契约（全员共识，只有 Jeff 改）
components/ui/        ← shadcn 基础组件（共享，按需新增，不改已有）
components/shell/     ← 导航/搜索框（黄士鑫，共享）
```

## 三条铁律
1. **契约先行**：`types/contract.ts` 是唯一真相。所有模块对着同一份契约和 `lib/mock.ts` 写。**要改契约，先在群里喊一声、全员确认。**
2. **文件级隔离**：只在自己目录建文件。**不碰别人的模块，不碰 `types/contract.ts`、`app/layout.tsx`、`app/page.tsx`。**
3. **Mock 优先**：API 先返回符合契约的 mock 数据（来自 `lib/mock.ts`），前端对着 mock 开发。接真实数据是后面的事，Demo 永远能跑。

## 给 AI 的硬性要求
- ① 只在我负责的目录建文件，不碰别人模块和 `types/contract.ts`；
- ② API 先返回 `lib/mock.ts` 里符合契约的 mock 数据；
- ③ 前端用 `components/ui/` 里的 shadcn 组件，风格跟 `app/layout.tsx` 一致；
- ④ 先给一个能跑通的页面 + 一个 mock API，再逐步接真数据。

## Demo 动线（必须连起来）
首页搜索框输入游戏 → `/radar` 发现有动作的游戏 → 选中 → `/diagnosis` 出诊断报告 → 跳 `/gip` 看预算消耗。模块间通过 URL 参数（如 `?gameId=`）联动，数据结构以 `contract.ts` 为准。

## 本地启动
```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
```
