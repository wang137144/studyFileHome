import { createApp } from 'vue'
import { createPinia } from 'pinia' // 引入pinia
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // 引入pinia插件
import './style.css'
import App from './App.vue'

const pinia = createPinia() // 创建pinia实例
pinia.use(piniaPluginPersistedstate) // 注册pinia插件
createApp(App).use(pinia).mount('#app')
