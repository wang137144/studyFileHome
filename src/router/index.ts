// ===== 前端路由配置（Vue Router）=====
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useRbacStore } from '@/stores/rbac'
import { useTabsStore } from '@/stores/tabs'

// 扩展 RouteMeta 类型，声明我们自定义的字段
declare module 'vue-router' {
  interface RouteMeta {
    title?: string // 标签页 / 标题显示文字
    prefetch?: 'users' | 'roles' // 进入页面前的预请求标记
    keepAlive?: boolean // 是否在 App 的 keep-alive 中常驻缓存（受路由统一控制）
    cacheName?: string // 缓存命中的组件名（与 .vue 文件名一致，由 SFC 自动推断）
  }
}

// 路由组件改为动态 import —— 实现按需加载（代码分包），
// Vite 会在父页面加载后自动插入 prefetch，达到“预加载”效果。
const routes: RouteRecordRaw[] = [
  // 根路径直接展示首页（欢迎页），不再重定向到用户管理
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home/Home.vue'),
    meta: { title: '首页', keepAlive: true, cacheName: 'Home' },
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/user/UserList.vue'),
    meta: { title: '用户管理', prefetch: 'users', keepAlive: true, cacheName: 'UserList' },
  },
  {
    path: '/role',
    name: 'role',
    component: () => import('../views/role/RoleManage.vue'),
    meta: { title: '角色管理', prefetch: 'roles', keepAlive: true, cacheName: 'RoleManage' },
  },
  {
    // 商品管理：整页结构由一份 JS 配置渲染，数据存浏览器 localStorage（纯前端增删改查）
    path: '/config',
    name: 'goods',
    component: () => import('../views/config/GoodsManage.vue'),
    meta: { title: '商品管理', keepAlive: true, cacheName: 'GoodsManage' },
  },
  {
    // 配置管理：可视化动态调整书本管理页面的字段类型与行为（配置页控制数据页）
    path: '/config-manage',
    name: 'configManage',
    component: () => import('../views/config/ConfigEditor.vue'),
    meta: { title: '配置管理', keepAlive: true, cacheName: 'ConfigEditor' },
  },
  // 兜底：任何未匹配的路由都展示 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '404', keepAlive: true, cacheName: 'NotFound' },
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

// 路由切换完成后，把访问过的页面记录到顶部标签栏（首页除外）
router.afterEach((to) => {
  useTabsStore().addTab(to)
})

export default router
