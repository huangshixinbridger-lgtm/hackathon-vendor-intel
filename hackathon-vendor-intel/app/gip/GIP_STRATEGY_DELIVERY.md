# GIP 投放策略模块交付说明

## 模块定位

GIP 模块不是上游大盘诊断的重复页面，而是为诊断报告补充 **GIP 侧投放策略 insights**：

- 查询任意游戏的 GIP 历史投放、预算、消耗与活动明细。
- 按时间、地区、品类、投放打法筛选 GIP 消耗大盘。
- 对老游戏输出历史投放复盘和后续节点预算计划。
- 对新游戏或无历史投放游戏，参考同品类 benchmark 输出冷启建议。
- 支持 `/gip?gameId=xxx` 从诊断页跳转后自动选中游戏。

## 交互逻辑

1. 顶部直接展示 GIP 策略报告输出，核心结论优先于复盘明细。
2. 用户可以搜索游戏、厂商、品类，也可以按时间、地区、品类、打法筛选。
3. 汇总卡片展示筛选后的预算、消耗、消耗率、GIP VV 与投稿数。
4. 点击游戏后展示该游戏历史活动复盘。
5. 同品类 benchmark 用于校准老游戏复投，也用于新游戏冷启建议。

## 策略生成逻辑

### 老游戏且有 GIP 历史

输出重点：

- 历史投放是否有效：看 VV、投稿、达人、CPM、互动率。
- 哪些市场值得复投：优先历史高效市场和同品类高承接市场。
- 哪些内容模板值得复用：剧情/文化、挑战/攻略、直播任务、社交玩法。
- 后续预算如何拆：T0 预热验证、T1 节点爆发、T2 复盘复投。

### 新游戏或无 GIP 历史

输出重点：

- 参考同品类同市场 benchmark。
- 先用小预算验证市场和内容模板。
- 市场未定时补充选择因素：organic VV、开播人数、同品类 CPM、达人供给、区域内容适配度。
- 通过 T0 验证后再进入节点放量。

## Mock 数据维度

当前 mock 数据位于 `app/gip/data.ts`，包含：

- 游戏：`gameId`、`game`、`category`、`vendor`、`stage`
- 筛选：`period`、`region`、`deliveryShape`
- 投放：`budget`、`consumption`、`activities`
- 活动：`spend`、`posts`、`vv`、`creators`、`interactions`、`billingMode`、`creatorTier`、`contentAngle`、`review`
- 生态身位：organic VV、看播人数、达人规模、身位标签
- Benchmark：同品类地区均值预算、VV、投稿、CPM、互动率、best case、insight

## 后续接真实数据

后续只需要替换读取来源，不改变页面契约：

- API 入口：`app/gip/api/route.ts`
- 返回结构：保持 `GIPRecord[]` 兼容
- 真实数据读取：等待 Jeff 在 `lib/bitable.ts` 提供统一函数
- 安全要求：token、密钥、表格凭证不得写入前端代码或群消息

## 验收点

- 无筛选时展示全部 mock 记录。
- 游戏、时间、地区、品类、打法筛选有效。
- 汇总预算、消耗、消耗率计算正确。
- 点击游戏后能看到历史活动复盘。
- 新游戏能基于同品类 benchmark 输出建议。
- `/gip?gameId=yanyun` 能自动选中燕云十六声。
- `/gip?gameId=freefire`、搜索 `Free Fire` 或 `free-fire` 能自动切换到 Free Fire。
- 当前 PR 仅修改 `app/gip/`。
