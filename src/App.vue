<script setup lang="ts">
// ===== 根组件：后台管理整体布局（参考图风格：浅蓝顶部 + 深蓝菜单 + 圆角胶囊标签 + 页面缓存）=====
import { reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  User,
  Setting,
  Document,
  HomeFilled,
  Refresh,
  Search,
  FullScreen,
  Bell,
  Setting as SettingIcon,
  Fold,
  Expand,
} from "@element-plus/icons-vue";
import { useRbacStore } from "@/stores/rbac";
import { useTabsStore, type TabItem } from "@/stores/tabs";

const rbac = useRbacStore();
const tabsStore = useTabsStore();
const router = useRouter();
const route = useRoute();

// 左侧菜单折叠状态：true=收起（仅显示图标），false=展开
const collapsed = ref(false);
function toggleMenu() {
  collapsed.value = !collapsed.value;
}

// 菜单 hover 时预热对应页面组件（预加载）：提前 import，切换时无需等待网络分包
function prefetch(page: "user" | "role") {
  const loader =
    page === "user"
      ? () => import("./views/user/UserList.vue")
      : () => import("./views/role/RoleManage.vue");
  loader().catch(() => {});
}

// 应用启动即预请求角色列表：分配角色弹窗打开时可直接使用，无需等待
rbac.fetchRoles();

// 根据路由路径返回对应的标签图标组件
function tabIcon(path: string) {
  if (path === "/user") return User;
  if (path === "/role") return Setting;
  if (path === "/") return HomeFilled;
  return Document;
}

// ===== 页面缓存（keep-alive）配置 =====
// 缓存名单由「路由 meta.keepAlive」统一控制（meta.cacheName 即组件名），
// 不再在各组件里写 defineOptions；动态打开的标签从 tabsStore 取组件名追加。
const cachedNames = computed(() => {
  const base = router
    .getRoutes()
    .filter((r) => r.meta?.keepAlive)
    .map((r) => r.meta?.cacheName as string)
    .filter(Boolean)
  const dynamic = tabsStore.tabs.map((t) => t.name)
  return [...new Set([...base, ...dynamic])]
});
// 当前路由 key = 路径 + 刷新键；刷新按钮会递增 refreshKeys[route.path]，强制当前标签组件重新挂载
const activeKey = computed(
  () => `${route.path}-${tabsStore.refreshKeys[route.path] || 0}`,
);

// ===== 顶部标签栏逻辑 =====
// 点击标签：激活并跳转到对应路由
function gotoTab(tab: TabItem) {
  tabsStore.activePath = tab.path;
  router.push(tab.path);
}

// 点击标签上的 ×：关闭该标签，并按需跳转到相邻标签 / 首页
function closeTab(tab: TabItem) {
  const nav = tabsStore.removeTab(tab.path);
  if (nav) router.push(nav);
}

// 固定“首页”标签：始终展示且不可关闭
const isHomeActive = computed(() => route.path === "/")
function gotoHome() {
  if (route.path !== "/") router.push("/")
}

// 刷新当前标签：递增当前路由的 refreshKey，触发 keep-alive 重新渲染组件
function refreshCurrent() {
  tabsStore.refreshTab(route.path);
}

// ===== 右键上下文菜单 =====
// 右键具体标签弹出操作菜单（关闭当前 / 其他 / 左侧 / 右侧 / 全部）
const ctx = reactive({ visible: false, x: 0, y: 0, targetPath: "" });
function openContextMenu(e: MouseEvent, path: string) {
  ctx.targetPath = path;
  ctx.x = e.clientX;
  ctx.y = e.clientY;
  ctx.visible = true;
}
function closeCtx() {
  ctx.visible = false;
}
function runCtx(action: "current" | "others" | "left" | "right" | "all") {
  const path = ctx.targetPath;
  let nav: string | null = null;
  switch (action) {
    case "current":
      nav = tabsStore.removeTab(path);
      break;
    case "others":
      nav = tabsStore.closeOthers(path);
      break;
    case "left":
      nav = tabsStore.closeLeft(path);
      break;
    case "right":
      nav = tabsStore.closeRight(path);
      break;
    case "all":
      nav = tabsStore.closeAll();
      break;
  }
  ctx.visible = false;
  if (nav) router.push(nav);
}
</script>

