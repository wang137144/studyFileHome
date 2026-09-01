// ===== 用户管理页面专用配置（仅本页面使用，不对外共享）=====
import type { UserVO } from '@/api/types'

// 搜索区占位符配置
export const searchConfig = {
  keywordPlaceholder: '姓名 / 电话',
  rolePlaceholder: '请选择角色',
}

// 表格列定义（带 slot 的列使用自定义模板渲染：roles = 角色标签，operation = 操作列）
export interface TableColumn {
  prop?: keyof UserVO
  label: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  slot?: 'roles' | 'operation'
}

export const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60, align: 'center' },
  { prop: 'name', label: '姓名', minWidth: 110 },
  { prop: 'title', label: '职位', minWidth: 110 },
  { prop: 'phone', label: '电话', minWidth: 130 },
  { prop: 'education', label: '学历', minWidth: 90 },
  { prop: 'college', label: '学院', minWidth: 150 },
  { slot: 'roles', label: '角色', minWidth: 160 },
  { slot: 'operation', label: '操作', minWidth: 110, align: 'center' },
]

// 分配角色弹窗配置
export const assignDialogConfig = {
  title: '分配角色',
  width: '420px',
}
