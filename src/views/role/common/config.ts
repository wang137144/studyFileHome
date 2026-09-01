// ===== 角色管理页面专用配置（仅本页面使用，不对外共享）=====
import type { Role } from '@/api/types'

// 搜索区占位符配置
export const searchConfig = {
  keywordPlaceholder: '角色名称 / 编码',
}

// 表格列定义（带 slot 的列使用自定义模板渲染：operation = 操作列）
export interface TableColumn {
  prop?: keyof Role
  label: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  slot?: 'operation'
}

export const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60, align: 'center' },
  { prop: 'roleName', label: '角色名称', minWidth: 140 },
  { prop: 'roleCode', label: '角色编码', minWidth: 120 },
  { prop: 'description', label: '描述', minWidth: 180, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', minWidth: 160 },
  { slot: 'operation', label: '操作', minWidth: 150, align: 'center' },
]

// 弹窗表单结构（仅含角色管理关心的字段），供页面与配置共享类型
export interface RoleForm {
  roleName: string
  roleCode: string
  description: string
}

// 新增 / 编辑弹窗字段配置
export interface DialogField {
  prop: keyof RoleForm
  label: string
  type: 'input' | 'textarea'
  placeholder?: string
  disabledWhenEdit?: boolean
}

export const dialogFields: DialogField[] = [
  { prop: 'roleName', label: '角色名称', type: 'input', placeholder: '如：管理员' },
  { prop: 'roleCode', label: '角色编码', type: 'input', placeholder: '如：ADMIN（唯一）', disabledWhenEdit: true },
  { prop: 'description', label: '描述', type: 'textarea' },
]