<template>
  <!-- 栅格化整体布局：占满全屏；collapsed 控制左侧菜单收起 -->
  <div class="layout" :class="{ collapsed }">
    <!-- 左侧边栏：深蓝背景，跨全高三行 -->
    <aside class="aside">
      <div class="logo">
        <el-icon size="22"><SettingIcon /></el-icon>
        <span>后台管理系统</span>
      </div>
      <el-menu
        router
        :default-active="$route.path"
        class="menu"
        :collapse="collapsed"
        :collapse-transition="false"
      >
        <el-menu-item index="/" @mouseenter="prefetch('user')">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/user" @mouseenter="prefetch('user')">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/role" @mouseenter="prefetch('role')">
          <el-icon><Setting /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧区域：浅蓝渐变顶部标题栏 + 标签栏 + 主内容区 -->
    <div class="right">
      <!-- 顶部标题栏：浅蓝渐变；左侧菜单折叠按钮，右侧工具按钮 -->
      <header class="header">
        <div class="header-left">
          <el-tooltip
            :content="collapsed ? '展开菜单' : '收起菜单'"
            placement="bottom"
          >
            <el-button
              circle
              :icon="collapsed ? Expand : Fold"
              size="small"
              @click="toggleMenu"
            />
          </el-tooltip>
        </div>
        <div class="header-right">
          <el-tooltip content="刷新当前页" placement="bottom">
            <el-button
              circle
              size="small"
              :icon="Refresh"
              @click="refreshCurrent"
            />
          </el-tooltip>
          <el-button circle size="small" :icon="Search" />
          <el-button circle size="small" :icon="Bell" />
          <el-button circle size="small" :icon="FullScreen" />
          <el-button circle size="small" :icon="SettingIcon" />
          <el-avatar :size="28" :icon="User" class="header-avatar" />
        </div>
      </header>

      <!-- 顶部标签栏：圆角胶囊样式；最左侧固定“首页”标签且不可关闭 -->
      <div class="tab-bar">
        <!-- 固定首页标签（始终展示，不可关闭） -->
        <div class="tab-item home-tab" :class="{ active: isHomeActive }" @click="gotoHome">
          <el-icon class="tab-icon"><HomeFilled /></el-icon>
          <span class="tab-title">首页</span>
        </div>

        <!-- 动态打开的页面标签：支持切换 / 关闭 / 右键菜单 -->
        <template v-for="tab in tabsStore.tabs" :key="tab.path">
          <div class="tab-item" :class="{ active: tab.path === tabsStore.activePath }" @click="gotoTab(tab)" @contextmenu.prevent="openContextMenu($event, tab.path)">
            <el-icon class="tab-icon"><component :is="tabIcon(tab.path)" /></el-icon>
            <span class="tab-title">{{ tab.title }}</span>
            <span class="tab-close" title="关闭" @click.stop="closeTab(tab)">×</span>
          </div>
        </template>
        <span v-if="tabsStore.tabs.length === 0" class="tab-empty">暂无其他打开的页面</span>
      </div>

      <!-- 主内容区：keep-alive 缓存已打开的页面，刷新按钮通过 activeKey 强制重渲染 -->
      <main class="main">
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedNames">
            <component :is="Component" :key="activeKey" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>

  <!-- 右键菜单（遮罩用于点击别处关闭菜单） -->
  <div
    v-if="ctx.visible"
    class="ctx-mask"
    @click="closeCtx"
    @contextmenu.prevent="closeCtx"
  >
    <div class="ctx-menu" :style="{ left: ctx.x + 'px', top: ctx.y + 'px' }">
      <div class="ctx-item" @click.stop="runCtx('current')">关闭当前</div>
      <div class="ctx-item" @click.stop="runCtx('others')">关闭其他</div>
      <div class="ctx-item" @click.stop="runCtx('left')">关闭左侧</div>
      <div class="ctx-item" @click.stop="runCtx('right')">关闭右侧</div>
      <div class="ctx-item ctx-danger" @click.stop="runCtx('all')">
        关闭全部
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 整体栅格布局：占满全屏 ===== */
.layout {
  display: grid;
  grid-template-columns: 220px 1fr; /* 左侧 220px + 右侧自适应 */
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
/* 菜单收起时，左侧列宽收窄为 64px */
.layout.collapsed {
  grid-template-columns: 64px 1fr;
}

/* 左侧边栏：深蓝背景；overflow:hidden 防止折叠/展开时文字溢出到右侧内容区 */
.aside {
  background: linear-gradient(180deg, #0d2a4d 0%, #0a1f3d 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.logo {
  height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.08);
}
/* 菜单收起时，logo 只保留图标并居中 */
.layout.collapsed .logo {
  justify-content: center;
  padding: 0;
}
.layout.collapsed .logo span {
  display: none;
}
.menu {
  flex: 1;
  width: 100%;
  border-right: none;
  background: transparent;
  overflow: hidden;
}
.menu :deep(.el-menu-item) {
  color: #c2d5ec;
  height: 46px;
  margin: 4px 10px;
  border-radius: 6px;
}
/* 折叠状态：通过外层 .layout.collapsed 限定（.el-menu--collapse 与 .menu 是同一元素，不能写后代关系） */
.layout.collapsed .menu :deep(.el-menu-item) {
  margin: 4px 6px;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.layout.collapsed .menu :deep(.el-menu-item .el-icon) {
  margin: 0;
}
.layout.collapsed .menu :deep(.el-menu-item span) {
  display: none !important;
}
.menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #1890ff;
}
.menu :deep(.el-icon) {
  color: inherit;
}

/* 右侧区域：纵向 flex */
.right {
  display: flex;
  flex-direction: column;
  background: #f0f5ff;
  overflow: hidden;
}

/* 顶部标题栏：浅蓝渐变；高度 50px */
.header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  flex-shrink: 0;
}
.header-left {
  height: 100%;
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-right :deep(.el-button) {
  background: rgba(255, 255, 255, 0.15);
  border-color: transparent;
  color: #fff;
}
.header-right :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.28);
}
.header-avatar {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  margin-left: 6px;
}

