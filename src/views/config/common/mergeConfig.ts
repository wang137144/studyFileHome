// ===== 字段配置合并工具 =====
// 「配置管理」页面保存的是「当前全部字段的完整配置」（含新增 / 删除后的结果），
// 这里负责把它们整体替换到默认配置上，得到最终驱动商品管理页面的完整配置。
import type { ColumnConfig, ConfigOverride, PageConfig } from './types'

/** 规整单列配置：保证 show / filterable 为布尔，避免 el-switch 绑定 undefined 渲染异常 */
function normalizeColumn(col: ColumnConfig): ColumnConfig {
  return {
    ...col,
    show: col.show !== false,
    filterable: col.filterable !== false,
  }
}

/**
 * 把覆盖配置合并到默认配置上。
 * 合并规则：覆盖里若提供了 columns / formFields（完整列表），则整体替换默认配置；
 * 这样既能支持「改类型」，也能支持「新增 / 删除字段」。覆盖为空时原样返回 base。
 * @param base 默认页面配置（如 goodsPageConfig）
 * @param override 配置管理页面保存的覆盖（为 null / undefined 时原样返回 base）
 */
export function mergeConfig(
  base: PageConfig,
  override: ConfigOverride | null | undefined
): PageConfig {
  if (!override) return base

  const columns =
    override.columns && override.columns.length > 0
      ? override.columns.map(normalizeColumn)
      : base.columns
  const formFields =
    override.formFields && override.formFields.length > 0
      ? override.formFields
      : base.formFields

  return { ...base, columns, formFields }
}
