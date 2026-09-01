<script setup lang="ts">
// ===== 组件：数据列表（列与操作按钮全部由配置驱动）=====
// 1. 列：父组件传进来的 columns 已经过滤掉 show: false 的列 —— 实现「列的动态控制」；
// 2. 行内操作按钮：每个按钮的显隐由自身 show 控制，点击后把 action 原样抛给父组件处理；
// 3. 分页：由 pagination.show 控制，页码 / 每页条数通过 v-model 与父组件双向绑定。
import { computed } from 'vue'
import { cellText, tagType } from '../common/render'
import type { ActionConfig, ColumnConfig, PaginationConfig, RowData } from '../common/types'

const props = defineProps<{
  /** 表格标题 */
  title: string
  /** 标题右侧说明文字 */
  desc?: string
  /** 需要渲染的列（已按 show 过滤） */
  columns: ColumnConfig[]
  /** 当前页数据 */
  data: RowData[]
  /** 行内操作按钮（已按 show 过滤） */
  rowActions: ActionConfig[]
  /** 表格右上角按钮（已按 show 过滤） */
  headerActions?: ActionConfig[]
  /** 是否显示序号列 */
  showIndex?: boolean
  /** 筛选后的总条数 */
  total: number
  /** 分页配置 */
  pagination: PaginationConfig
}>()

const emit = defineEmits<{
  /** 点击行内操作按钮 */
  (e: 'action', action: ActionConfig, row: RowData): void
  /** 点击表格右上角按钮 */
  (e: 'header-action', action: ActionConfig): void
  /** switch 列直接改值 */
  (e: 'field-change', row: RowData, prop: string, value: unknown): void
}>()

/** 页码与每页条数：与父组件双向绑定 */
const currentPage = defineModel<number>('currentPage', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

/** 操作列宽度按按钮数量估算，避免按钮换行 */
const operationWidth = computed(() => Math.max(120, props.rowActions.length * 66 + 20))

/** 序号列：跨页时保持连续 */
function indexMethod(index: number): number {
  if (!props.pagination.show) return index + 1
  return (currentPage.value - 1) * pageSize.value + index + 1
}

/** switch 列的当前值（兼容 1/0 与 true/false 两种存法） */
function switchValue(row: RowData, col: ColumnConfig): boolean {
  const raw = row[col.prop]
  return raw === true || raw === 1 || raw === '1'
}

/** switch 列切换：把「与原始值同类型」的新值抛给父组件保存 */
function onSwitch(row: RowData, col: ColumnConfig, checked: boolean): void {
  const raw = row[col.prop]
  const next = typeof raw === 'boolean' ? checked : checked ? 1 : 0
  emit('field-change', row, col.prop, next)
}
</script>

<template>
  <el-card shadow="hover" class="table-card">
    <template #header>
      <div class="table-header">
        <div class="header-left">
          <span class="table-title">{{ title }}</span>
          <!-- <span v-if="desc" class="table-desc">{{ desc }}</span>
          <el-tag type="info" size="small" effect="plain">共 {{ total }} 条</el-tag> -->
        </div>
        <div class="header-right">
          <!-- 扩展按钮（如「恢复初始数据」），同样由各自 show 控制 -->
          <el-button
            v-for="action in headerActions ?? []"
            :key="action.key"
            :type="action.type"
            :plain="action.plain"
            :icon="action.icon"
            size="small"
            @click="emit('header-action', action)"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="data" stripe border highlight-current-row style="width: 100%" empty-text="暂无数据">
      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="70"
        align="center"
        :index="indexMethod"
      />

      <!-- 数据列：配置里 show 为 true 的列才会出现在这里 -->
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align ?? 'left'"
        :fixed="col.fixed"
        :sortable="col.sortable"
        :show-overflow-tooltip="col.showOverflowTooltip"
      >
        <template #default="{ row }">
          <!-- 标签样式 -->
          <el-tag v-if="col.columnType === 'tag'" :type="tagType(col, row[col.prop])" size="small" effect="light">
            {{ cellText(row, col) }}
          </el-tag>
          <!-- 开关样式：点一下直接落库（localStorage） -->
          <el-switch
            v-else-if="col.columnType === 'switch'"
            :model-value="switchValue(row, col)"
            @update:model-value="(v: unknown) => onSwitch(row, col, Boolean(v))"
          />
          <!-- 普通文本 / 金额 / 日期 -->
          <span v-else>{{ cellText(row, col) }}</span>
        </template>
      </el-table-column>

      <!-- 操作列：查看 / 编辑 / 修改 / 删除，每个按钮独立开关 -->
      <el-table-column
        v-if="rowActions.length > 0"
        label="操作"
        :width="operationWidth"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-for="action in rowActions"
            :key="action.key"
            :type="action.type"
            :link="action.link"
            :plain="action.plain"
            :icon="action.icon"
            size="small"
            @click="emit('action', action, row)"
          >
            {{ action.label }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页：show 为 false 时整块不渲染，表格直接展示全部筛选结果 -->
    <div v-if="pagination.show" class="pager">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pagination.pageSizes"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </el-card>
</template>

<style scoped>
.table-card {
  margin-top: 12px;
  border-radius: 10px;
  background: #fff;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-right {
  display: flex;
  gap: 8px;
}
.table-title {
  font-weight: 600;
  font-size: 15px;
}
.table-desc {
  font-size: 12px;
  color: #909399;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
