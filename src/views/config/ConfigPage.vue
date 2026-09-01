<script setup lang="ts">
// ===== 页面：配置化页面（纯前端配置驱动 + localStorage 增删改查）=====
// 这个页面本身不含任何业务字段，全部结构来自下面这一份配置对象：
//   筛选条件 / 列 / 按钮显隐 / 分页 / 表单 —— 改配置即改页面。
// 想换成别的业务，只需复制 common/bookConfig.ts 改字段，再把下面的 import 换掉即可。
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import ConfigFilterBar from './components/ConfigFilterBar.vue'
import ConfigDataTable from './components/ConfigDataTable.vue'
import ConfigFormDialog from './components/ConfigFormDialog.vue'
import ConfigQuickEditDialog from './components/ConfigQuickEditDialog.vue'
import ConfigDetailDialog from './components/ConfigDetailDialog.vue'
import { useConfigTable } from './common/useConfigTable'
import { bookPageConfig } from './common/bookConfig'
import type { ActionConfig, PageConfig, QuickEditConfig, RowData } from './common/types'

// ===== 这里换一份配置，就变成另一个业务页面 =====
const pageConfig = ref<PageConfig>(bookPageConfig)

// 配置化列表的全部能力（缓存读写 / 筛选 / 分页 / 增删改查）都来自这个 composable
const {
  config,
  visibleColumns,
  filterColumns,
  visibleRowActions,
  visibleHeaderActions,
  filters,
  pagedList,
  total,
  currentPage,
  pageSize,
  loadList,
  addRow,
  updateRow,
  updateField,
  removeRow,
  resetData,
  handleSearch,
  resetFilters,
} = useConfigTable(pageConfig)

/** 业务名称：书本管理 → 书本（用于弹窗标题） */
const entityName = computed(() => config.title.replace(/管理$/, ''))
/** 行标识字段：取第一个显示的列（书名），用于确认框与弹窗标题 */
const labelField = computed(() => visibleColumns.value[0]?.prop)

// ===== 新增 / 编辑弹窗 =====
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentRow = ref<RowData | null>(null)

// ===== 快捷修改弹窗（单字段修改） =====
const quickVisible = ref(false)
const quickConfig = ref<QuickEditConfig | null>(null)
const quickRow = ref<RowData | null>(null)

// ===== 查看详情弹窗 =====
const detailVisible = ref(false)
const detailRow = ref<RowData | null>(null)

/** 点「新增」：打开空白表单 */
function openAdd(): void {
  formMode.value = 'add'
  currentRow.value = null
  formVisible.value = true
}

