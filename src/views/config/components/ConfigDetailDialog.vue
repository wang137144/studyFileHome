<script setup lang="ts">
// ===== 组件：查看详情弹窗 =====
// 表格里为了简洁会隐藏一些列（show: false），查看详情时把配置里声明过的字段全部展示出来，
// 便于确认「隐藏列的数据其实一直都在」。
import { cellText, tagType } from '../common/render'
import type { ColumnConfig, RowData } from '../common/types'

defineProps<{
  /** 配置中声明的全部列（含隐藏列） */
  columns: ColumnConfig[]
  /** 当前查看的行 */
  row: RowData | null
  /** 业务名称，用于拼标题 */
  entityName: string
  width?: string
}>()

const visible = defineModel<boolean>('visible', { required: true })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`${entityName}详情`"
    :width="width ?? '640px'"
    append-to-body
    destroy-on-close
  >
    <el-descriptions v-if="row" :column="2" border>
      <el-descriptions-item v-for="col in columns" :key="col.prop" :label="col.label">
        <el-tag v-if="col.columnType === 'tag'" :type="tagType(col, row[col.prop])" size="small" effect="light">
          {{ cellText(row, col) }}
        </el-tag>
        <span v-else>{{ cellText(row, col) }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
