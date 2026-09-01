<script setup lang="ts">
// ===== 组件：筛选条件区（完全由列配置驱动）=====
// 规则：
//   1. 只有「显示中的列（show: true）」且「filterable !== false」才会出现在这里
//      —— 也就是需求里的「存在的列就可以在筛选条件中显示出来」；
//   2. 控件类型由 filterType 决定（不写时自动推导）；
//   3. 查询 / 重置 / 新增三个按钮各自由配置里的 show 独立控制，
//      新增按钮固定排在所有筛选条件之后。
import { computed, ref } from 'vue'
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'
import { resolveFilterType } from '../common/useConfigTable'
import type { ActionConfig, ColumnConfig, FilterValue } from '../common/types'

const props = defineProps<{
  /** 参与筛选的列（父组件已按 show / filterable 过滤好） */
  columns: ColumnConfig[]
  /** 筛选值集合，与父组件共享同一个响应式对象，子组件直接写入即可 */
  filters: Record<string, FilterValue>
  /** 工具栏三个按钮的配置 */
  toolbar: {
    search: ActionConfig
    reset: ActionConfig
    add: ActionConfig
  }
  /** 超过该数量的筛选条件时折叠，默认 4 个 */
  collapseAfter?: number
}>()

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
  (e: 'add'): void
}>()

/** 折叠状态：条件较多时默认只展示前 N 个 */
const expanded = ref(false)
const limit = computed(() => props.collapseAfter ?? 4)
const canCollapse = computed(() => props.columns.length > limit.value)
/** 实际渲染的筛选条件 */
const shownColumns = computed(() =>
  canCollapse.value && !expanded.value ? props.columns.slice(0, limit.value) : props.columns
)

// ===== 筛选值读写辅助 =====
/** 写入某个字段的筛选值 */
function setFilter(prop: string, value: FilterValue): void {
  props.filters[prop] = value
}

/** 读取单值型控件（input / select / date / number）的值 */
function scalarValue(prop: string): string | number | undefined {
  const value = props.filters[prop]
  if (value === null || value === undefined || Array.isArray(value)) return undefined
  if (typeof value === 'boolean') return String(value)
  return value
}

/** 读取文本框的值（el-input 只接受字符串） */
function textValue(prop: string): string {
  const value = scalarValue(prop)
  return value === undefined ? '' : String(value)
}

/** 读取区间型控件（numberRange）某一端的值 */
function rangeAt(prop: string, index: number): number | undefined {
  const value = props.filters[prop]
  if (!Array.isArray(value)) return undefined
  const item = value[index]
  if (item === null || item === undefined || item === '') return undefined
  const num = Number(item)
  return Number.isNaN(num) ? undefined : num
}

/** 写入区间型控件某一端的值（另一端保持不变） */
function setRangeAt(prop: string, index: number, value: unknown): void {
  const current = props.filters[prop]
  const next: Array<string | number | null> = Array.isArray(current)
    ? [...current]
    : [null, null]
  next[index] = value === undefined || value === null || value === '' ? null : (value as number)
  setFilter(prop, next)
}

/** 读取日期区间的值 */
function dateRangeValue(prop: string): [string, string] | undefined {
  const value = props.filters[prop]
  if (!Array.isArray(value)) return undefined
  const [start, end] = value
  if (!start || !end) return undefined
  return [String(start), String(end)]
}

/** 写入日期区间的值 */
function setDateRange(prop: string, value: unknown): void {
  if (Array.isArray(value) && value.length === 2) {
    setFilter(prop, [String(value[0] ?? ''), String(value[1] ?? '')])
  } else {
    setFilter(prop, [null, null])
  }
}

/** 占位文案：下拉用「请选择」，其余用「请输入」 */
function placeholderOf(col: ColumnConfig): string {
  const type = resolveFilterType(col)
  return type === 'select' || type === 'date' ? `请选择${col.label}` : `请输入${col.label}`
}
</script>

