<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import UserList from './views/UserList.vue'
import RoleManage from './views/RoleManage.vue'

type ViewKey = 'user' | 'role'
const active = ref<ViewKey>('user')
const currentView = shallowRef<typeof UserList>(UserList)

function handleSelect(index: string) {
  active.value = index as ViewKey
  currentView.value = index === 'role' ? RoleManage : UserList
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="200px" class="aside">
      <div class="logo">后台管理系统</div>
      <el-menu :default-active="active" @select="handleSelect" class="menu">
        <el-menu-item index="user">用户管理</el-menu-item>
        <el-menu-item index="role">角色管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">Study Admin · 用户与角色管理</el-header>
      <el-main>
        <component :is="currentView" />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: #001529;
}
.logo {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  padding: 18px 16px;
}
.menu {
  border-right: none;
  background: #001529;
}
.menu :deep(.el-menu-item) {
  color: #cfd8e3;
}
.menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #1890ff;
}
.header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}
</style>
