import request from './request'
import type { ApiResponse, Role } from './types'

// 角色列表
export function listRoles() {
  return request.get('/role/list') as Promise<ApiResponse<Role[]>>
}

// 新增角色
export function saveRole(data: Partial<Role>) {
  return request.post('/role/save', data) as Promise<ApiResponse<null>>
}

// 更新角色
export function updateRole(data: Partial<Role>) {
  return request.put('/role/update', data) as Promise<ApiResponse<null>>
}

// 删除角色
export function deleteRole(id: number) {
  return request.delete(`/role/delete/${id}`) as Promise<ApiResponse<null>>
}
