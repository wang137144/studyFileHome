import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import ElementPlus from 'unplugin-element-plus/vite'
// import ElementPlusResolver from 'unplugin-vue-components/resolvers/element-plus'

import { resolve } from 'path'
// 引入独立抽出的开发环境代理配置
import proxy from './vite/proxy.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 自动按需加载elementplus组件
    // ElementPlus({}),
    // AutoImport({
    //   resolvers: [
    //     ElementPlusResolver({
    //       importStyle: 'sass',
    //     }),
    //   ],
    // }),
    // Components({
    //   dts: false,
    //   resolvers: [
    //     ElementPlusResolver({
    //       importStyle: 'sass',
    //       themes: ['dark'],
    //     }),
    //   ],
    // }),
    vueDevTools({
      // 1. 组件检查器（点击页面元素定位组件，默认开启）
      componentInspector: {
        toggleButtonVisibility: 'never' // always/never，悬浮按钮是否显示
      },

      // 2. 点击组件时打开的编辑器，默认 code (VSCode)
      launchEditor: 'code', // code / idea / webstorm / codium

      // 3. 非html入口项目（如SSR）专用，注入脚本到指定文件
      appendTo: 'src/main.ts',

      // 4. 生产环境强制关闭（默认true，仅dev启用）
    }),
    vue(),],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173, // 前端开发服务器端口（与后端 8080 区分，避免端口冲突）
    // 开发代理来自独立文件 vite/proxy.ts，集中维护 /api -> 后端 8080 的转发规则
    proxy,
  },
})
