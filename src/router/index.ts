// ===== 前端路由配置（Vue Router）=====
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useRbacStore } from '@/stores/rbac'

// 扩展 RouteMeta 类型，声明我们自定义的预请求标记
declare module 'vue-router' {
  interface RouteMeta {
    prefetch?: 'users' | 'roles'
  }
}

// 路由组件改为动态 import —— 实现按需加载（代码分包），
// Vite 会在父页面加载后自动插入 prefetch，达到“预加载”效果。
const routes: RouteRecordRaw[] = [
  // 访问根路径时默认重定向到用户管理页，避免空白页
  { path: '/', redirect: '/user' },
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/UserList.vue'),
    meta: { title: '用户管理', prefetch: 'users' },
  },
  {
    path: '/role',
    name: 'role',
    component: () => import('../views/RoleManage.vue'),
    meta: { title: '角色管理', prefetch: 'roles' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：进入页面之前，预先请求该页所需数据（数据预请求）。
// 页面组件挂载时可直接使用缓存，减少白屏等待。
router.beforeEach(async (to) => {
  const rbac = useRbacStore()
  if (to.meta.prefetch === 'users') await rbac.fetchUsers()
  if (to.meta.prefetch === 'roles') await rbac.fetchRoles()
  return true
})

export default router
