<script setup lang="ts">
// ===== 页面：角色管理（角色增删改查）=====
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
// 角色写操作接口（列表数据走 RBAC store 预请求缓存）
import { saveRole, updateRole, deleteRole } from '@/api/role'
import { useRbacStore } from '@/stores/rbac'
import type { Role } from '@/api/types'

// 角色列表直接使用 RBAC store 缓存
const rbac = useRbacStore()
const { roles } = storeToRefs(rbac)

// 新增/编辑弹窗是否显示
const dialogVisible = ref(false)
// 是否为编辑模式（true=编辑，false=新增）
const isEdit = ref(false)
// 表单数据（编辑时回显，新增时清空）
const form = ref<Partial<Role>>({ roleName: '', roleCode: '', description: '' })

// 确保角色列表就绪（命中缓存则不发请求）
async function loadRoles() {
  await rbac.fetchRoles()
}

// 打开“新增角色”弹窗，清空表单
function openAdd() {
  isEdit.value = false
  form.value = { roleName: '', roleCode: '', description: '' }
  dialogVisible.value = true
}

// 打开“编辑角色”弹窗，回显当前行数据
function openEdit(row: Role) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交：根据 isEdit 决定走新增还是更新
async function submit() {
  if (!form.value.roleName || !form.value.roleCode) {
    ElMessage.warning('角色名称和编码不能为空')
    return
  }
  try {
    // 走到这里说明后端返回成功（code=200，拦截器已放行）
    if (isEdit.value) await updateRole(form.value)
    else await saveRole(form.value)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false
    await rbac.fetchRoles(true) // 强制刷新列表
  } catch {
    // 失败已由全局响应拦截器统一提示，这里无需重复提示
  }
}

// 删除角色：先弹确认框，确认后再调用删除接口
async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.roleName}」吗？`, '提示', { type: 'warning' })
  } catch {
    return // 用户取消，直接返回
  }
  try {
    await deleteRole(row.id as number)
    ElMessage.success('删除成功')
    await rbac.fetchRoles(true)
  } catch {
    // 失败已由全局响应拦截器统一提示
  }
}

// 页面挂载后确保角色数据已就绪（命中缓存则不发请求）
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
    <!-- 角色表格 -->
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

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="440px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" placeholder="如：管理员" />
        </el-form-item>
        <el-form-item label="角色编码">
          <!-- 编辑时编码不可改（编码是唯一标识），故禁用 -->
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
