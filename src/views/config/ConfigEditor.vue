<script setup lang="ts">
// ===== 页面：配置管理（动态控制「商品管理」页面的字段参数）=====
// 这是「配置的配置」：在此可视化修改商品管理页面每个字段的类型与行为，例如：
//   - 把「分类」的筛选类型从 select（下拉）改成 text（文本框 + 模糊查询），
//     商品管理页的筛选框会立即从下拉变成文本框；
//   - 把「品牌」从 text 改成 select，并补充候选项，就变成下拉精确匹配。
// 同时支持「字段级增删改」：新增字段、删除字段、编辑已有字段的显示名称与类型。
// 保存后写入 localStorage（goodsConfigOverrideKey），商品管理页激活时自动合并生效。
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { goodsPageConfig, goodsConfigOverrideKey } from './common/goodsConfig'
import { mergeConfig } from './common/mergeConfig'
import { clearConfigOverride, loadConfigOverride, saveConfigOverride } from './common/storage'
import type {
  ColumnConfig,
  ColumnType,
  FilterType,
  FormFieldConfig,
  FormFieldType,
  OptionItem,
} from './common/types'

// 可编辑的字段副本（深拷贝，避免污染默认配置对象）
const editColumns = ref<ColumnConfig[]>([])
const editFormFields = ref<FormFieldConfig[]>([])

// ===== 下拉选项：用于筛选类型 / 列渲染 / 表单类型 的选择 =====
// label 均为纯中文，跟中文表头「筛选类型 / 列渲染 / 表单类型」一一对应，
// 视觉上不会出现「英文 label 放在中文表头下」这种不对应的情况。
const filterTypeOptions = [
  { label: '文本（模糊查询）', value: 'input' },
  { label: '下拉（精确匹配）', value: 'select' },
  { label: '数字（精确）', value: 'number' },
  { label: '数字区间', value: 'numberRange' },
  { label: '单日期', value: 'date' },
  { label: '日期区间', value: 'daterange' },
]
const columnTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '标签', value: 'tag' },
  { label: '开关', value: 'switch' },
  { label: '金额', value: 'money' },
  { label: '日期', value: 'date' },
]
const formTypeOptions = [
  { label: '文本输入', value: 'input' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字', value: 'number' },
  { label: '下拉选择', value: 'select' },
  { label: '开关', value: 'switch' },
  { label: '日期', value: 'date' },
  { label: '单选', value: 'radio' },
]

/** 规整：保证 show / filterable 为布尔；columnType / filterType 没显式配置时给一个合理默认（解决对齐问题：保证下拉永远有值可选） */
function normalize(arr: ColumnConfig[]): ColumnConfig[] {
  return arr.map((c) => ({
    ...c,
    show: c.show !== false,
    filterable: c.filterable !== false,
    columnType: c.columnType ?? 'text',
    filterType: c.filterType ?? 'input',
  }))
}

/** 加载可编辑副本：合并默认配置 + 已保存覆盖，再深拷贝并规整布尔值 */
function loadEdit(): void {
  const merged = mergeConfig(goodsPageConfig, loadConfigOverride(goodsConfigOverrideKey))
  editColumns.value = normalize(JSON.parse(JSON.stringify(merged.columns)))
  editFormFields.value = JSON.parse(JSON.stringify(merged.formFields))
}

/** 该字段是否需要配置候选项（下拉 / 标签类） */
function needsOptions(col: ColumnConfig): boolean {
  return col.filterType === 'select' || col.columnType === 'tag'
}

// ===== 表单类型：与 formFields 同 prop 的 type 联动 =====
function formTypeOf(prop: string): string | undefined {
  return editFormFields.value.find((f) => f.prop === prop)?.type
}
function setFormType(prop: string, value: unknown): void {
  const field = editFormFields.value.find((f) => f.prop === prop)
  if (field) field.type = value as FormFieldConfig['type']
}

// ===== 候选项编辑弹窗 =====
const optVisible = ref(false)
const optIndex = ref(-1)
const optText = ref('')

/** 把候选项序列化成「label:value」每行一段的文本 */
function serializeOptions(opts: OptionItem[] | undefined): string {
  if (!opts || opts.length === 0) return ''
  return opts.map((o) => `${o.label}:${o.value}`).join('\n')
}
/** 把「label:value」文本解析回候选项；值能转数字则转数字（如上架状态 1/0） */
function parseOptions(text: string): OptionItem[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':')
      const label = idx === -1 ? line : line.slice(0, idx).trim()
      const raw = idx === -1 ? line : line.slice(idx + 1).trim()
      let value: string | number | boolean = raw
      if (raw !== '' && /^-?\d+(\.\d+)?$/.test(raw)) value = Number(raw)
      return { label, value }
    })
}

