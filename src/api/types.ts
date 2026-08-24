// ===== 前后端共用 TypeScript 类型定义 =====

// 后端统一响应结构（对应 com.example.demo01.common.ApiResponse）
// code=200 表示成功，data 为业务数据，message 为提示信息
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 角色实体（对应后端 sys_role 表）
export interface Role {
  id?: number // 主键，新增时后端自增返回
  roleName: string // 角色名称，如“管理员”
  roleCode: string // 角色编码，如“ADMIN”，全局唯一
  description?: string // 角色描述
  createTime?: string // 创建时间（后端 DATETIME，前端以字符串展示）
}

// 用户视图对象（对应后端 UserVO：在 user_info 字段基础上附加 roles）
export interface UserVO {
  id?: number
  name?: string // 姓名
  title?: string // 职位
  phone?: string // 电话
  education?: string // 学历
  logy?: string // 研究方向/领域（原表字段）
  college?: string // 学院
  roles?: Role[] // 该用户拥有的角色列表（多对多）
}
