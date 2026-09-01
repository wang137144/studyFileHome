<script setup lang="ts">
// ===== 组件：新增 / 编辑弹窗（表单字段由配置生成）=====
// 新增与编辑复用同一个弹窗，差别只有：
//   1. 标题不同；
//   2. 编辑时带入原始数据，并对 disabledOnEdit 的字段置灰（如 ISBN）。
import { computed, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FormFieldConfig, RowData } from '../common/types'

const props = defineProps<{
  /** 表单字段配置 */
  fields: FormFieldConfig[]
  /** add = 新增，edit = 编辑 */
  mode: 'add' | 'edit'
  /** 编辑时的原始行数据 */
  row?: RowData | null
  /** 业务名称，用于拼标题，如「书本」 */
  entityName: string
  width?: string
  labelWidth?: string
}>()

const emit = defineEmits<{
  /** 校验通过后提交表单数据 */
  (e: 'submit', data: RowData): void
}>()

/** 弹窗显隐（父组件 v-model 控制） */
const visible = defineModel<boolean>('visible', { required: true })

const formRef = ref<FormInstance>()
/** 表单数据：字段完全由配置决定，值类型不固定，这里用 any 承载 */
const formData = ref<Record<string, any>>({})
const submitting = ref(false)

/** 只渲染 show !== false 的字段 */
const shownFields = computed(() => props.fields.filter((field) => field.show !== false))

const title = computed(() =>
  props.mode === 'add' ? `新增${props.entityName}` : `编辑${props.entityName}`
)

/** 必填校验规则：由字段配置里的 required 自动生成 */
const rules = computed<FormRules>(() => {
  const result: FormRules = {}
  for (const field of shownFields.value) {
    if (!field.required) continue
    const isText = field.type === 'input' || field.type === 'textarea'
    result[field.prop] = [
      {
        required: true,
        message: `${isText ? '请输入' : '请选择'}${field.label}`,
        trigger: isText ? 'blur' : 'change',
      },
    ]
  }
  return result
})

/** 编辑时该字段是否禁用 */
function isDisabled(field: FormFieldConfig): boolean {
  if (field.disabled) return true
  return props.mode === 'edit' && field.disabledOnEdit === true
}

/** 打开弹窗时初始化表单：新增用默认值，编辑带入原始数据 */
function initForm(): void {
  const data: Record<string, any> = {}
  if (props.mode === 'edit' && props.row) {
    // 保留主键等隐藏字段，提交时父组件才能定位到这一行
    Object.assign(data, props.row)
  }
  for (const field of shownFields.value) {
    if (data[field.prop] === undefined) {
      data[field.prop] = field.defaultValue ?? (field.type === 'switch' ? false : '')
    }
  }
  formData.value = data
  // 清掉上一次的校验红字
  formRef.value?.clearValidate()
}

watch(visible, (open) => {
  if (open) initForm()
})

/** 提交：校验通过后把数据交给父组件写入 localStorage */
async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  submitting.value = true
  try {
    await formRef.value.validate()
    emit('submit', { ...formData.value })
    visible.value = false
  } catch {
    // 校验未通过，保持弹窗打开
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width ?? '640px'"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" :label-width="labelWidth ?? '90px'">
      <el-row :gutter="16">
        <!-- 每个字段占几格由配置里的 span 决定，默认整行 -->
        <el-col v-for="field in shownFields" :key="field.prop" :span="field.span ?? 24">
          <el-form-item :label="field.label" :prop="field.prop">
            <el-input
              v-if="field.type === 'input'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder ?? `请输入${field.label}`"
              :disabled="isDisabled(field)"
              clearable
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.prop]"
              type="textarea"
              :rows="3"
              :placeholder="field.placeholder ?? `请输入${field.label}`"
              :disabled="isDisabled(field)"
            />
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="formData[field.prop]"
              :min="field.min"
              :max="field.max"
              :step="field.step ?? 1"
              :disabled="isDisabled(field)"
              style="width: 100%"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder ?? `请选择${field.label}`"
              :disabled="isDisabled(field)"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="opt in field.options ?? []"
                :key="String(opt.value)"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-switch
              v-else-if="field.type === 'switch'"
              v-model="formData[field.prop]"
              :disabled="isDisabled(field)"
            />
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.prop]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="field.placeholder ?? `请选择${field.label}`"
              :disabled="isDisabled(field)"
              style="width: 100%"
            />
            <el-radio-group
              v-else-if="field.type === 'radio'"
              v-model="formData[field.prop]"
              :disabled="isDisabled(field)"
            >
              <el-radio
                v-for="opt in field.options ?? []"
                :key="String(opt.value)"
                :value="opt.value"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
