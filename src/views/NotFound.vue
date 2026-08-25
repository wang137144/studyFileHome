<script setup lang="ts">
// ===== 404 页面：路由未匹配时展示 =====
defineOptions({ name: 'NotFound' })
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页（首页不计入标签，等价于清空标签后的落点）
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="notfound">
    <el-result icon="warning" title="404" sub-title="抱歉，您访问的页面不存在或已被移除">
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
/* 占满内容区并居中 */
.notfound {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
