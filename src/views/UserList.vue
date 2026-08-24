<script setup lang="ts">
// ===== 页面：用户列表（展示全部用户 + 分配角色）=====
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
// 接口：分配角色（列表数据走 RBAC store 预请求缓存）
import { assignRoles } from '@/api/user'
import { useRbacStore } from '@/stores/rbac'
import type { UserVO } from '@/api/types'

// 直接使用 RBAC store 中的缓存（用户列表 / 角色列表），避免重复请求
const rbac = useRbacStore()
const { users, roles } = storeToRefs(rbac)

// 分配角色弹窗是否显示
const dialogVisible = ref(false)
// 当前正在分配角色的目标用户
const currentUser = ref<UserVO | null>(null)
// 弹窗里被选中的角色ID集合
const checkedRoles = ref<number[]>([])

// 确保用户列表就绪（路由守卫 / 应用启动已预请求，命中缓存则不再发请求）
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
    // 走到这里说明后端返回成功（code=200，拦截器已放行）
    await assignRoles(currentUser.value.id, checkedRoles.value)
    ElMessage.success('角色分配成功')
    dialogVisible.value = false
    await rbac.fetchUsers(true) // 强制刷新，更新角色标签
  } catch {
    // 失败已由全局响应拦截器统一提示，这里无需重复提示
  }
}

// 页面挂载后确保用户数据已就绪（命中缓存则不发请求）
onMounted(loadUsers)
</script>

<template>
  <div>
    <el-card>
      <template #header>用户列表（共 {{ users.length }} 人）</template>
      <!-- 用户表格：展示 user_info 字段 + 角色标签 + 操作 -->
      <el-table :data="users" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="title" label="职位" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="education" label="学历" />
        <el-table-column prop="college" label="学院" />
        <!-- 角色列：用 el-tag 展示该用户拥有的每个角色 -->
        <el-table-column label="角色">
          <template #default="{ row }">
            <el-tag
              v-for="r in (row.roles || [])"
              :key="r.id"
              type="primary"
              style="margin-right: 4px"
            >
              {{ r.roleName }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #999">未分配</span>
          </template>
        </el-table-column>
        <!-- 操作列：打开分配角色弹窗 -->
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openAssign(row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配角色弹窗：复选框选择该用户拥有的角色 -->
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
