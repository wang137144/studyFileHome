<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList, assignRoles } from '@/api/user'
import { listRoles } from '@/api/role'
import type { UserVO, Role } from '@/api/types'

const users = ref<UserVO[]>([])
const roles = ref<Role[]>([])
const dialogVisible = ref(false)
const currentUser = ref<UserVO | null>(null)
const checkedRoles = ref<number[]>([])

async function loadUsers() {
  const res = await getUserList()
  if (res.code === 200) users.value = res.data
}

async function loadRoles() {
  const res = await listRoles()
  if (res.code === 200) roles.value = res.data
}

function openAssign(user: UserVO) {
  currentUser.value = user
  checkedRoles.value = (user.roles || []).map((r) => r.id as number)
  dialogVisible.value = true
}

async function submitAssign() {
  if (!currentUser.value?.id) return
  const res = await assignRoles(currentUser.value.id, checkedRoles.value)
  if (res.code === 200) {
    ElMessage.success('角色分配成功')
    dialogVisible.value = false
    await loadUsers()
  } else {
    ElMessage.error(res.message || '分配失败')
  }
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<template>
  <div>
    <el-card>
      <template #header>用户列表（共 {{ users.length }} 人）</template>
      <el-table :data="users" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="title" label="职位" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="education" label="学历" />
        <el-table-column prop="college" label="学院" />
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
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openAssign(row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
