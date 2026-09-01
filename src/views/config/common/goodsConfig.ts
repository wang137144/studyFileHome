// ===== 示例配置：商品管理（纯前端配置化页面的测试数据）=====
// 这一份配置完整演示了页面支持的全部能力：
//   1. 列的显示 / 隐藏（show）
//   2. 列是否生成筛选条件（filterable，默认 true = 存在的列就能筛）
//   3. 每个按钮（查询 / 重置 / 新增 / 查看 / 编辑 / 修改 / 删除）各自的显示开关
//   4. 分页、弹窗表单、快捷修改
// 想改成别的业务（用户、订单…）只需复制一份配置，改字段即可，页面组件不用动。
//
// 字段的「类型」由本文件里的 filterType / columnType / formFields.type 共同决定，
// 这些类型都可以到「配置管理」页面去可视化修改 —— 例如把 分类 的筛选类型从
// select 改成 text，商品管理页的筛选框就会从下拉变成文本框 + 模糊查询。
import { Delete, Edit, Plus, RefreshRight, Search, View, EditPen, Coin } from '@element-plus/icons-vue'
import type { OptionItem, PageConfig, RowData } from './types'

// ===== 候选项（下拉筛选、tag 渲染、表单共用）=====
/** 商品分类 */
const categoryOptions: OptionItem[] = [
  { label: '电子数码', value: '电子数码', type: 'primary' },
  { label: '服饰鞋包', value: '服饰鞋包', type: 'success' },
  { label: '食品生鲜', value: '食品生鲜', type: 'warning' },
  { label: '家居日用', value: '家居日用', type: 'info' },
  { label: '图书文娱', value: '图书文娱', type: 'danger' },
]

/** 上架状态：1 上架 / 0 下架 */
const statusOptions: OptionItem[] = [
  { label: '上架', value: 1, type: 'success' },
  { label: '下架', value: 0, type: 'info' },
]

