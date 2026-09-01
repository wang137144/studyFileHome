<script setup lang="ts">
// ===== 组件：快捷修改弹窗（只改一个字段）=====
// 对应需求里的「修改」按钮：不打开完整表单，只针对某一个字段做快速改动，
// 改哪个字段、用什么控件，全部来自按钮配置里的 quickEdit。
import { computed, ref, watch } from 'vue'
import type { QuickEditConfig, RowData } from '../common/types'

const props = defineProps<{
  /** 快捷修改配置（来自按钮的 quickEdit） */
  config: QuickEditConfig | null
  /** 当前操作的行 */
  row: RowData | null
  /** 弹窗标题里展示的行标识字段（如书名） */
  labelField?: string
}>()

const emit = defineEmits<{
  /** 提交修改后的字段值 */
  (e: 'submit', prop: string, value: unknown): void
}>()

const visible = defineModel<boolean>('visible', { required: true })

/** 待提交的新值，类型随配置而变 */
const value = ref<any>('')

/** 弹窗标题：修改「库存」 —— 《Vue.js 设计与实现》 */
const title = computed(() => {
  if (!props.config) return '修改'
  const name = props.labelField ? props.row?.[props.labelField] : undefined
  return name ? `修改${props.config.label}：${String(name)}` : `修改${props.config.label}`
})

/** 打开时带入当前值 */
watch(visible, (open) => {
  if (!open || !props.config || !props.row) return
  const raw = props.row[props.config.prop]
  value.value = raw === null || raw === undefined ? '' : raw
})

function handleSubmit(): void {
  if (!props.config) return
  emit('submit', props.config.prop, value.value)
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="420px" append-to-body destroy-on-close>
    <el-form v-if="config" label-width="80px">
      <el-form-item :label="config.label">
        <el-input
          v-if="config.type === 'input'"
          v-model="value"
          :placeholder="config.placeholder ?? `请输入${config.label}`"
          clearable
        />
        <el-input
          v-else-if="config.type === 'textarea'"
          v-model="value"
          type="textarea"
          :rows="3"
          :placeholder="config.placeholder ?? `请输入${config.label}`"
        />
        <el-input-number
          v-else-if="config.type === 'number'"
          v-model="value"
          :min="config.min"
          :max="config.max"
          :placeholder="config.placeholder"
          style="width: 100%"
        />
        <el-select
          v-else-if="config.type === 'select'"
          v-model="value"
          :placeholder="config.placeholder ?? `请选择${config.label}`"
          style="width: 100%"
        >
          <el-option
            v-for="opt in config.options ?? []"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
