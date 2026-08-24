import request from './request'
import type { ApiResponse, UserVO, Role } from './types'

// 查询所有用户及其角色
export function getUserList() {
  return request.get('/user/role/users') as Promise<ApiResponse<UserVO[]>>
}

// 查询某用户拥有的角色
export function getUserRoles(userId: number) {
  return request.get(`/user/role/${userId}`) as Promise<ApiResponse<Role[]>>
}

// 给用户分配角色（覆盖式）
export function assignRoles(userId: number, roleIds: number[]) {
  return request.post('/user/role/assign', { userId, roleIds }) as Promise<ApiResponse<null>>
}

// 移除用户某个角色
export function removeRole(userId: number, roleId: number) {
  return request.delete(`/user/role/${userId}/${roleId}`) as Promise<ApiResponse<null>>
}
