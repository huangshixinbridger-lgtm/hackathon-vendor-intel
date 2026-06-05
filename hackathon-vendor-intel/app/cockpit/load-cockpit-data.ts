// app/cockpit/load-cockpit-data.ts —— 驾驶舱所需真实数据的服务端加载器（首页 / 与 /cockpit 共用）。
// 复用 diagnosis / radar 模块产物，不改它们的产品逻辑。
import { PLANETS } from "./cockpit-data";
import { hasDiagnosis, getDiagnosisDocument, type DiagnosisDocument } from "@/app/diagnosis/diagnosisData";
import { getRadarDatabaseSnapshot, getTodaySummaryStats } from "@/app/radar/database";

export async function loadCockpitData() {
  // 给星图里「有诊断报告」的星球预取真实诊断文档（保留 diagnosis 模块全部正文/表格/图表）。
  const entries = await Promise.all(
    PLANETS.filter((p) => hasDiagnosis(p.id)).map(
      async (p) => [p.id, await getDiagnosisDocument(p.id)] as const
    )
  );
  const diagnosisDocs: Record<string, DiagnosisDocument> = Object.fromEntries(entries);

  // 情报雷达 learn more 全息页所需的真实数据（库快照 + 今日摘要），只读，不启调度器。
  return {
    diagnosisDocs,
    radarSnapshot: getRadarDatabaseSnapshot(),
    radarSummary: getTodaySummaryStats(),
  };
}