function openOptions(index: number): void {
  optIndex.value = index
  optText.value = serializeOptions(editColumns.value[index]?.options)
  optVisible.value = true
}
function saveOptions(): void {
  if (optIndex.value < 0) return
  editColumns.value[optIndex.value].options = parseOptions(optText.value)
  optVisible.value = false
  ElMessage.success('候选项已更新')
}

// ===== 字段新增 / 编辑弹窗 =====
const fieldVisible = ref(false)
const fieldMode = ref<'add' | 'edit'>('add')
const editingIndex = ref(-1)
const fieldForm = reactive({
  prop: '',
  label: '',
  show: true,
  filterable: true,
  filterType: 'input',
  columnType: 'text',
  formType: 'input',
  required: false,
  min: '',
  max: '',
  optionsText: '',
})

/** 弹窗里是否要展示候选项编辑（随筛选类型 / 列渲染联动） */
const fieldNeedsOptions = computed(
  () => fieldForm.filterType === 'select' || fieldForm.columnType === 'tag'
)

function openAddField(): void {
  fieldMode.value = 'add'
  editingIndex.value = -1
  Object.assign(fieldForm, {
    prop: '',
    label: '',
    show: true,
    filterable: true,
    filterType: 'input',
    columnType: 'text',
    formType: 'input',
    required: false,
    min: '',
    max: '',
    optionsText: '',
  })
  fieldVisible.value = true
}

function openEditField(index: number): void {
  fieldMode.value = 'edit'
  editingIndex.value = index
  const col = editColumns.value[index]
  const ff = editFormFields.value.find((f) => f.prop === col.prop)
  Object.assign(fieldForm, {
    prop: col.prop,
    label: col.label,
    show: col.show !== false,
    filterable: col.filterable !== false,
    filterType: col.filterType ?? 'input',
    columnType: col.columnType ?? 'text',
    formType: ff?.type ?? 'input',
    required: ff?.required ?? false,
    min: ff?.min ?? '',
    max: ff?.max ?? '',
    optionsText: serializeOptions(col.options),
  })
  fieldVisible.value = true
}

/** 由弹窗表单构造「列配置 + 表单字段配置」 */
function buildField(): { col: ColumnConfig; ff: FormFieldConfig } {
  const f = fieldForm
  const col: ColumnConfig = {
    prop: f.prop.trim(),
    label: f.label.trim(),
    show: f.show,
    filterable: f.filterable,
    filterType: f.filterType as FilterType,
    columnType: f.columnType as ColumnType,
    minWidth: 140,
  }
  if (fieldNeedsOptions.value) col.options = parseOptions(f.optionsText)
  const ff: FormFieldConfig = {
    prop: f.prop.trim(),
    label: f.label.trim(),
    type: f.formType as FormFieldType,
    required: f.required,
    placeholder: `请输入${f.label.trim()}`,
    span: 12,
  }
  if (fieldNeedsOptions.value) ff.options = col.options
  if (f.min !== '' && !isNaN(Number(f.min))) ff.min = Number(f.min)
  if (f.max !== '' && !isNaN(Number(f.max))) ff.max = Number(f.max)
  return { col, ff }
}

function saveField(): void {
  const f = fieldForm
  if (!f.prop.trim()) {
    ElMessage.warning('请填写字段名（prop）')
    return
  }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(f.prop.trim())) {
    ElMessage.warning('字段名只能为字母/数字/下划线，且以字母或下划线开头')
    return
  }
  if (!f.label.trim()) {
    ElMessage.warning('请填写显示名称')
    return
  }
  // 新增时查重；编辑时若未改 prop 则不视为重复
  const dup = editColumns.value.findIndex(
    (c, i) => c.prop === f.prop.trim() && i !== editingIndex.value
  )
  if (dup >= 0) {
    ElMessage.warning(`字段名「${f.prop.trim()}」已存在`)
    return
  }

  const { col, ff } = buildField()
  if (fieldMode.value === 'add') {
    editColumns.value.push(col)
    editFormFields.value.push(ff)
    ElMessage.success('字段已添加')
  } else {
    const idx = editingIndex.value
    const oldProp = editColumns.value[idx]?.prop
    editColumns.value[idx] = col
    const fi = editFormFields.value.findIndex((x) => x.prop === oldProp)
    if (fi >= 0) editFormFields.value[fi] = ff
    else editFormFields.value.push(ff)
    ElMessage.success('字段已更新')
  }
  fieldVisible.value = false
}

