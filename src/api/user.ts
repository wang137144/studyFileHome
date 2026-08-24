// ===== 用户相关接口（用户管理 + 用户角色分配）=====
import request from '../utils/request'
import type { ApiResponse, UserVO, Role } from './types'

// 查询所有用户及其角色（GET /user/role/users）
export function getUserList() {
  return request.get('/user/role/users') as Promise<ApiResponse<UserVO[]>>
}

// 查询某个用户拥有的角色（GET /user/role/{userId}）
export function getUserRoles(userId: number) {
  return request.get(`/user/role/${userId}`) as Promise<ApiResponse<Role[]>>
}

// 给用户分配角色（POST /user/role/assign，覆盖式：传哪些角色就设为哪些）
// userId：用户ID；roleIds：要分配的角色ID数组
export function assignRoles(userId: number, roleIds: number[]) {
  return request.post('/user/role/assign', { userId, roleIds }) as Promise<ApiResponse<null>>
}

// 移除用户某个角色（DELETE /user/role/{userId}/{roleId}）
export function removeRole(userId: number, roleId: number) {
  return request.delete(`/user/role/${userId}/${roleId}`) as Promise<ApiResponse<null>>
}