// ===== 种子数据（首次进入时写入 localStorage 的假数据）=====
const seed: RowData[] = [
  { id: 1, goodsName: '小米 14 Pro 5G 手机', category: '电子数码', brand: '小米', price: 4999, stock: 56, status: 1, sku: 'SKU-0001', createTime: '2026-08-01 09:12:33' },
  { id: 2, goodsName: '华为 MateBook X Pro', category: '电子数码', brand: '华为', price: 8999, stock: 18, status: 1, sku: 'SKU-0002', createTime: '2026-08-01 09:15:02' },
  { id: 3, goodsName: '苹果 AirPods Pro 2', category: '电子数码', brand: 'Apple', price: 1899, stock: 7, status: 1, sku: 'SKU-0003', createTime: '2026-08-02 10:02:41' },
  { id: 4, goodsName: '纯棉短袖 T 恤（男）', category: '服饰鞋包', brand: '优衣库', price: 79, stock: 320, status: 1, sku: 'SKU-0004', createTime: '2026-08-02 10:05:19' },
  { id: 5, goodsName: '真皮商务皮鞋（男）', category: '服饰鞋包', brand: '其乐', price: 699, stock: 66, status: 1, sku: 'SKU-0005', createTime: '2026-08-03 11:20:08' },
  { id: 6, goodsName: '羊毛针织围巾', category: '服饰鞋包', brand: '无印良品', price: 128, stock: 45, status: 0, sku: 'SKU-0006', createTime: '2026-08-03 11:26:55' },
  { id: 7, goodsName: '五常稻花香大米 10kg', category: '食品生鲜', brand: '十月稻田', price: 89, stock: 280, status: 1, sku: 'SKU-0007', createTime: '2026-08-04 14:31:27' },
  { id: 8, goodsName: '特级初榨橄榄油 1L', category: '食品生鲜', brand: '欧丽薇兰', price: 79, stock: 5, status: 1, sku: 'SKU-0008', createTime: '2026-08-04 14:40:12' },
  { id: 9, goodsName: '云南小粒咖啡豆 500g', category: '食品生鲜', brand: '辛鹿', price: 68, stock: 152, status: 1, sku: 'SKU-0009', createTime: '2026-08-05 09:08:44' },
  { id: 10, goodsName: '北欧风实木餐桌', category: '家居日用', brand: '源氏木语', price: 2399, stock: 21, status: 1, sku: 'SKU-0010', createTime: '2026-08-05 09:15:36' },
  { id: 11, goodsName: '记忆棉乳胶枕', category: '家居日用', brand: '睡眠博士', price: 159, stock: 14, status: 0, sku: 'SKU-0011', createTime: '2026-08-06 13:22:10' },
  { id: 12, goodsName: '北欧简约落地灯', category: '家居日用', brand: '宜家', price: 299, stock: 200, status: 1, sku: 'SKU-0012', createTime: '2026-08-06 13:30:58' },
  { id: 13, goodsName: '《人类简史》精装版', category: '图书文娱', brand: '中信出版社', price: 88, stock: 150, status: 1, sku: 'SKU-0013', createTime: '2026-08-07 08:45:21' },
  { id: 14, goodsName: '桌面游戏：卡坦岛', category: '图书文娱', brand: '游人码头', price: 238, stock: 33, status: 1, sku: 'SKU-0014', createTime: '2026-08-07 08:52:03' },
  { id: 15, goodsName: '蓝牙机械键盘 87 键', category: '电子数码', brand: '腹灵', price: 359, stock: 9, status: 1, sku: 'SKU-0015', createTime: '2026-08-08 15:11:47' },
  { id: 16, goodsName: '4K 高清显示器 27 寸', category: '电子数码', brand: 'AOC', price: 1299, stock: 26, status: 1, sku: 'SKU-0016', createTime: '2026-08-08 15:19:35' },
  { id: 17, goodsName: '真丝睡衣套装（女）', category: '服饰鞋包', brand: '桑罗', price: 459, stock: 88, status: 1, sku: 'SKU-0017', createTime: '2026-08-09 10:33:12' },
  { id: 18, goodsName: '帆布双肩背包', category: '服饰鞋包', brand: 'Fjallraven', price: 599, stock: 74, status: 0, sku: 'SKU-0018', createTime: '2026-08-09 10:41:26' },
  { id: 19, goodsName: '坚果零食大礼包', category: '食品生鲜', brand: '三只松鼠', price: 99, stock: 410, status: 1, sku: 'SKU-0019', createTime: '2026-08-10 16:05:09' },
  { id: 20, goodsName: '进口矿泉水 24 瓶', category: '食品生鲜', brand: '依云', price: 168, stock: 30, status: 1, sku: 'SKU-0020', createTime: '2026-08-10 16:12:44' },
  { id: 21, goodsName: '香薰加湿器', category: '家居日用', brand: '小米', price: 149, stock: 62, status: 1, sku: 'SKU-0021', createTime: '2026-08-11 09:28:17' },
  { id: 22, goodsName: '羽绒被冬被', category: '家居日用', brand: '水星家纺', price: 899, stock: 110, status: 1, sku: 'SKU-0022', createTime: '2026-08-11 09:35:52' },
  { id: 23, goodsName: '儿童绘本套装', category: '图书文娱', brand: '接力出版社', price: 128, stock: 0, status: 0, sku: 'SKU-0023', createTime: '2026-08-12 11:47:03' },
  { id: 24, goodsName: '无线降噪头戴耳机', category: '电子数码', brand: '索尼', price: 2299, stock: 17, status: 1, sku: 'SKU-0024', createTime: '2026-08-12 11:55:40' },
]

/** 字段配置覆盖在 localStorage 里的键名（由「配置管理」页面写入） */
export const goodsConfigOverrideKey = 'config-page:goods-field-config'

