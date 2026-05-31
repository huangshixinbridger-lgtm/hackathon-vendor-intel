// lib/bitable.ts —— 飞书多维表格读写封装（骨架）
// ⚠️ 归属：Jeff。这里只放接口骨架，真实读写周末接。
//    各模块的 API 先调用 lib/mock.ts，不要直接依赖本文件的真实实现。

type BitableQuery = { table: string; filter?: Record<string, unknown> };

export async function readBitable<T>(_query: BitableQuery): Promise<T[]> {
  // TODO(Jeff): 接飞书多维表格 OpenAPI。骨架阶段返回空数组，由各模块 fallback 到 mock。
  return [];
}

export async function writeBitable(_table: string, _records: unknown[]): Promise<void> {
  // TODO(Jeff): 写入实现。
  return;
}
