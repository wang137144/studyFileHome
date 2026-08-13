# 设计规则（Design Rules）

> 本项目 UI 设计规范，基于 `src/style.css` 中已有的设计令牌（Design Tokens）提炼。所有新增 UI 必须遵循本规范，保证视觉一致性。

## 1. 设计令牌（必须取自全局变量）

| 令牌 | 亮色值 | 暗色值 | 用途 |
|------|--------|--------|------|
| `--text` | `#6b6375` | `#9ca3af` | 正文文本 |
| `--text-h` | `#08060d` | `#f3f4f6` | 标题 / 强调文本 |
| `--bg` | `#ffffff` | `#16171d` | 页面背景 |
| `--border` | `#e5e4e7` | `#2e303a` | 边框 / 分隔线 |
| `--code-bg` | `#f4f3ec` | `#1f2028` | 代码块 / 内嵌底色 |
| `--accent` | `#aa3bff` | `#c084fc` | 品牌强调色（主操作、高亮） |
| `--accent-bg` | `rgba(170,59,255,0.1)` | `rgba(192,132,252,0.15)` | 强调色浅底 |
| `--accent-border` | `rgba(170,59,255,0.5)` | `rgba(192,132,252,0.5)` | 强调色描边 |
| `--shadow` | 浅色柔和阴影 | 深色加强阴影 | 浮层 / 卡片投影 |

- **MUST** 代码中使用 `var(--xxx)` 引用令牌，禁止在组件中硬编码上述色值。
- **SHOULD** 新增语义色（如成功/警告/错误）时，在 `style.css` 的 `:root` 与暗色块中成对声明，保持亮暗两套。

## 2. 色彩使用规则

- **MUST** 品牌强调色 `--accent` 只用于主要操作、当前状态、链接高亮，不做大面积背景填充。
- **SHOULD** 强调色浅底 `--accent-bg` 用于标签、徽章、选中态背景。
- **MUST** 文本层级只使用 `--text`（次要）与 `--text-h`（主要），区分层级靠字号与字重而非更多颜色。
- **SHOULD** 暗色模式基于 `@media (prefers-color-scheme: dark)` 整体切换，禁止逐组件手动判断。

## 3. 字体排版规则

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--sans` | `system-ui, 'Segoe UI', Roboto, sans-serif` | 正文默认字体 |
| `--heading` | `system-ui, 'Segoe UI', Roboto, sans-serif` | 标题字体 |
| `--mono` | `ui-monospace, Consolas, monospace` | 代码 / 数字 |

- **MUST** 标题使用 `--heading`，正文使用 `--sans`，代码使用 `--mono`。
- **MUST** 层级规范：`h1` 56px（移动端 36px）、`h2` 24px（移动端 20px）、正文 16px；行高 145%，字间距 0.18px。
- **SHOULD** 同一屏内标题层级不超过三级；正文行宽建议 45–75 字符。

## 4. 间距与布局规则

- **MUST** 页面容器最大宽度 1126px，居中（对应 `#app` 现有规则）。
- **SHOULD** 间距使用 4px 基准递增（4/8/12/16/24/32/48），跨断点保持比例。
- **MUST** 区块分隔使用 `--border` 1px 线，卡片层级用 `--shadow` 表达，避免同时用边框+阴影堆叠。

## 5. 响应式规则

- **MUST** 断点统一为 1024px（对应现有 `@media (max-width: 1024px)`），桌面端为完整布局，移动端降级为单列。
- **MUST** 移动端触控目标不小于 44×44px，文本可缩放，`font-size` 自适应（16px / 18px 两档）。
- **SHOULD** 优先移动端优先（Mobile First）书写样式，桌面端用 `min-width` 增强。

## 6. 组件视觉规范

- **按钮（Button）**
  - 主要按钮：`--accent` 背景 + 白字；次要按钮：透明背景 + `--accent-border` 描边。
  - **MUST** 提供 `:hover`（`--accent-border` 加深或阴影）与 `:focus-visible`（2px 外描边 `outline`）。
  - 过渡时长统一 0.3s（`transition: border-color 0.3s` 等）。
- **代码块 / 标签**：圆角 4–5px，`--code-bg` 底色 + `--mono` 字体，`--text-h` 前景。
- **卡片 / 区块**：圆角 6px 起，内边距 16–32px，层级用 `--shadow` 表达。
- **列表项**：hover 时呈现 `--shadow` 浮起效果，保持圆角与内边距一致。

## 7. 图标与图片

- **MUST** 使用 SVG 矢量图（项目 `public/` 已有 SVG 资源），禁止模糊位图图标。
- **SHOULD** 图标统一尺寸（16/18/22px 三档），描边粗细一致；暗色模式如需反色使用 CSS `filter`（参考现有 `#social .button-icon` 写法）。

## 8. 动效规则

- **SHOULD** 过渡/动画时长以 0.3s 为基准，仅状态切换使用，不做持续循环动画。
- **MUST** 动效遵循 `prefers-reduced-motion` 时降级或禁用。
- **MUST** 仅对 `transform` / `opacity` 做动画，避免重排重绘性能问题。

## 9. 新增功能自查清单

- [ ] 颜色全部来自 CSS 令牌，无硬编码色值
- [ ] 亮色 / 暗色模式均验证通过
- [ ] 1024px 断点下布局正常（单列降级）
- [ ] 可交互元素有 hover / focus-visible 反馈
- [ ] 图标为 SVG 且尺寸、描边统一
- [ ] 动效时长 0.3s，无循环动画
