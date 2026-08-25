<script setup lang="ts">
// ===== 首页：欢迎标语 =====
defineOptions({ name: 'Home' })
// 使用 Element Plus 的栅格（el-row / el-col）做响应式布局，
// 卡片居中展示欢迎语与快捷入口。
import { useRouter } from 'vue-router'

const router = useRouter()

// 快捷跳转到对应业务页（会同步在顶部门签栏打开标签）
function go(path: string) {
  router.push(path)
}
</script>

<template>
  <!-- 占满内容区并垂直水平居中 -->
  <div class="home">
    <el-row justify="center" align="middle" class="home-row">
      <!-- 响应式列宽：小屏占满，大屏收窄居中 -->
      <el-col :xs="22" :sm="18" :md="14" :lg="10">
        <el-card shadow="hover" class="welcome-card">
          <div class="slogan">Study Admin</div>
          <h1 class="title">欢迎使用后台管理系统</h1>
          <p class="subtitle">
            统一管理并展示用户与角色信息，支持角色分配与权限梳理，助力高效运营。
          </p>
          <!-- 快捷入口：栅格两列并排 -->
          <el-row :gutter="16" class="quick">
            <el-col :span="12">
              <el-button type="primary" size="large" @click="go('/user')">
                进入用户管理
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button size="large" @click="go('/role')">进入角色管理</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
/* 占满父容器（App 的 main 栅格区）并居中 */
.home {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.home-row {
  width: 100%;
}
.welcome-card {
  text-align: center;
  border-radius: 12px;
}
.slogan {
  letter-spacing: 2px;
  color: #1890ff;
  font-weight: 700;
  font-size: 14px;
}
.title {
  margin: 8px 0 12px;
  font-size: 26px;
  font-weight: 700;
  color: #1f2d3d;
}
.subtitle {
  margin: 0 0 24px;
  color: #66707a;
  line-height: 1.7;
}
.quick :deep(.el-col) {
  display: flex;
  justify-content: center;
}
.quick .el-button {
  width: 100%;
}
</style>
