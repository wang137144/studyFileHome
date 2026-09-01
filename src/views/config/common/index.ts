// ===== 配置化页面公共模块：统一出口 =====
// 其他页面想复用这套「配置驱动列表」，只需从这里引入即可：
//   import { useConfigTable, type PageConfig } from '@/views/config/common'
export * from './types'
export * from './storage'
export * from './render'
export * from './useConfigTable'
export * from './mergeConfig'
export { goodsPageConfig, goodsConfigOverrideKey } from './goodsConfig'