// ===== 页面配置 =====
export const goodsPageConfig: PageConfig = {
  title: '商品管理',
  desc: '全部数据存在浏览器 localStorage，纯前端增删改查；字段的类型到「配置管理」页面动态调整',
  // 数据在 localStorage 里的键名
  storageKey: 'config-page:goods-list',
  idField: 'id',
  seed,
  showIndex: true,

  // ===== 表格列 =====
  // show      ：该列是否显示（改成 false 立即从表格和筛选区消失）
  // filterable：该列是否作为筛选条件（不写 = true，即「存在的列就能筛」）
  columns: [
    {
      prop: 'goodsName',
      label: '商品名称',
      show: true,
      filterType: 'input', // 文本模糊查询
      minWidth: 220,
      showOverflowTooltip: true,
    },
    {
      prop: 'category',
      label: '分类',
      show: true,
      columnType: 'tag',
      filterType: 'select', // 下拉精确匹配
      options: categoryOptions,
      width: 110,
      align: 'center',
    },
    {
      prop: 'brand',
      label: '品牌',
      show: true,
      filterType: 'input',
      minWidth: 140,
      showOverflowTooltip: true,
    },
    {
      prop: 'price',
      label: '价格',
      show: true,
      columnType: 'money',
      filterType: 'numberRange', // 最小值 ~ 最大值
      width: 120,
      align: 'right',
      sortable: true,
    },
    {
      prop: 'stock',
      label: '库存',
      show: true,
      filterType: 'numberRange',
      width: 110,
      align: 'right',
      sortable: true,
    },
    {
      prop: 'status',
      label: '上架状态',
      show: true,
      columnType: 'tag',
      filterType: 'select',
      options: statusOptions,
      width: 100,
      align: 'center',
    },
    {
      // 演示隐藏列：show 为 false，表格和筛选区都不会出现
      prop: 'sku',
      label: '货号',
      show: false,
      minWidth: 120,
    },
    {
      // 演示隐藏列：show 为 false，仅「查看详情」里可见
      prop: 'createTime',
      label: '创建时间',
      show: false,
      minWidth: 180,
    },
  ],

  // ===== 表格行内操作按钮 =====
  // 每个按钮的 show 都是独立开关；quickEdit 表示「只改一个字段」的快捷修改
  rowActions: [
    { key: 'view', label: '查看', show: true, type: 'info', link: true, icon: View },
    { key: 'edit', label: '编辑', show: true, type: 'primary', link: true, icon: Edit },
    {
      key: 'stock',
      label: '改库存',
      show: true,
      type: 'warning',
      link: true,
      icon: Coin,
      quickEdit: { prop: 'stock', label: '库存', type: 'number', min: 0, max: 99999, placeholder: '请输入库存数量' },
    },
    {
      key: 'status',
      label: '改状态',
      show: true,
      type: 'success',
      link: true,
      icon: EditPen,
      quickEdit: { prop: 'status', label: '上架状态', type: 'select', options: statusOptions },
    },
    {
      key: 'delete',
      label: '删除',
      show: true,
      type: 'danger',
      link: true,
      icon: Delete,
      confirm: true,
      confirmText: (row) => `确认删除商品《${String(row.goodsName ?? '')}》吗？删除后不可恢复。`,
    },
  ],

  // ===== 工具栏按钮：查询 / 重置 / 新增（新增固定显示在筛选条件之后）=====
  toolbar: {
    search: { key: 'search', label: '查询', show: true, type: 'primary', icon: Search },
    reset: { key: 'reset', label: '重置', show: true, icon: RefreshRight },
    add: { key: 'add', label: '新增商品', show: true, type: 'success', icon: Plus },
  },

  // ===== 表格右上角扩展按钮 =====
  headerActions: [
    {
      key: 'resetData',
      label: '恢复初始数据',
      show: true,
      type: 'warning',
      plain: true,
      icon: RefreshRight,
      confirm: true,
      confirmText: '将清空本地改动并恢复为初始的 24 条商品数据，确认继续？',
    },
  ],

  // ===== 分页 =====
  pagination: {
    show: true,
    defaultPageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },

  // ===== 新增 / 编辑弹窗 =====
  dialog: {
    width: '640px',
    labelWidth: '90px',
  },
  formFields: [
    { prop: 'goodsName', label: '商品名称', type: 'input', required: true, placeholder: '请输入商品名称', span: 12 },
    { prop: 'category', label: '分类', type: 'select', required: true, options: categoryOptions, placeholder: '请选择分类', span: 12 },
    { prop: 'brand', label: '品牌', type: 'input', required: true, placeholder: '请输入品牌', span: 12 },
    { prop: 'sku', label: '货号', type: 'input', disabledOnEdit: true, placeholder: '如：SKU-0001', span: 12 },
    { prop: 'price', label: '价格', type: 'number', required: true, min: 0, max: 99999, step: 0.5, span: 12 },
    { prop: 'stock', label: '库存', type: 'number', required: true, min: 0, max: 99999, step: 1, span: 12 },
    { prop: 'status', label: '上架状态', type: 'radio', options: statusOptions, defaultValue: 1, span: 24 },
  ],
}
