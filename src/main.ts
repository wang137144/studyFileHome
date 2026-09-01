// ===== 应用入口文件 =====
// 引入 Vue 核心 API
import { createApp } from 'vue'
// 引入 Pinia（Vue 官方推荐的状态管理库）
import { createPinia } from 'pinia'
// 引入 Pinia 持久化插件（可将 store 中的数据自动存到 localStorage）
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 引入 Element Plus 组件库及它的全套全局样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入项目全局基础样式
import './style.css'
// 引入前端路由配置
import router from './router'
// 引入根组件
import App from './App.vue'

// 1. 创建 Pinia 实例
const pinia = createPinia()
// 2. 注册持久化插件（让 user 等 store 支持本地存储）
pinia.use(piniaPluginPersistedstate)

// 3. 创建 Vue 应用：挂载 Pinia → 挂载 Element Plus → 渲染到 index.html 的 #app 节点
createApp(App).use(pinia).use(ElementPlus).use(router).mount('#app')
