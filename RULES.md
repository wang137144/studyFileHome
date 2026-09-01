# 用户规则（User Rules）

> 本项目（Vue 3 + TypeScript + Vite + Pinia）的工程开发规范，面向开发者的可执行规则。所有规则均为强制项（MUST）或建议项（SHOULD），提交代码前请逐条自查。

## 1. 语言与框架规范

- **MUST** 使用 Vue 3 Composition API 的 `<script setup lang="ts">` 语法编写组件，禁止使用 Options API。
- **MUST** 所有 `.vue` / `.ts` 文件使用 TypeScript，禁止使用 `any`（严格模式 `tsconfig` 已开启 `strict`、`noUnusedLocals`、`noUnusedParameters`）。
- **MUST** 模块导入统一使用路径别名 `@/`（指向 `src/`），禁止使用相对路径长链（如 `../../../`）。
- **SHOULD** 组件文件使用 PascalCase 命名（`HelloWorld.vue`），非组件文件使用 camelCase（`user.ts`）。
- **MUST** 构建前运行 `npm run build`（含 `vue-tsc -b` 类型检查），存在类型错误禁止提交。

## 2. 状态管理规范（Pinia）

- **MUST** 业务状态集中在 `src/stores/` 下，通过 `defineStore()` 定义，禁止在组件内散落全局共享状态。
- **MUST** 命名遵循 `useXxxStore` 约定（如 `useUserStore`）。
- **SHOULD** 使用 getters 做派生数据计算，避免在组件中重复推导；使用 actions 封装状态变更逻辑，组件中不直接改 state。
- **MUST** 需要跨刷新保留的状态（如登录态、偏好设置）在 `defineStore` 中开启 `persist: true`，并限定持久化字段，避免序列化大对象。
- **MUST** 组件中通过 `const store = useXxxStore()` 获取实例，并配合 `storeToRefs()` 解构以保持响应性。

## 3. 组件设计规范

- **MUST** 组件遵循单一职责，一个组件只做一件事；复用逻辑抽离为 `composables`（`src/composables/`）。
- **MUST** 组件对外接口使用 `defineProps` / `defineEmits` 显式声明，并使用 TS 类型（`withDefaults` 提供默认值）。
- **MUST** 自定义样式使用 `<style scoped>` 或全局 CSS 变量，禁止全局污染。
- **SHOULD** 交互状态（加载中、空数据、错误）必须提供反馈 UI，不允许无响应空白。
- **MUST** 使用 `v-for` 时必须提供稳定且唯一的 `:key`，禁止使用 `index` 作为 key（列表可变时）。

## 4. 性能与内存规则

- **MUST** 避免在模板中调用方法（每次渲染都会执行），派生值用 `computed`。
- **SHOULD** 大列表使用 `v-memo` 或虚拟滚动；频繁更新的独立状态用 `shallowRef`。
- **MUST** 注册的全局事件（`window.addEventListener`）、定时器、订阅（`watch` 外部源）在 `onUnmounted` 中清理，防止内存泄漏。
- **SHOULD** 避免不必要的响应式包裹（`reactive` 包静态数据、`ref` 包常量），减少深层 Proxy 开销。
- **MUST** 静态资源（图片、SVG）放入 `public/` 或经 Vite 静态导入处理，禁止内联大体积 base64。

## 5. 样式规则

- **MUST** 颜色、字体、间距等设计令牌统一取自全局 CSS 变量（见 `DESIGN_RULES.md`），禁止硬编码色值。
- **MUST** 新功能必须同时适配亮色/暗色模式（项目基于 `prefers-color-scheme`），禁止仅亮色可用。
- **SHOULD** 使用 `@media (max-width: 1024px)` 适配 1024px 断点，与现有规则保持一致。
- **MUST** 可交互元素（按钮、链接）提供 `:hover` / `:focus-visible` 视觉反馈，保持 `transition` 时长统一（0.3s）。

## 6. Git 提交规范

- **MUST** 提交信息遵循约定式提交：`<type>(<scope>): <subject>`，如 `feat(user): 添加用户资料编辑`。
  - `feat` 新功能 / `fix` 修复 / `refactor` 重构 / `style` 样式 / `docs` 文档 / `perf` 性能 / `test` 测试 / `chore` 杂项
- **MUST** 提交前自查：无未使用的导入与变量（`noUnusedLocals`）、无 `any`、无调试代码（`console.log` / `debugger`）。
- **SHOULD** 一次提交只包含一个逻辑变更，禁止无关文件混入。
- **MUST** 不提交 `node_modules/`、`dist/`、`.env*` 等敏感或生成目录（已由 `.gitignore` 约束，勿强行 `-f` 添加）。

## 7. 无障碍（A11y）规则

- **MUST** 可交互元素使用语义化标签（`button`、`a`），禁止用 `div` 加点击事件代替。
- **MUST** 图片提供 `alt` 文本；图标按钮提供 `aria-label`。
- **SHOULD** 表单控件关联 `<label>`，键盘可用（Tab 顺序合理、Enter/Esc 可操作）。
- **SHOULD** 文本与背景对比度满足 WCAG AA（至少 4.5:1）。

## 8. 安全检查

- **MUST** 禁止使用 `v-html` 渲染用户输入内容；如确需渲染富文本，必须经过严格白名单过滤。
- **MUST** 禁止在代码中硬编码密钥、Token 等敏感信息；环境变量经 `.env` 注入，且仅暴露 `VITE_` 前缀变量。
