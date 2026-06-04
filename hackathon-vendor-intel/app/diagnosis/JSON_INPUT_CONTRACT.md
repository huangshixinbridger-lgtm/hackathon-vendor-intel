# 情报诊断 JSON 输入契约

本模块的稳定链路是：

`Lark agent 生成诊断 JSON + 原文档链接 -> app/diagnosis/diagnosisData.ts -> /diagnosis?gameId=xxx 渲染成诊断页`

当前不依赖从 Lark 文档 DOM 抓完整正文或图片。Lark 文档负责给人看和沉淀分析，JSON 负责给页面稳定渲染。

## 1. 必填字段

后续每个游戏至少给这些字段：

```json
{
  "gameId": "blood-strike",
  "gameName": "Blood Strike",
  "document": {
    "title": "Blood Strike TikTok 生态分析",
    "url": "https://bytedance.larkoffice.com/docx/xxx"
  },
  "executive_summary": {
    "overall_position": "强区域爆发、弱全球总盘",
    "budget_decision": "建议继续投达人激励预算，但不适合全球平均铺量",
    "budget_priority": ["短视频创作者扩量", "直播核心市场活动化"]
  },
  "short_video": {
    "metrics": {},
    "ranks": {},
    "top_consumption_countries": [],
    "top_supply_or_high_return_markets": [],
    "judgement": ""
  },
  "live": {
    "metrics": {},
    "ranks": {},
    "top_consumption_countries": [],
    "top_supply_or_high_return_markets": [],
    "judgement": ""
  },
  "budget_recommendation": {
    "should_invest": true,
    "priority_order": [],
    "strategy": []
  },
  "reusable_pitch": ""
}
```

如果 agent 暂时无法产出 `gameId`，前端可以临时把 `game` 转成 kebab-case，但建议 agent 直接输出稳定 ID。

## 2. 页面实际消费字段

页面最终会转成 `DiagnosisDocument`：

```ts
type DiagnosisDocument = {
  gameId: string;
  gameName: string;
  title: string;
  subtitle: string;
  badge: string;
  sourceUrl?: string;
  summary?: {
    headline: string;
    conclusion: string;
    priorityActions: string[];
    talkTrack?: string;
  };
  kpis?: { label: string; value: string; note: string }[];
  charts?: {
    title: string;
    unit: string;
    color?: string;
    rows: { name: string; value: number }[];
  }[];
  marketBars?: { market: string; shortVideo: number; live: number }[];
  blocks: DocumentBlock[];
};
```

## 3. 推荐生成规则

### 3.1 summary

用于首屏结论卡：

- `headline`：一句预算判断，例如“可以继续投，但短视频优先级高于直播”。
- `conclusion`：2-3 句说明生态位置和核心矛盾。
- `priorityActions`：3 个短动作，适合卡片展示。
- `talkTrack`：项目方可直接复用话术。

### 3.2 kpis

用于首屏指标卡，建议固定 4 个：

- 短视频总 VV
- 短视频投稿
- 条均 VV
- 直播看播

### 3.3 charts

用于页面图表。不要依赖 Lark 内嵌图片，直接给数据：

```json
{
  "title": "短视频竞品 VV 对比",
  "unit": "亿 VV",
  "rows": [
    { "name": "Free Fire", "value": 1698.7 },
    { "name": "Blood Strike", "value": 51.72 }
  ]
}
```

### 3.4 marketBars

用于“重点市场优先级”图文摘要。

`shortVideo` 和 `live` 是 0-100 的相对强度，不要求等于真实 share；建议由消费 share、供给缺口、预算优先级综合映射。

```json
[
  { "market": "PH", "shortVideo": 74, "live": 100 },
  { "market": "ID", "shortVideo": 100, "live": 86 }
]
```

### 3.5 blocks

用于完整正文。支持：

- `sectionHeader`
- `paragraph`
- `bulletList`
- `table`
- `image`
- `callout`

Demo 阶段建议由 Codex 先把 agent JSON 手动转成 blocks；后续可以写自动 adapter。

## 4. 当前已接入样例

- `/diagnosis?gameId=yanyun`：本地 markdown 缓存 + Lark 原文档链接。
- `/diagnosis?gameId=blood-strike`：结构化 JSON + Lark 原文档链接。
- `/diagnosis?gameId=eggy-party`：结构化 JSON + Lark 原文档链接。

## 5. 后续自动化方向

短期：你手动从 Lark agent 拿 JSON，我把 JSON 转成 `DiagnosisDocument`。

中期：新增 `fromAgentJson(raw)` adapter，把 agent JSON 自动转成 `DiagnosisDocument`。

长期：Lark agent 直接输出 `DiagnosisDocument` 同构 JSON，前端 API 只需要按 `gameId` 读取最新版本。
