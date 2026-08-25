<script setup lang="ts">
// ===== 页面：用户列表（展示全部用户 + 分配角色）=====
// 组件名用于 keep-alive 缓存匹配
defineOptions({ name: 'UserList' })

import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { User, Search, RefreshRight } from '@element-plus/icons-vue'
import { assignRoles } from '@/api/user'
import { useRbacStore } from '@/stores/rbac'
import type { UserVO } from '@/api/types'

// 直接使用 RBAC store 中的缓存（用户列表 / 角色列表），避免重复请求
const rbac = useRbacStore()
const { users, roles } = storeToRefs(rbac)

// 搜索区状态
const keyword = ref('')
const selectedRoleId = ref<number | ''>('')
const showMore = ref(false)

// 根据关键词 / 角色筛选用户（前端过滤，减少无效请求）
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchKeyword =
      !keyword.value ||
      (u.name && u.name.includes(keyword.value)) ||
      (u.phone && u.phone.includes(keyword.value))
    const matchRole =
      selectedRoleId.value === '' ||
      (u.roles || []).some((r) => r.id === selectedRoleId.value)
    return matchKeyword && matchRole
  })
})

// 分配角色弹窗
const dialogVisible = ref(false)
const currentUser = ref<UserVO | null>(null)
const checkedRoles = ref<number[]>([])

// 确保用户列表就绪（命中缓存则不再发请求）
async function loadUsers() {
  await rbac.fetchUsers()
}

// 打开“分配角色”弹窗，默认勾选该用户已有的角色
function openAssign(user: UserVO) {
  currentUser.value = user
  checkedRoles.value = (user.roles || []).map((r) => r.id as number)
  dialogVisible.value = true
}

// 提交角色分配（覆盖式保存）
async function submitAssign() {
  if (!currentUser.value?.id) return
  try {
    await assignRoles(currentUser.value.id, checkedRoles.value)
    ElMessage.success('角色分配成功')
    dialogVisible.value = false
    await rbac.fetchUsers(true) // 强制刷新，更新角色标签
  } catch {
    // 失败已由全局响应拦截器统一提示
  }
}

// 搜索 / 重置
function handleSearch() {
  // 前端过滤已实时生效，这里预留接口搜索扩展点
  ElMessage.success(`已筛选出 ${filteredUsers.value.length} 条记录`)
}
function handleReset() {
  keyword.value = ''
  selectedRoleId.value = ''
}

// 页面挂载后确保用户数据已就绪（命中缓存则不发请求）
onMounted(loadUsers)
</script>

<template>
  <div class="page">
    <!-- 搜索区：参考图白色卡片 + 查询重置按钮 -->
    <el-card shadow="hover" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="姓名 / 电话"
            clearable
            :prefix-icon="Search"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedRoleId" placeholder="请选择角色" clearable style="width: 180px">
            <el-option
              v-for="r in roles"
              :key="r.id"
              :label="r.roleName"
              :value="r.id as number"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="showMore" label="学历">
          <el-input v-model="keyword" placeholder="占位：可扩展学历筛选" style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
          <el-button text type="primary" @click="showMore = !showMore">
            {{ showMore ? '收起' : '展开' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区 -->
    <el-card shadow="hover" class="toolbar-card">
      <div class="toolbar">
        <el-button type="primary" :icon="User">新增用户</el-button>
        <el-button>批量分配</el-button>
      </div>
    </el-card>

    <!-- 数据表格区：空状态显示“暂无数据” -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">用户列表</span>
          <span class="table-count">共 {{ filteredUsers.length }} 人</span>
        </div>
      </template>
      <el-table
        :data="filteredUsers"
        stripe
        highlight-current-row
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="姓名" min-width="110" />
        <el-table-column prop="title" label="职位" min-width="110" />
        <el-table-column prop="phone" label="电话" min-width="130" />
        <el-table-column prop="education" label="学历" min-width="90" />
        <el-table-column prop="college" label="学院" min-width="150" />
        <el-table-column label="角色" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-for="r in (row.roles || [])"
              :key="r.id"
              type="primary"
              size="small"
              effect="light"
              style="margin-right: 4px"
            >
              {{ r.roleName }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #999">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="110" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openAssign(row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配角色弹窗 -->
    <el-dialog v-model="dialogVisible" title="分配角色" width="420px">
      <div v-if="currentUser" style="margin-bottom: 8px">
        当前用户：{{ currentUser.name }}（ID: {{ currentUser.id }}）
      </div>
      <el-checkbox-group v-model="checkedRoles">
        <el-checkbox
          v-for="r in roles"
          :key="r.id"
          :value="r.id as number"
          :label="r.roleName"
        >
          {{ r.roleName }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  padding: 12px;
  background: #f0f5ff;
}
.search-card,
.toolbar-card,
.table-card {
  border-radius: 10px;
  background: #fff;
}
.toolbar-card,
.table-card {
  margin-top: 12px;
}
.search-form {
  margin-bottom: -18px;
}
.toolbar {
  display: flex;
  gap: 10px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-title {
  font-weight: 600;
  font-size: 15px;
}
.table-count {
  font-size: 13px;
  color: #909399;
}
</style>