function deleteField(index: number): void {
  const col = editColumns.value[index]
  ElMessageBox.confirm(
    `确认删除字段「${col.label}（${col.prop}）」吗？删除后该字段在商品管理页不再显示。`,
    '提示',
    { type: 'warning' }
  )
    .then(() => {
      editColumns.value.splice(index, 1)
      const fi = editFormFields.value.findIndex((f) => f.prop === col.prop)
      if (fi >= 0) editFormFields.value.splice(fi, 1)
      ElMessage.success('字段已删除')
    })
    .catch(() => {})
}

/** 保存：写入覆盖配置，并提示去商品管理页查看效果 */
function handleSave(): void {
  for (const col of editColumns.value) {
    if (needsOptions(col) && (!col.options || col.options.length === 0)) {
      ElMessage.warning(`字段「${col.label}」是下拉 / 标签类型，但尚未配置候选项，请点击「编辑选项」补充`)
      return
    }
  }
  // 同步候选项到同 prop 的表单字段（下拉 / 单选共用）
  for (const ff of editFormFields.value) {
    const col = editColumns.value.find((c) => c.prop === ff.prop)
    if (col && col.options) ff.options = col.options
  }
  // 保存的是「完整字段列表」，整体替换默认配置，从而支持增删字段
  saveConfigOverride(goodsConfigOverrideKey, {
    columns: editColumns.value,
    formFields: editFormFields.value,
  })
  ElMessage.success('字段配置已保存，切换到「商品管理」页即可生效')
}

/** 重置：清空覆盖，恢复到默认商品字段配置 */
function handleReset(): void {
  ElMessageBox.confirm('将清空所有字段调整，恢复到默认的商品字段配置，确认继续？', '提示', {
    type: 'warning',
  })
    .then(() => {
      clearConfigOverride(goodsConfigOverrideKey)
      loadEdit()
      ElMessage.success('已恢复默认字段配置')
    })
    .catch(() => {})
}

onMounted(loadEdit)
</script>

