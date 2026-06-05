// app/cockpit/page.tsx —— 驾驶舱/星图路由（保留，与首页共用 loadCockpitData）。
import { CockpitScene } from "./cockpit-scene";
import { loadCockpitData } from "./load-cockpit-data";

export default async function CockpitPage() {
  const data = await loadCockpitData();
  return <CockpitScene {...data} />;
}