<template>
  <el-card shadow="hover" class="filter-card">
    <el-form :inline="true" class="filter-form" @submit.prevent>
      <!-- ① 动态筛选条件：一列一个条件，控件类型由配置推导 -->
      <el-form-item v-for="col in shownColumns" :key="col.prop" :label="col.label">
        <!-- 文本模糊匹配（input / text 等价，都渲染文本框 + 模糊查询） -->
        <el-input
          v-if="resolveFilterType(col) === 'input' || resolveFilterType(col) === 'text'"
          :model-value="textValue(col.prop)"
          :placeholder="placeholderOf(col)"
          clearable
          style="width: 180px"
          @update:model-value="(v: string) => setFilter(col.prop, v)"
          @keyup.enter="emit('search')"
        />

        <!-- 下拉精确匹配 -->
        <el-select
          v-else-if="resolveFilterType(col) === 'select'"
          :model-value="scalarValue(col.prop)"
          :placeholder="placeholderOf(col)"
          clearable
          style="width: 160px"
          @update:model-value="(v: unknown) => setFilter(col.prop, (v ?? '') as FilterValue)"
        >
          <el-option
            v-for="opt in col.options ?? []"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <!-- 单个日期 -->
        <el-date-picker
          v-else-if="resolveFilterType(col) === 'date'"
          :model-value="scalarValue(col.prop)"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="placeholderOf(col)"
          clearable
          style="width: 170px"
          @update:model-value="(v: unknown) => setFilter(col.prop, (v ?? '') as FilterValue)"
        />

        <!-- 日期区间 -->
        <el-date-picker
          v-else-if="resolveFilterType(col) === 'daterange'"
          :model-value="dateRangeValue(col.prop)"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
          style="width: 240px"
          @update:model-value="(v: unknown) => setDateRange(col.prop, v)"
        />

        <!-- 数字精确匹配 -->
        <el-input-number
          v-else-if="resolveFilterType(col) === 'number'"
          :model-value="rangeAt(col.prop, 0) ?? (scalarValue(col.prop) as number | undefined)"
          :controls="false"
          :placeholder="placeholderOf(col)"
          style="width: 140px"
          @update:model-value="(v: unknown) => setFilter(col.prop, (v ?? '') as FilterValue)"
        />

        <!-- 数字区间：最小值 ~ 最大值 -->
        <div v-else-if="resolveFilterType(col) === 'numberRange'" class="range-box">
          <el-input-number
            :model-value="rangeAt(col.prop, 0)"
            :controls="false"
            placeholder="最小值"
            class="range-input"
            @update:model-value="(v: unknown) => setRangeAt(col.prop, 0, v)"
          />
          <span class="range-sep">~</span>
          <el-input-number
            :model-value="rangeAt(col.prop, 1)"
            :controls="false"
            placeholder="最大值"
            class="range-input"
            @update:model-value="(v: unknown) => setRangeAt(col.prop, 1, v)"
          />
        </div>
      </el-form-item>

      <!-- ② 操作按钮：查询 / 重置 / 新增（新增固定跟在筛选条件后面） -->
      <el-form-item class="action-item">
        <el-button
          v-if="toolbar.search.show"
          :type="toolbar.search.type ?? 'primary'"
          :icon="toolbar.search.icon ?? Search"
          @click="emit('search')"
        >
          {{ toolbar.search.label }}
        </el-button>
        <el-button
          v-if="toolbar.reset.show"
          :type="toolbar.reset.type"
          :icon="toolbar.reset.icon ?? RefreshRight"
          @click="emit('reset')"
        >
          {{ toolbar.reset.label }}
        </el-button>
        <!-- 新增按钮：固定显示在筛选条件之后，由 toolbar.add.show 控制显隐 -->
        <el-button
          v-if="toolbar.add.show"
          :type="toolbar.add.type ?? 'success'"
          :icon="toolbar.add.icon ?? Plus"
          @click="emit('add')"
        >
          {{ toolbar.add.label }}
        </el-button>
        <!-- 条件过多时折叠，避免筛选区占满屏幕 -->
        <el-button v-if="canCollapse" text type="primary" @click="expanded = !expanded">
          {{ expanded ? '收起' : `展开(${columns.length - limit})` }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.filter-card {
  border-radius: 10px;
  background: #fff;
}
/* 抵消 el-form-item 的底部外边距，卡片高度更紧凑 */
.filter-form {
  margin-bottom: -18px;
}
.action-item :deep(.el-form-item__content) {
  gap: 8px;
}
.range-box {
  display: flex;
  align-items: center;
  gap: 6px;
}
.range-input {
  width: 110px;
}
.range-sep {
  color: #909399;
}
</style>
