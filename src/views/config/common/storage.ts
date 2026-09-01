// ===== 浏览器本地缓存（localStorage）读写封装 =====
// 纯前端增删改查：所有数据存在 localStorage，刷新页面不丢失。
import type { RowData } from './types'

/** 读取缓存的列表；解析失败或没数据时返回空数组 */
export function readList(storageKey: string): RowData[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RowData[]) : []
  } catch {
    // 缓存被手改坏时直接降级为空数组，保证页面还能打开
    return []
  }
}

/** 把列表写回缓存 */
export function writeList(storageKey: string, list: RowData[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list))
  } catch {
    // 超出配额等场景下静默失败，不阻塞交互
  }
}

/**
 * 确保缓存里有数据：
 * 已有数据则原样返回，没有数据则把种子数据（假数据）写进去。
 */
export function ensureSeed(storageKey: string, seed: RowData[]): RowData[] {
  const cached = readList(storageKey)
  if (cached.length > 0) return cached
  writeList(storageKey, seed)
  return seed.map((row) => ({ ...row }))
}

/** 清空缓存（恢复初始数据时先清再写种子） */
export function clearList(storageKey: string): void {
  localStorage.removeItem(storageKey)
}

/** 生成本地时间的 yyyy-MM-dd HH:mm:ss 字符串 */
export function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