/** 二次确认（删除类按钮用），取消返回 false */
async function confirmAction(action: ActionConfig, row: RowData): Promise<boolean> {
  if (!action.confirm) return true
  const text =
    typeof action.confirmText === 'function'
      ? action.confirmText(row)
      : (action.confirmText ?? `确认执行「${action.label}」操作吗？`)
  try {
    await ElMessageBox.confirm(text, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    return true
  } catch {
    return false
  }
}

/**
 * 行内操作按钮统一入口。
 * 判定顺序：配了 quickEdit → 快捷修改；否则按 key 分发（view / edit / delete）。
 */
async function onRowAction(action: ActionConfig, row: RowData): Promise<void> {
  if (!(await confirmAction(action, row))) return

  if (action.quickEdit) {
    quickConfig.value = action.quickEdit
    quickRow.value = row
    quickVisible.value = true
    return
  }

  switch (action.key) {
    case 'view':
      detailRow.value = row
      detailVisible.value = true
      break
    case 'edit':
      formMode.value = 'edit'
      currentRow.value = { ...row }
      formVisible.value = true
      break
    case 'delete':
      if (removeRow(row)) ElMessage.success('删除成功')
      else ElMessage.warning('该数据已不存在')
      break
    default:
      ElMessage.info(`按钮「${action.label}」暂未配置行为`)
  }
}

/** 表格右上角按钮（示例：恢复初始数据） */
async function onHeaderAction(action: ActionConfig): Promise<void> {
  const text =
    typeof action.confirmText === 'function' ? action.confirmText({}) : action.confirmText
  if (action.confirm) {
    try {
      await ElMessageBox.confirm(text ?? `确认执行「${action.label}」吗？`, '提示', {
        type: 'warning',
      })
    } catch {
      return
    }
  }
  if (action.key === 'resetData') {
    resetData()
    ElMessage.success('已恢复初始数据')
  }
}

/** 弹窗提交：新增走 addRow，编辑走 updateRow，都会写入 localStorage */
function onFormSubmit(data: RowData): void {
  if (formMode.value === 'add') {
    addRow(data)
    ElMessage.success('新增成功')
    currentPage.value = 1 // 新数据排在最前，跳回第一页方便查看
    return
  }
  if (updateRow(data)) ElMessage.success('修改成功')
  else ElMessage.warning('该数据已不存在')
}

/** 快捷修改提交 */
function onQuickSubmit(prop: string, value: unknown): void {
  if (!quickRow.value) return
  if (updateField(quickRow.value, prop, value)) ElMessage.success('修改成功')
  else ElMessage.warning('该数据已不存在')
}

/** 表格里 switch 列直接改值 */
function onFieldChange(row: RowData, prop: string, value: unknown): void {
  if (updateField(row, prop, value)) ElMessage.success('已更新')
}

/** 重置筛选 */
function onReset(): void {
  resetFilters()
  ElMessage.info('已重置筛选条件')
}

/** 查询：回到第一页并提示命中条数 */
function onSearch(): void {
  handleSearch()
  ElMessage.success(`共筛选出 ${total.value} 条数据`)
}

onMounted(loadList)
</script>

<template>
  <div class="page">
    <!-- 配置说明：告诉使用者这一页的结构从哪来 -->
    <el-alert type="info" :closable="false" show-icon class="tip">
      <template #icon><el-icon><InfoFilled /></el-icon></template>
      <template #title>
        本页所有筛选条件、列、按钮、分页均由
        <b>src/views/config/common/bookConfig.ts</b>
        渲染；数据存于浏览器 localStorage（键名 <b>{{ config.storageKey }}</b>），增删改查全部纯前端完成。
      </template>
    </el-alert>

    <!-- ① 筛选条件 + 查询 / 重置 / 新增（新增固定在筛选条件之后） -->
    <ConfigFilterBar
      :columns="filterColumns"
      :filters="filters"
      :toolbar="config.toolbar"
      @search="onSearch"
      @reset="onReset"
      @add="openAdd"
    />

    <!-- ② 数据列表 + 行内操作按钮 + 分页 -->
    <ConfigDataTable
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :title="config.title"
      :desc="config.desc"
      :columns="visibleColumns"
      :data="pagedList"
      :row-actions="visibleRowActions"
      :header-actions="visibleHeaderActions"
      :show-index="config.showIndex"
      :total="total"
      :pagination="config.pagination"
      @action="onRowAction"
      @header-action="onHeaderAction"
      @field-change="onFieldChange"
    />

    <!-- ③ 新增 / 编辑弹窗 -->
    <ConfigFormDialog
      v-model:visible="formVisible"
      :fields="config.formFields"
      :mode="formMode"
      :row="currentRow"
      :entity-name="entityName"
      :width="config.dialog.width"
      :label-width="config.dialog.labelWidth"
      @submit="onFormSubmit"
    />

    <!-- ④ 快捷修改弹窗（改库存 / 改状态） -->
    <ConfigQuickEditDialog
      v-model:visible="quickVisible"
      :config="quickConfig"
      :row="quickRow"
      :label-field="labelField"
      @submit="onQuickSubmit"
    />

    <!-- ⑤ 查看详情弹窗（含表格中隐藏的列） -->
    <ConfigDetailDialog
      v-model:visible="detailVisible"
      :columns="config.columns"
      :row="detailRow"
      :entity-name="entityName"
      :width="config.dialog.width"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  padding: 12px;
  background: #f0f5ff;
}
.tip {
  margin-bottom: 12px;
  border-radius: 10px;
}
.tip :deep(.el-alert__title) {
  font-size: 13px;
  line-height: 1.7;
}
</style>
