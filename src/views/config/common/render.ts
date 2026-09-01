// ===== 配置化页面：单元格渲染辅助方法 =====
// 表格、详情弹窗都需要把「原始值」翻译成「展示文本」，
// 这里集中处理，避免在多个组件里重复写 formatter 逻辑。
import type { ColumnConfig, OptionItem, RowData } from './types'

/** 按值在候选项里找到对应的 option（用于 tag 显示 label 与颜色） */
export function findOption(
  options: OptionItem[] | undefined,
  value: unknown
): OptionItem | undefined {
  if (!options || options.length === 0) return undefined
  return options.find((item) => String(item.value) === String(value))
}

/** 金额：保留两位小数并加上人民币符号 */
export function formatMoney(value: unknown): string {
  const num = Number(value)
  if (value === null || value === undefined || value === '' || Number.isNaN(num)) return '-'
  return `¥${num.toFixed(2)}`
}

/** 日期：只取 yyyy-MM-dd 部分 */
export function formatDay(value: unknown): string {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

/** 空值统一显示为「-」 */
export function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

/**
 * 计算某一格最终要展示的文本。
 * 优先级：列自定义 formatter > columnType 内置格式化 > 候选项 label > 原始值
 */
export function cellText(row: RowData, col: ColumnConfig): string {
  const raw = row[col.prop]
  // 1. 配置里写了 formatter，完全交给业务方决定
  if (col.formatter) return col.formatter(row, raw)

  // 2. 按单元格类型做内置格式化
  if (col.columnType === 'money') return formatMoney(raw)
  if (col.columnType === 'date') return formatDay(raw)

  // 3. 有候选项时显示 label（如 status: 1 → 在售）
  const option = findOption(col.options, raw)
  if (option) return option.label

  // 4. 兜底
  return isEmptyValue(raw) ? '-' : String(raw)
}

/** tag 列的颜色（找不到候选项时用默认色） */
export function tagType(col: ColumnConfig, value: unknown): OptionItem['type'] {
  return findOption(col.options, value)?.type ?? 'info'
}
