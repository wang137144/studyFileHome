// ===== 多标签页（Tab）状态管理 =====
// 用于记录左侧菜单打开过的路由页面，顶部以标签形式展示，支持切换 / 关闭 / 右键关闭全部。
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

// 单个标签的数据结构
export interface TabItem {
  path: string // 路由路径，作为唯一标识
  name: string // 路由 name（兜底用路径）
  title: string // 标签显示文字
}

export const useTabsStore = defineStore('tabs', () => {
  // 已打开的标签列表（首页不计入）
  const tabs = ref<TabItem[]>([])
  // 当前激活标签的路径；在首页时为空字符串
  const activePath = ref('')
  // 每个路由页面对应的“刷新键”：key 变化会触发 keep-alive 组件重新渲染，达到刷新效果
  const refreshKeys = ref<Record<string, number>>({})

  // 打开 / 切换到某个路由页：非首页才会被加入标签栏
  function addTab(route: RouteLocationNormalized) {
    const path = route.path
    // 首页（/）作为兜底面板，不参与标签，仅清空高亮
    if (path === '/') {
      activePath.value = ''
      return
    }
    const title = (route.meta?.title as string) || path
    const name = typeof route.name === 'string' ? route.name : path
    if (!tabs.value.some((t) => t.path === path)) {
      tabs.value.push({ path, name, title })
    }
    activePath.value = path
  }

  // 关闭单个标签；返回需要跳转的路径（相邻标签 / 首页 '/' / 无需跳转则 null）
  function removeTab(path: string): string | null {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return null
    tabs.value.splice(idx, 1)
    // 关闭的恰好是当前激活页，需要切换到其它标签；若已全部关闭则回到首页
    if (activePath.value === path) {
      if (tabs.value.length > 0) {
        const next = tabs.value[Math.min(idx, tabs.value.length - 1)]
        activePath.value = next.path
        return next.path
      }
      activePath.value = ''
      return '/' // 全部关闭 → 回到首页
    }
    return null
  }

  // 关闭所有标签，并回到首页
  function closeAll(): string {
    tabs.value = []
    activePath.value = ''
    return '/'
  }

  // 关闭“除指定标签外”的所有标签；返回需要跳转的路径（始终定位到该标签）
  function closeOthers(path: string): string | null {
    const keep = tabs.value.find((t) => t.path === path)
    if (!keep) return null
    tabs.value = tabs.value.filter((t) => t.path === path)
    activePath.value = path
    return path
  }

  // 关闭“指定标签左侧”的所有标签；若激活页落在被关闭范围内，则跳转到该标签
  function closeLeft(path: string): string | null {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx <= 0) return null // 已是最左或不存在，无需操作
    const removed = tabs.value.slice(0, idx)
    tabs.value = tabs.value.slice(idx)
    if (removed.some((t) => t.path === activePath.value)) {
      activePath.value = path
      return path
    }
    return null
  }

  // 关闭“指定标签右侧”的所有标签；若激活页落在被关闭范围内，则跳转到该标签
  function closeRight(path: string): string | null {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1 || idx === tabs.value.length - 1) return null // 已是最右或不存在
    const removed = tabs.value.slice(idx + 1)
    tabs.value = tabs.value.slice(0, idx + 1)
    if (removed.some((t) => t.path === activePath.value)) {
      activePath.value = path
      return path
    }
    return null
  }

  // 刷新指定路由页面：递增 refreshKey，配合 keep-alive 让当前标签组件重新挂载并拉取最新数据
  function refreshTab(path: string) {
    refreshKeys.value[path] = (refreshKeys.value[path] || 0) + 1
  }

  return { tabs, activePath, refreshKeys, addTab, removeTab, closeAll, closeOthers, closeLeft, closeRight, refreshTab }
})
