// ===== 角色管理相关接口 =====
import request from '../utils/request'
import type { ApiResponse, Role } from './types'

// 角色列表（GET /role/list）
export function listRoles() {
  return request.get('/role/list') as Promise<ApiResponse<Role[]>>
}

// 新增角色（POST /role/save，body 为角色信息）
export function saveRole(data: Partial<Role>) {
  return request.post('/role/save', data) as Promise<ApiResponse<null>>
}

// 更新角色（PUT /role/update，body 需带 id）
export function updateRole(data: Partial<Role>) {
  return request.put('/role/update', data) as Promise<ApiResponse<null>>
}

// 删除角色（DELETE /role/delete/{id}，会同时清理该角色的用户关联）
export function deleteRole(id: number) {
  return request.delete(`/role/delete/${id}`) as Promise<ApiResponse<null>>
}
