// ===== 配置化页面：公共类型定义 =====
// 设计目标：页面的全部结构（列 / 筛选条件 / 按钮 / 表单 / 分页）都由一份 JS 配置描述，
// 页面组件只负责「读配置 → 渲染」，不写死任何业务字段。
// 换一份配置 = 换一个页面，无需改动 ConfigPage.vue。
import type { Component } from 'vue'

/** 一行数据的通用结构（纯前端方案下存 localStorage） */
export type RowData = Record<string, unknown>

/** 下拉框 / 标签的候选项 */
export interface OptionItem {
  label: string
  value: string | number | boolean
  /** tag 渲染时的语义色 */
  type?: 'primary' | 'success' | 'info' | 'warning' | 'danger'
}

/** 筛选控件类型（决定筛选区渲染哪种 Element Plus 组件） */
export type FilterType =
  | 'input' // 文本模糊匹配
  | 'select' // 下拉精确匹配
  | 'date' // 单日期
  | 'daterange' // 日期区间
  | 'number' // 数字精确匹配
  | 'numberRange' // 数字区间（最小值 ~ 最大值）

/** 单元格渲染类型（决定表格里这一格怎么显示） */
export type ColumnType = 'text' | 'tag' | 'switch' | 'money' | 'date'

/** 表格列配置 */
export interface ColumnConfig {
  /** 字段名，对应数据对象的 key */
  prop: string
  /** 列标题 / 筛选条件标签 */
  label: string
  /** 【开关】是否显示该列；false 时表格与筛选区都不会出现 */
  show: boolean
  /**
   * 【开关】是否为该列生成筛选条件。
   * 默认 true —— 也就是「存在的列就可以作为筛选条件」，
   * 显式写 false 才会把该列从筛选区移除。
   */
  filterable?: boolean
  /** 筛选控件类型；不写时按 columnType / options 自动推导 */
  filterType?: FilterType
  /** select 筛选器与 tag 渲染共用的候选项 */
  options?: OptionItem[]
  /** 单元格渲染类型，默认 text */
  columnType?: ColumnType
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  showOverflowTooltip?: boolean
  /** 自定义单元格文本（优先级最高） */
  formatter?: (row: RowData, value: unknown) => string
}

/** 按钮语义色（沿用 Element Plus） */
export type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

/** 快捷修改配置：只改某一个字段，即页面里的「修改」 */
export interface QuickEditConfig {
  /** 要修改的字段 */
  prop: string
  /** 弹窗标题里展示的字段名 */
  label: string
  /** 控件类型 */
  type: 'input' | 'textarea' | 'number' | 'select'
  options?: OptionItem[]
  placeholder?: string
  min?: number
  max?: number
}

/** 按钮配置：show 是该按钮的总开关 */
export interface ActionConfig {
  /** 按钮唯一标识，页面按 key 决定行为（view / edit / delete / 自定义） */
  key: string
  /** 按钮文字 */
  label: string
  /** 【开关】该按钮是否显示 —— 改成 false 按钮立即消失 */
  show: boolean
  type?: ButtonType
  /** 行内操作建议开启，显示为文字按钮 */
  link?: boolean
  plain?: boolean
  /** 图标组件，从 @element-plus/icons-vue 引入后传入 */
  icon?: Component
  /** 是否需要二次确认（删除类必开） */
  confirm?: boolean
  /** 确认文案，支持函数以拿到当前行数据 */
  confirmText?: string | ((row: RowData) => string)
  /** 配置后该按钮走「快捷修改单个字段」弹窗 */
  quickEdit?: QuickEditConfig
}

/** 表单控件类型（新增 / 编辑弹窗） */
export type FormFieldType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'switch'
  | 'date'
  | 'radio'

/** 表单字段配置 */
export interface FormFieldConfig {
  prop: string
  label: string
  type: FormFieldType
  /** 【开关】是否出现在新增 / 编辑表单中，默认 true */
  show?: boolean
  /** 提交时是否必填校验 */
  required?: boolean
  disabled?: boolean
  /** 编辑时禁止修改（如 ISBN 这种唯一标识） */
  disabledOnEdit?: boolean
  placeholder?: string
  options?: OptionItem[]
  defaultValue?: unknown
  min?: number
  max?: number
  step?: number
  /** 24 栅格占格，默认 24（独占一行） */
  span?: number
}

/** 分页配置 */
export interface PaginationConfig {
  /** 【开关】是否显示分页 */
  show: boolean
  defaultPageSize: number
  pageSizes: number[]
}

/** 页面（模块）总配置 */
export interface PageConfig {
  /** 页面 / 表格标题 */
  title: string
  /** 副标题说明，展示在标题右侧 */
  desc?: string
  /** localStorage 的键名 —— 纯前端增删改查的数据就存在这里 */
  storageKey: string
  /** 主键字段名 */
  idField: string
  /** 首次进入时写入缓存的假数据（种子数据） */
  seed: RowData[]
  /** 【开关】是否显示序号列 */
  showIndex?: boolean
  /** 表格列（列的显示 / 筛选由这里控制） */
  columns: ColumnConfig[]
  /** 表格行内操作按钮，每个按钮的显示由各自 show 控制 */
  rowActions: ActionConfig[]
  /** 工具栏按钮：查询 / 重置 / 新增（新增固定显示在筛选条件之后） */
  toolbar: {
    search: ActionConfig
    reset: ActionConfig
    add: ActionConfig
  }
  /** 表格右上角扩展按钮（如「恢复初始数据」） */
  headerActions?: ActionConfig[]
  pagination: PaginationConfig
  dialog: {
    width: string
    labelWidth: string
  }
  /** 新增 / 编辑弹窗的字段 */
  formFields: FormFieldConfig[]
}

/** 筛选值的类型（覆盖所有控件可能的值形态） */
export type FilterValue = string | number | boolean | null | Array<string | number | null>
