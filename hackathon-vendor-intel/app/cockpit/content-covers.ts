// app/cockpit/content-covers.ts —— 已本地化的内容视频封面（public/content/<videoId>.jpg）。
// 内容雷达数据里 coverUrl 多为空 / 或是 TikTok 签名 URL（会过期 + 防盗链），
// 这里把封面预烤到本地，作为座舱内容洞察墙的封面回退。视频 id == TikTok 视频 id。
export const LOCAL_COVERS = new Set<string>([
  // Free Fire（Garena）Top 视频封面
  "7643755378395630849", "7639791467212393748", "7633668596908051732", "7632959179078028564",
  "7608911485279964436", "7635496493574606087", "7637033892612033812", "7643244435295194388",
  "7632721639142083858", "7638918014431153416",
]);

export function localCover(id: string): string | undefined {
  return LOCAL_COVERS.has(id) ? `/content/${id}.jpg` : undefined;
}
