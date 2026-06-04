// lib/mock.contentRadar.ts —— 内容雷达 Mock 数据（纯增量，不改 lib/mock.ts）
// ⚠️ 占位样本：真实数据由 fetch_videos.py 抓取 + AI 分析后替换。
//    样本里的 gameId 对齐 lib/mock.ts（g-1001 星海远征），方便端到端联调。
import type { ContentRadarDetail } from "@/types/contract.contentRadar";

export const mockContentRadar: Record<string, ContentRadarDetail> = {
  "g-1001": {
    gameId: "g-1001",
    gameName: "星海远征 (Star Voyage)",
    generatedAt: "2026-06-04T00:00:00.000Z",
    topVideos: [
      {
        id: "v-001",
        url: "https://www.tiktok.com/",
        author: "@舰长老王",
        caption: "2.0深空纪元开局舰队这么配，前期碾压！#星海远征",
        vv: 5_800_000,
        likes: 412_000,
        comments: 8_900,
        coverUrl: "",
        music: "original sound - 舰长老王",
        durationSec: 47,
        whyViral: {
          hook: "前3秒直接甩'碾压'战损比对比，制造好奇",
          meme: "开局配队攻略，硬核玩家最想要的即时价值",
          music: "原声解说，节奏快、信息密度高",
          pacing: "3秒钩子→15秒干货→结尾引导评论区要阵容",
          oneLine: "用'前期碾压'的结果钩子 + 高密度攻略，精准命中硬核SLG用户",
        },
      },
      {
        id: "v-002",
        url: "https://www.tiktok.com/",
        author: "@MiaCosplay",
        caption: "星海远征女舰长cos，这套机甲服自己做的👀 #星海远征 #cosplay",
        vv: 3_100_000,
        likes: 287_000,
        comments: 12_400,
        coverUrl: "",
        music: "Sci-Fi Ambient - trending sound",
        durationSec: 22,
        whyViral: {
          hook: "高完成度机甲cos第一帧视觉冲击",
          meme: "角色二创/cosplay，破圈到泛二次元人群",
          music: "踩了一个正在涨的科幻向trending sound",
          pacing: "短平快22秒，纯视觉，转发率高",
          oneLine: "角色二创 + 蹭涨势sound，把硬核SLG破圈到泛二次元",
        },
      },
    ],
    contentTypes: [
      { tag: "操作/攻略高光", vvShare: 0.42, videoCount: 18, exampleVideoIds: ["v-001"], note: "硬核向稳定盘，可加'版本最强阵容'系列化" },
      { tag: "角色二创/cosplay", vvShare: 0.28, videoCount: 11, exampleVideoIds: ["v-002"], note: "破圈主力，趁涨势sound批量铺腰部达人" },
      { tag: "剧情/世界观", vvShare: 0.18, videoCount: 7, exampleVideoIds: [], note: "情感向，适合配新版本CG做种草" },
      { tag: "搞笑/整活", vvShare: 0.12, videoCount: 5, exampleVideoIds: [], isGap: true, note: "缺口：竞品该形态跑得好，本游戏明显偏少，可下brief补" },
    ],
  },
};
