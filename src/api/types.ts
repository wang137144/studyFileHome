// 后端统一响应结构（com.example.demo01.common.ApiResponse）
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 角色（对应后端 sys_role）
export interface Role {
  id?: number
  roleName: string
  roleCode: string
  description?: string
  createTime?: string
}

// 用户视图对象（对应后端 UserVO，在 user_info 基础上附加 roles）
export interface UserVO {
  id?: number
  name?: string
  title?: string
  phone?: string
  education?: string
  logy?: string
  college?: string
  roles?: Role[]
}
