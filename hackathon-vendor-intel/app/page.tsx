// app/page.tsx —— 首页：扶正为「驾驶舱 · 星图」沉浸式入口。
// 原模块网格首页内容已被驾驶舱取代（曲速搜索 + 情报雷达 learn more + 点星球进内容洞察/经营诊断）。
// 如需还原旧首页，可从 git 历史恢复本文件。
import { CockpitScene } from "./cockpit/cockpit-scene";
import { loadCockpitData } from "./cockpit/load-cockpit-data";

export default async function HomePage() {
  const data = await loadCockpitData();
  return <CockpitScene {...data} />;
}