/* 顶部标签栏：圆角胶囊 */
.tab-bar {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  overflow-x: auto;
}
.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: #555;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s;
}
.tab-item:hover {
  color: #1890ff;
  border-color: #b3d8ff;
}
.tab-item.active {
  color: #fff;
  background: #1890ff;
  border-color: #1890ff;
}
.tab-item.active .tab-close {
  color: rgba(255, 255, 255, 0.85);
}
.tab-item.active .tab-close:hover {
  color: #fff;
}
.tab-icon {
  font-size: 13px;
}
.tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
  border-radius: 50%;
  color: #999;
  transition: all 0.2s;
}
.tab-close:hover {
  background: rgba(245, 108, 108, 0.15);
  color: #f56c6c;
}
.tab-empty {
  font-size: 13px;
  color: #aaa;
}

/* 主内容区：去掉默认内边距，由页面自身控制边距，使内容可铺满可见区域 */
.main {
  flex: 1;
  overflow: auto;
  padding: 0;
  background: #f0f5ff;
}

/* 右键菜单 */
.ctx-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
}
.ctx-menu {
  position: fixed;
  z-index: 2001;
  min-width: 120px;
  padding: 4px 0;
  font-size: 13px;
  color: #333;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.ctx-item {
  padding: 7px 18px;
  cursor: pointer;
  white-space: nowrap;
}
.ctx-item:hover {
  background: #f5f7fa;
  color: #1890ff;
}
.ctx-danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
