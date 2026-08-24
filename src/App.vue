<script setup lang="ts">
// ===== 根组件：后台管理整体布局 =====
import { onMounted } from 'vue'
import { useRbacStore } from '@/stores/rbac'

const rbac = useRbacStore()

// 菜单 hover 时预热对应页面组件（预加载）：
// 提前触发动态 import，用户真正点击切换时已无需等待分包网络加载。
function prefetch(page: 'user' | 'role') {
  const loader =
    page === 'user'
      ? () => import('./views/UserList.vue')
      : () => import('./views/RoleManage.vue')
  loader().catch(() => {})
}

// 应用启动即预请求角色列表：分配角色弹窗打开时可直接使用，无需等待
onMounted(() => {
  rbac.fetchRoles()
})
</script>

<template>
  <!-- Element Plus 容器布局：左侧菜单 + 右侧内容区 -->
  <el-container class="layout">
    <!-- 左侧边栏：Logo + 导航菜单 -->
    <el-aside width="200px" class="aside">
      <div class="logo">后台管理系统</div>
      <!--
        el-menu 开启 router 模式后，点击菜单项会把 index 当作路由路径自动跳转；
        default-active 绑定当前路由地址，使刷新 / 直接进入时高亮项依然正确；
        mouseenter 触发对应页面组件的预热（预加载）。
      -->
      <el-menu router :default-active="$route.path" class="menu">
        <el-menu-item index="/user" @mouseenter="prefetch('user')">用户管理</el-menu-item>
        <el-menu-item index="/role" @mouseenter="prefetch('role')">角色管理</el-menu-item>
      </el-menu>
    </el-aside>
    <!-- 右侧：顶部标题栏 + 主内容区 -->
    <el-container>
      <el-header class="header">Study Admin · 用户与角色管理</el-header>
      <el-main>
        <!-- 路由出口：根据访问的 URL 渲染对应的页面组件 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 整体占满视口高度 */
.layout {
  height: 100vh;
}
/* 深色侧边栏背景 */
.aside {
  background: #001529;
}
/* 系统标题文字 */
.logo {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  padding: 18px 16px;
}
/* 菜单透明背景，贴合深色侧边栏 */
.menu {
  border-right: none;
  background: #001529;
}
/* 菜单项默认文字颜色 */
.menu :deep(.el-menu-item) {
  color: #cfd8e3;
}
/* 选中态高亮 */
.menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #1890ff;
}
/* 顶部标题栏样式 */
.header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}
</style>
