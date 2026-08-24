// ===== RBAC 数据缓存 Store（承载数据预请求，避免重复拉取）=====
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listRoles } from '@/api/role'
import { getUserList } from '@/api/user'
import type { Role, UserVO } from '@/api/types'

export const useRbacStore = defineStore('rbac', () => {
  // ===== 状态 =====
  const roles = ref<Role[]>([])       // 角色列表缓存（分配弹窗可选项）
  const users = ref<UserVO[]>([])     // 用户列表缓存
  const rolesLoaded = ref(false)      // 角色是否已成功加载（用于去重）
  const usersLoaded = ref(false)      // 用户是否已成功加载（用于去重）

  // ===== 预请求 / 拉取角色列表 =====
  // force=true 时忽略缓存强制刷新（如新增 / 删除角色之后）
  async function fetchRoles(force = false) {
    if (rolesLoaded.value && !force) return roles.value
    try {
      const res = await listRoles()
      // 拦截器已保证 code===200 才放行，这里直接取 data
      if (res.code === 200) {
        roles.value = res.data
        rolesLoaded.value = true
      }
    } catch {
      // 错误已由全局响应拦截器统一提示，这里仅阻止异常向上冒泡
    }
    return roles.value
  }

  // ===== 预请求 / 拉取用户列表 =====
  async function fetchUsers(force = false) {
    if (usersLoaded.value && !force) return users.value
    try {
      const res = await getUserList()
      if (res.code === 200) {
        users.value = res.data
        usersLoaded.value = true
      }
    } catch {
      // 错误已由全局响应拦截器统一提示
    }
    return users.value
  }

  return { roles, users, rolesLoaded, usersLoaded, fetchRoles, fetchUsers }
})
