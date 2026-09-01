// ===== 配置化页面的核心逻辑（composable）=====
// 职责：根据一份 PageConfig，完成「本地缓存读写 + 条件筛选 + 分页 + 增删改查」。
// 页面组件只消费这里暴露的状态与方法，不关心数据存在哪、怎么筛。
import { computed, ref, watch, type Ref } from 'vue'
import type { ColumnConfig, FilterType, FilterValue, PageConfig, RowData } from './types'
import { ensureSeed, formatDateTime, writeList } from './storage'

/** 推导某一列使用哪种筛选控件（未显式配置 filterType 时自动判断） */
export function resolveFilterType(col: ColumnConfig): FilterType {
  if (col.filterType) return col.filterType
  if (col.columnType === 'date') return 'date'
  if (col.options && col.options.length > 0) return 'select'
  return 'input'
}

/** 统一成可比较的小写文本 */
function toText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim().toLowerCase()
}

/** 日期比较只取前 10 位（yyyy-MM-dd） */
function toDay(value: unknown): string {
  return toText(value).slice(0, 10)
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return Number.NaN
  return Number(value)
}

/** 某一行是否满足某一个筛选条件 */
function matchCell(row: RowData, col: ColumnConfig, value: unknown): boolean {
  const type = resolveFilterType(col)
  switch (type) {
    case 'select':
      if (value === '' || value === null || value === undefined) return true
      return toText(row[col.prop]) === toText(value)
    case 'date':
      if (!value) return true
      return toDay(row[col.prop]) === toDay(value)
    case 'daterange': {
      if (!Array.isArray(value)) return true
      const [start, end] = value
      if (!start && !end) return true
      const day = toDay(row[col.prop])
      if (start && day < toDay(start)) return false
      if (end && day > toDay(end)) return false
      return true
    }
    case 'number': {
      if (value === '' || value === null || value === undefined) return true
      return toNumber(row[col.prop]) === toNumber(value)
    }
    case 'numberRange': {
      if (!Array.isArray(value)) return true
      const [min, max] = value
      const num = toNumber(row[col.prop])
      if (Number.isNaN(num)) return false
      if (min !== null && min !== undefined && min !== '' && num < Number(min)) return false
      if (max !== null && max !== undefined && max !== '' && num > Number(max)) return false
      return true
    }
    default: {
      if (value === '' || value === null || value === undefined) return true
      return toText(row[col.prop]).includes(toText(value))
    }
  }
}

/** 某列筛选控件的初始值 */
function defaultFilterValue(col: ColumnConfig): FilterValue {
  const type = resolveFilterType(col)
  if (type === 'daterange' || type === 'numberRange') return [null, null]
  return ''
}

/**
 * 配置化列表的核心逻辑
 * @param configRef 页面配置（ref 包裹，改动配置里的 show 开关页面会立即响应）
 */
export function useConfigTable(configRef: Ref<PageConfig>) {
  const config = configRef.value

  /** 原始数据（已与 localStorage 同步） */
  const list = ref<RowData[]>([])
  /** 各列的筛选值：{ 字段名: 值 } */
  const filters = ref<Record<string, FilterValue>>({})
  const currentPage = ref(1)
  const pageSize = ref(config.pagination.defaultPageSize)

  // ===== 列的动态控制 =====
  /** 配置中 show 为 true 的列 —— 表格里真正渲染的列 */
  const visibleColumns = computed(() => config.columns.filter((col) => col.show))
  /** 可见列里 filterable 不为 false 的列 —— 筛选区里渲染的条件（存在的列即可筛选） */
  const filterColumns = computed(() =>
    visibleColumns.value.filter((col) => col.filterable !== false)
  )
  /** 显示出来的行内操作按钮 */
  const visibleRowActions = computed(() => config.rowActions.filter((a) => a.show))
  /** 显示出来的表格右上角按钮 */
  const visibleHeaderActions = computed(() => (config.headerActions ?? []).filter((a) => a.show))

  /** 初始化筛选值（每个列都留一个 key，列显隐切换时不会丢已填的值） */
  function initFilters(): void {
    const next: Record<string, FilterValue> = {}
    for (const col of config.columns) {
      next[col.prop] = filters.value[col.prop] ?? defaultFilterValue(col)
    }
    filters.value = next
  }

  /** 从缓存 / 种子数据载入列表 */
  function loadList(): void {
    list.value = ensureSeed(config.storageKey, config.seed)
    initFilters()
  }

  /** 写回 localStorage */
  function persist(): void {
    writeList(config.storageKey, list.value)
  }

  /** 生成下一个主键（当前最大 id + 1） */
  function nextId(): number {
    const field = config.idField
    return list.value.reduce((max, row) => Math.max(max, Number(row[field]) || 0), 0) + 1
  }

  // ===== 筛选 + 分页 =====
  const filteredList = computed(() =>
    list.value.filter((row) =>
      filterColumns.value.every((col) => matchCell(row, col, filters.value[col.prop]))
    )
  )
  const total = computed(() => filteredList.value.length)
  /** 当前页要展示的数据 */
  const pagedList = computed(() => {
    if (!config.pagination.show) return filteredList.value
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  // 删除 / 筛选导致总条数变少时，把页码收回到合法范围
  watch([total, pageSize], () => {
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  })

  // ===== 增删改查（全部落在 localStorage）=====
  /** 新增：自动补主键与创建时间 */
  function addRow(data: RowData): RowData {
    const row: RowData = { ...data }
    row[config.idField] = nextId()
    if (!row.createTime) row.createTime = formatDateTime(new Date())
    list.value = [row, ...list.value]
    persist()
    return row
  }

  /** 修改：按主键整体合并 */
  function updateRow(data: RowData): boolean {
    const index = list.value.findIndex((row) => row[config.idField] === data[config.idField])
    if (index < 0) return false
    list.value[index] = { ...list.value[index], ...data }
    persist()
    return true
  }

  /** 修改单个字段（快捷修改 / 表格内开关） */
  function updateField(row: RowData, prop: string, value: unknown): boolean {
    return updateRow({ [config.idField]: row[config.idField], [prop]: value })
  }

  /** 删除：按主键移除 */
  function removeRow(row: RowData): boolean {
    const target = row[config.idField]
    const next = list.value.filter((item) => item[config.idField] !== target)
    if (next.length === list.value.length) return false
    list.value = next
    persist()
    return true
  }

  /** 恢复初始假数据（清缓存后重新写种子数据） */
  function resetData(): void {
    writeList(config.storageKey, config.seed)
    list.value = config.seed.map((row) => ({ ...row }))
    resetFilters()
  }

  // ===== 筛选区动作 =====
  /** 查询：回到第一页（数据本身就是 computed，这里只做分页归位） */
  function handleSearch(): void {
    currentPage.value = 1
  }
  /** 重置：清空所有筛选值 */
  function resetFilters(): void {
    for (const col of config.columns) {
      filters.value[col.prop] = defaultFilterValue(col)
    }
    currentPage.value = 1
  }

  return {
    // 配置
    config,
    // 列
    visibleColumns,
    filterColumns,
    visibleRowActions,
    visibleHeaderActions,
    // 数据
    list,
    filters,
    filteredList,
    pagedList,
    total,
    currentPage,
    pageSize,
    // 方法
    loadList,
    addRow,
    updateRow,
    updateField,
    removeRow,
    resetData,
    handleSearch,
    resetFilters,
  }
}
