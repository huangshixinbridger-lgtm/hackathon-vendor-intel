// lib/llm.ts —— LLM 调用封装（共享）
// 共享文件：诊断模块(Rena)会重度使用。Key 走环境变量，骨架阶段可不接。
export interface LLMOptions { system?: string; temperature?: number; }

export async function callLLM(prompt: string, _opts: LLMOptions = {}): Promise<string> {
  // TODO: 接 Claude / GPT API（读 process.env.LLM_API_KEY）。
  // 骨架阶段返回占位，保证不接 key 也能跑 Demo。
  return `「LLM 占位返回」——已收到 prompt（${prompt.length} 字），接入真实 API 后替换。`;
}
