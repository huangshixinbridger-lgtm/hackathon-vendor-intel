// lib/llm.ts —— LLM 调用封装（共享）
// 共享文件：诊断模块(Rena)会重度使用。Key 走环境变量，没配 key 时回退占位串，保证 Demo 永远能跑。
// 当前实现：Anthropic Messages API（fetch，无 SDK 依赖）。需要 OpenAI 可再扩展分支。
export interface LLMOptions {
  system?: string;
  temperature?: number;
  model?: string;
  maxTokens?: number;
}

/** 是否已配置可用的 LLM key。 */
export function llmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY);
}

export async function callLLM(prompt: string, opts: LLMOptions = {}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY;
  if (!key) {
    // 骨架/无 key：返回占位，调用方据此回退到策展内容。
    return `「LLM 占位返回」——已收到 prompt（${prompt.length} 字），配置 ANTHROPIC_API_KEY 后即走真实 API。`;
  }

  const model = opts.model || process.env.LLM_MODEL || "claude-3-5-haiku-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
      ...(opts.system ? { system: opts.system } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return data.content?.map((c) => c.text ?? "").join("").trim() ?? "";
}