<template>
  <div class="page">
    <el-card shadow="never" class="hint">
      <span>
        此页用于<strong>动态配置「商品管理」页面的字段</strong>：每个字段的显示名称、是否显示、是否可筛选、
        <strong>筛选类型（下拉 / 文本 / 数字 / 日期…）</strong>、列渲染方式、表单控件类型、候选项都在这里调整；
        还支持<strong>新增 / 删除 / 编辑字段</strong>。保存后切换到「商品管理」页即可生效。
      </span>
    </el-card>

    <el-card shadow="hover" class="editor-card">
      <div class="toolbar">
        <span class="toolbar-title">字段列表（共 {{ editColumns.length }} 个）</span>
        <el-button type="primary" :icon="Plus" @click="openAddField">新增字段</el-button>
      </div>

      <el-table
        :data="editColumns"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#303133',
          fontWeight: '600',
          textAlign: 'center',
          verticalAlign: 'middle',
        }"
        :cell-style="{ verticalAlign: 'middle', padding: '6px 0' }"
      >
        <el-table-column prop="prop" label="字段名" align="center" header-align="center">
          <template #default="{ row }"><code class="prop-code">{{ row.prop }}</code></template>
        </el-table-column>
        <el-table-column label="显示名称"  align="center" header-align="center">
          <template #default="{ row }">
            <el-input v-model="row.label" size="small" placeholder="列标题" />
          </template>
        </el-table-column>
        <el-table-column label="显示列"  align="center" header-align="center">
          <template #default="{ row }"><el-switch v-model="row.show" size="small" /></template>
        </el-table-column>
        <el-table-column label="可筛选"  align="center" header-align="center">
          <template #default="{ row }"><el-switch v-model="row.filterable" size="small" /></template>
        </el-table-column>
        <el-table-column label="筛选类型"  align="center" header-align="center">
          <template #default="{ row }">
            <el-select v-model="row.filterType" size="small" placeholder="请选择" clearable style="width: 100%">
              <el-option v-for="o in filterTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="列渲染"align="center" header-align="center">
          <template #default="{ row }">
            <el-select v-model="row.columnType" size="small" placeholder="请选择" clearable style="width: 100%">
              <el-option v-for="o in columnTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="表单类型" align="center" header-align="center">
          <template #default="{ row }">
            <el-select
              :model-value="formTypeOf(row.prop)"
              size="small"
              placeholder="请选择"
              clearable
              style="width: 100%"
              @update:model-value="(v: unknown) => setFormType(row.prop, v)"
            >
              <el-option v-for="o in formTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="候选项" align="center" header-align="center">
          <template #default="{ $index }">
            <el-button
              size="small"
              :type="needsOptions(editColumns[$index]) ? 'primary' : 'info'"
              :disabled="!needsOptions(editColumns[$index])"
              @click="openOptions($index)"
            >
              编辑选项
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作"  align="center" header-align="center">
          <template #default="{ $index }">
            <el-button size="small" type="primary" link @click="openEditField($index)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteField($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="actions">
        <el-button type="primary" @click="handleSave">保存配置</el-button>
        <el-button @click="handleReset">恢复默认</el-button>
      </div>
    </el-card>

    <!-- 候选项编辑弹窗 -->
    <el-dialog v-model="optVisible" title="编辑候选项" width="480px" append-to-body destroy-on-close>
      <p class="opt-tip">每行一个，格式：<code>显示文字:值</code>（如 <code>上架:1</code>）。值可省略，省略时值等于文字；值为纯数字会自动转成数字。</p>
      <el-input
        v-model="optText"
        type="textarea"
        :rows="10"
        placeholder="电子数码:电子数码&#10;服饰鞋包:服饰鞋包"
      />
      <template #footer>
        <el-button @click="optVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOptions">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字段新增 / 编辑弹窗 -->
    <el-dialog
      v-model="fieldVisible"
      :title="fieldMode === 'add' ? '新增字段' : '编辑字段'"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <el-form label-width="92px" class="field-form">
        <el-form-item label="字段名" required>
          <el-input
            v-model="fieldForm.prop"
            :disabled="fieldMode === 'edit'"
            placeholder="如 color（字母/数字/下划线）"
          />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="fieldForm.label" placeholder="如 颜色" />
        </el-form-item>
        <el-form-item label="显示列">
          <el-switch v-model="fieldForm.show" />
        </el-form-item>
        <el-form-item label="可筛选">
          <el-switch v-model="fieldForm.filterable" />
        </el-form-item>
        <el-form-item label="筛选类型">
          <el-select v-model="fieldForm.filterType" style="width: 100%">
            <el-option v-for="o in filterTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="列渲染">
          <el-select v-model="fieldForm.columnType" style="width: 100%">
            <el-option v-for="o in columnTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="表单类型">
          <el-select v-model="fieldForm.formType" style="width: 100%">
            <el-option v-for="o in formTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="表单必填">
          <el-switch v-model="fieldForm.required" />
        </el-form-item>
        <el-form-item v-if="fieldForm.formType === 'number'" label="数字范围">
          <el-input v-model="fieldForm.min" placeholder="最小" style="width: 90px" />
          <span class="range-sep">~</span>
          <el-input v-model="fieldForm.max" placeholder="最大" style="width: 90px" />
        </el-form-item>
        <el-form-item v-if="fieldNeedsOptions" label="候选项">
          <el-input
            v-model="fieldForm.optionsText"
            type="textarea"
            :rows="5"
            placeholder="每行一个，格式：显示文字:值&#10;上架:1&#10;下架:0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fieldVisible = false">取消</el-button>
        <el-button type="primary" @click="saveField">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  padding: 12px;
  background: #f0f5ff;
}
.hint {
  margin-bottom: 12px;
  border-radius: 10px;
  font-size: 13px;
  color: #5a6b85;
  line-height: 1.7;
}
.hint strong {
  color: #1890ff;
}
.editor-card {
  border-radius: 10px;
  background: #fff;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}
.prop-code {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d63384;
  font-size: 12px;
  word-break: break-all;
}
.opt-tip {
  font-size: 12px;
  color: #909399;
  margin: 0 0 10px;
  line-height: 1.6;
}
.opt-tip code {
  background: #f0f2f5;
  padding: 0 4px;
  border-radius: 3px;
  color: #d63384;
}
.field-form .range-sep {
  margin: 0 8px;
  color: #909399;
}
</style>
