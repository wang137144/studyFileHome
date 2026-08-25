<script setup lang="ts">
// ===== 页面：角色管理（角色增删改查）=====
// 组件名用于 keep-alive 缓存匹配
defineOptions({ name: 'RoleManage' })

import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { Plus, Search, RefreshRight, Edit, Delete } from '@element-plus/icons-vue'
import { saveRole, updateRole, deleteRole } from '@/api/role'
import { useRbacStore } from '@/stores/rbac'
import type { Role } from '@/api/types'

// 角色列表直接使用 RBAC store 缓存
const rbac = useRbacStore()
const { roles } = storeToRefs(rbac)

// 搜索区
const keyword = ref('')

// 按名称 / 编码筛选
const filteredRoles = computed(() => {
  if (!keyword.value) return roles.value
  const k = keyword.value.toLowerCase()
  return roles.value.filter(
    (r) =>
      (r.roleName && r.roleName.toLowerCase().includes(k)) ||
      (r.roleCode && r.roleCode.toLowerCase().includes(k))
  )
})

// 新增/编辑弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<Role>>({ roleName: '', roleCode: '', description: '' })

// 确保角色列表就绪（命中缓存则不发请求）
async function loadRoles() {
  await rbac.fetchRoles()
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
  try {
    if (isEdit.value) await updateRole(form.value)
    else await saveRole(form.value)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false
    await rbac.fetchRoles(true)
  } catch {
    // 失败已由全局响应拦截器统一提示
  }
}

async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.roleName}」吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteRole(row.id as number)
    ElMessage.success('删除成功')
    await rbac.fetchRoles(true)
  } catch {
    // 失败已由全局响应拦截器统一提示
  }
}

// 搜索 / 重置
function handleSearch() {
  ElMessage.success(`已筛选出 ${filteredRoles.value.length} 条记录`)
}
function handleReset() {
  keyword.value = ''
}

onMounted(loadRoles)
</script>

<template>
  <div class="page">
    <!-- 搜索区 -->
    <el-card shadow="hover" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="角色名称 / 编码"
            clearable
            :prefix-icon="Search"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区 -->
    <el-card shadow="hover" class="toolbar-card">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="openAdd">新增角色</el-button>
      </div>
    </el-card>

    <!-- 数据表格区 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">角色管理</span>
          <span class="table-count">共 {{ filteredRoles.length }} 条</span>
        </div>
      </template>
      <el-table
        :data="filteredRoles"
        stripe
        highlight-current-row
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="roleName" label="角色名称" min-width="140" />
        <el-table-column prop="roleCode" label="角色编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :icon="Edit" @click="openEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑角色弹窗 -->
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
