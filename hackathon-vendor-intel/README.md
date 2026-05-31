# hackathon-vendor-intel

TikTok Gaming AI Hackathon —— 给厂商运营用的「情报与运营台」。

输入一个游戏 → 看它最近有什么动作（情报雷达）→ 在我们平台做得怎么样（诊断报告）→ GIP 花了多少钱（GIP 面板）。

## 技术栈
Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · 飞书多维表格 + Mock · Claude/GPT API · Vercel。

## 快速开始
```bash
git clone <仓库地址>
cd hackathon-vendor-intel
npm install
npm run dev          # 打开 http://localhost:3000
```

## 目录
```
app/layout.tsx   骨架+导航（黄士鑫）       app/radar/      情报雷达（Gardner）
app/page.tsx     首页/搜索入口（黄士鑫）    app/diagnosis/  诊断报告（Rena）
lib/             数据层/LLM（Jeff/共享）    app/gip/        GIP 面板（白思宇）
types/contract.ts 数据契约（Jeff，全员共识，勿改）
components/       shadcn 组件 + 导航/搜索
CLAUDE.md / AGENTS.md  AI 编码统一规范（同一份内容）
```

## 协作铁律
1. 契约先行：`types/contract.ts` 是唯一真相，改它先群里喊。
2. 文件级隔离：只碰自己目录；`contract.ts` / `layout.tsx` / `page.tsx` 只有 Jeff、黄士鑫动。
3. Mock 优先：先对着 `lib/mock.ts` 开发，Demo 永远能跑。

## 合码流程
分支开发 → PR 合到 `main`。开自己分支：`git checkout -b feat/<模块>`。详见团队文档。

> 数据为 Mock 演示数据，非真实业务数据。
