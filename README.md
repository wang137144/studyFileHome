# Vue 3 + TypeScript + Vite + Pinia

这是一个基于 **Vue 3**、**TypeScript**、**Vite** 和 **Pinia** 的现代化前端项目模板，集成了 Tailwind CSS v4 和状态持久化功能。

## 📋 技术栈

### 核心框架
- **Vue 3** (^3.5.40) - 渐进式 JavaScript 框架，使用 Composition API (`<script setup>`)
- **TypeScript** (~6.0.2) - 类型安全的 JavaScript 超集
- **Vite** (^8.2.0) - 下一代前端构建工具

### 状态管理
- **Pinia** (^4.0.2) - Vue 官方推荐的状态管理库
- **pinia-plugin-persistedstate** (^4.7.1) - Pinia 状态持久化插件（支持 localStorage/sessionStorage）

### 样式方案
- **Tailwind CSS v4** (^4.3.3) - 实用优先的 CSS 框架（基于 CSS 配置的新版本）
- **PostCSS** (^8.5.26) - CSS 转换工具
- **Autoprefixer** (^10.5.4) - 自动添加浏览器前缀

### 预处理器支持
- **Less** (^4.8.1)
- **Sass (sass-embedded)** (^1.100.0)
- **Stylus** (^0.64.0)

### 开发工具
- **@vitejs/plugin-vue** (^6.0.8) - Vue 3 的 Vite 插件
- **vite-plugin-vue-devtools** (^8.2.1) - Vue DevTools 集成
- **@vueuse/core** (^14.4.0) - Vue 组合式 API 工具库
- **vue-tsc** (^3.3.8) - Vue TypeScript 类型检查

## 🚀 快速开始

### 前置要求
- Node.js >= 18
- npm 或 pnpm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
启动开发服务器（支持热模块替换 HMR）：
```bash
npm run dev
```

### 生产构建
类型检查并构建生产版本：
```bash
npm run build
```

### 预览构建结果
预览生产构建的应用：
```bash
npm run preview
```

## 📁 项目结构

```
├── src/                      # 源代码目录
│   ├── assets/              # 静态资源文件
│   │   ├── hero.png         # 首页展示图片
│   │   ├── vite.svg         # Vite 图标
│   │   └── vue.svg          # Vue 图标
│   ├── components/          # Vue 组件
│   │   └── HelloWorld.vue   # 示例组件
│   ├── stores/              # Pinia 状态管理
│   │   └── user.ts          # 用户状态 store
│   ├── App.vue              # 根组件
│   ├── main.ts              # 应用入口文件
│   └── style.css            # 全局样式（Tailwind CSS）
├── public/                  # 公共静态资源
├── index.html               # HTML 入口文件
├── vite.config.ts           # Vite 配置文件
├── tailwind.config.js       # Tailwind CSS 配置（v4 为空配置）
├── postcss.config.js        # PostCSS 配置
├── tsconfig.json            # TypeScript 主配置
├── tsconfig.app.json        # 应用代码 TS 配置
├── tsconfig.node.json       # Node.js 工具 TS 配置
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
└── package.json             # 项目依赖配置
```

## ⚙️ 配置说明

### Vite 配置特性 ([vite.config.ts](src/vite.config.ts))
- ✅ **路径别名**: `@` 指向 `src` 目录，方便导入模块
- ✅ **Vue DevTools**: 集成开发调试工具，支持：
  - 组件检查器（可配置显示方式）
  - 编辑器集成（VSCode/WebStorm 等）
  - 生产环境自动禁用
- ✅ **Element Plus 准备**: 已预留 Element Plus 自动导入配置（已注释）

### TypeScript 配置 ([tsconfig.json](tsconfig.json))
- ✅ **严格模式**: 启用所有严格类型检查
- ✅ **路径映射**: 支持 `@/*` 导入路径
- ✅ **项目引用**: 分离应用代码和 Node.js 工具的类型配置

### Tailwind CSS v4 特性
- ✅ **基于 CSS 配置**: 使用 `@import "tailwindcss"` 导入
- ✅ **自动内容检测**: 自动扫描项目中的类名使用情况
- ✅ **主题定制**: 通过 CSS 变量在 `style.css` 中自定义主题
- ✅ **暗色模式**: 内置响应式暗色模式支持（通过 `prefers-color-scheme`）

### 环境变量
| 文件 | 说明 |
|------|------|
| `.env.development` | 开发环境: `NODE_ENV='development'` |
| `.env.production` | 生产环境: `NODE_ENV='production'` |

## 🔧 核心功能

### Pinia 状态管理示例 ([stores/user.ts](src/stores/user.ts))

项目包含了一个完整的用户状态管理示例：

```typescript
// 定义用户 Store
export const useUserStore = defineStore('user', {
    state: () => ({
        name: '',
        age: 0,
    }),
    getters: {
        getName(state) { return state.name },
        getAge(state) { return state.age },
    },
    actions: {
        setName(name: string) { this.name = name },
        setAge(age: number) { this.age = age },
    },
})
```

**特性说明**:
- 📦 **TypeScript 支持**: 完整的类型定义和推断
- 🔄 **响应式状态**: 基于 Vue 3 响应式系统
- 💾 **持久化能力**: 可轻松启用状态持久化（需在 defineStore 中添加 `persist: true`）
- 🧩 **模块化管理**: 支持多个 Store 分离业务逻辑

### 应用入口 ([main.ts](src/main.ts))
- 创建 Vue 应用实例
- 初始化 Pinia 并注册持久化插件
- 挂载全局样式（Tailwind CSS）

## 🎨 样式系统

项目使用 **Tailwind CSS v4** 进行样式开发：

### 全局样式变量 ([style.css](src/style.css))
- 自定义颜色变量（文本、背景、边框、强调色等）
- 字体系统配置（无衬线、标题、等宽字体）
- 响应式字体大小调整
- 暗色模式完整适配
- 平滑滚动和抗锯齿优化

### 支持的样式写法
1. **Tailwind 实用类**: `<div class="flex items-center justify-center">`
2. **CSS 变量**: `color: var(--text);`
3. **预处理器**: 支持 Less/Sass/Stylus 语法
4. **作用域样式**: Vue SFC `<style scoped>`

## 🛠️ 开发建议

### 推荐的开发流程
1. 运行 `npm run dev` 启动开发服务器
2. 浏览器访问 `http://localhost:5173`
3. 使用 Vue DevTools 调试组件和状态
4. 修改代码后自动热更新（HMR）

### 添加新的 Pinia Store
1. 在 `src/stores/` 目录创建新文件
2. 使用 `defineStore()` 定义状态、getter 和 action
3. 如需持久化，添加 `persist: true` 选项
4. 在组件中使用 `const store = useXxxStore()`

### 扩展 UI 组件库
项目已预留 Element Plus 集成配置，取消 [vite.config.ts](vite.config.ts) 中的注释即可启用自动按需导入。

## 📚 学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vite 官方文档](https://vite.dev/)
- [Tailwind CSS v4 文档](https://tailwindcss.com/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [VueUse 工具库](https://vueuse.org/)

## 📄 许可证

MIT License

---

**提示**: 本项目基于 Vue 3 + TypeScript + Vite 模板创建，已集成现代化的开发工具链和最佳实践。适合作为新项目的起点或学习参考。