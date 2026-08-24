<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listRoles, saveRole, updateRole, deleteRole } from '@/api/role'
import type { Role } from '@/api/types'

const roles = ref<Role[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<Role>>({ roleName: '', roleCode: '', description: '' })

async function loadRoles() {
  const res = await listRoles()
  if (res.code === 200) roles.value = res.data
}

function openAdd() {
  isEdit.value = false
  form.value = { roleName: '', roleCode: '', description: '' }
  dialogVisible.value = true
}

function openEdit(row: Role) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function submit() {
  if (!form.value.roleName || !form.value.roleCode) {
    ElMessage.warning('角色名称和编码不能为空')
    return
  }
  const res = isEdit.value ? await updateRole(form.value) : await saveRole(form.value)
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false
    await loadRoles()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.roleName}」吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  const res = await deleteRole(row.id as number)
  if (res.code === 200) {
    ElMessage.success('删除成功')
    await loadRoles()
  } else {
    ElMessage.error(res.message || '删除失败')
  }
}

onMounted(loadRoles)
</script>

<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>角色管理</span>
        <el-button type="primary" @click="openAdd">新增角色</el-button>
      </div>
    </template>
    <el-table :data="roles" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="roleName" label="角色名称" />
      <el-table-column prop="roleCode" label="角色编码" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="440px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" placeholder="如：管理员" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="form.roleCode" placeholder="如：ADMIN（唯一）" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
