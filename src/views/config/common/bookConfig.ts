// ===== 示例配置：书本管理（纯前端配置化页面的测试数据）=====
// 这一份配置完整演示了页面支持的全部能力：
//   1. 列的显示 / 隐藏（show）
//   2. 列是否生成筛选条件（filterable，默认 true = 存在的列就能筛）
//   3. 每个按钮（查询 / 重置 / 新增 / 查看 / 编辑 / 修改 / 删除）各自的显示开关
//   4. 分页、弹窗表单、快捷修改
// 想改成别的业务（用户、订单…）只需复制一份配置，改字段即可，页面组件不用动。
import { Delete, Edit, Plus, RefreshRight, Search, View, EditPen, Coin } from '@element-plus/icons-vue'
import type { OptionItem, PageConfig, RowData } from './types'

// ===== 候选项（下拉筛选、tag 渲染、表单共用）=====
/** 图书分类 */
const categoryOptions: OptionItem[] = [
  { label: '技术', value: '技术', type: 'primary' },
  { label: '文学', value: '文学', type: 'success' },
  { label: '历史', value: '历史', type: 'warning' },
  { label: '经济', value: '经济', type: 'info' },
  { label: '少儿', value: '少儿', type: 'danger' },
]

/** 销售状态：1 在售 / 0 下架 */
const statusOptions: OptionItem[] = [
  { label: '在售', value: 1, type: 'success' },
  { label: '下架', value: 0, type: 'info' },
]

// ===== 种子数据（首次进入时写入 localStorage 的假数据）=====
const seed: RowData[] = [
  { id: 1, bookName: 'Vue.js 设计与实现', author: '霍春阳', category: '技术', publisher: '人民邮电出版社', isbn: '978-7-115-56852-1', price: 89, stock: 32, publishDate: '2022-01-01', status: 1, createTime: '2026-08-01 09:12:33' },
  { id: 2, bookName: 'TypeScript 编程', author: 'Boris Cherny', category: '技术', publisher: '电子工业出版社', isbn: '978-7-121-37014-8', price: 79, stock: 18, publishDate: '2020-05-01', status: 1, createTime: '2026-08-01 09:15:02' },
  { id: 3, bookName: '深入理解计算机系统', author: 'Randal E. Bryant', category: '技术', publisher: '机械工业出版社', isbn: '978-7-111-54493-7', price: 139, stock: 7, publishDate: '2016-11-01', status: 1, createTime: '2026-08-02 10:02:41' },
  { id: 4, bookName: '活着', author: '余华', category: '文学', publisher: '作家出版社', isbn: '978-7-5063-6543-2', price: 28, stock: 120, publishDate: '2012-08-01', status: 1, createTime: '2026-08-02 10:05:19' },
  { id: 5, bookName: '百年孤独', author: '加西亚·马尔克斯', category: '文学', publisher: '南海出版公司', isbn: '978-7-5442-5399-4', price: 39.5, stock: 66, publishDate: '2011-06-01', status: 1, createTime: '2026-08-03 11:20:08' },
  { id: 6, bookName: '平凡的世界', author: '路遥', category: '文学', publisher: '北京十月文艺出版社', isbn: '978-7-5302-1234-5', price: 68, stock: 45, publishDate: '2017-05-01', status: 0, createTime: '2026-08-03 11:26:55' },
  { id: 7, bookName: '万历十五年', author: '黄仁宇', category: '历史', publisher: '中华书局', isbn: '978-7-101-05449-1', price: 36, stock: 28, publishDate: '2006-08-01', status: 1, createTime: '2026-08-04 14:31:27' },
  { id: 8, bookName: '史记（全十册）', author: '司马迁', category: '历史', publisher: '中华书局', isbn: '978-7-101-03044-0', price: 298, stock: 5, publishDate: '2013-09-01', status: 1, createTime: '2026-08-04 14:40:12' },
  { id: 9, bookName: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', publisher: '中信出版社', isbn: '978-7-5086-4350-8', price: 68, stock: 52, publishDate: '2014-11-01', status: 1, createTime: '2026-08-05 09:08:44' },
  { id: 10, bookName: '国富论', author: '亚当·斯密', category: '经济', publisher: '商务印书馆', isbn: '978-7-100-03275-3', price: 66, stock: 21, publishDate: '2015-06-01', status: 1, createTime: '2026-08-05 09:15:36' },
  { id: 11, bookName: '经济学原理', author: 'N. 格里高利·曼昆', category: '经济', publisher: '北京大学出版社', isbn: '978-7-301-25306-7', price: 88, stock: 14, publishDate: '2015-05-01', status: 0, createTime: '2026-08-06 13:22:10' },
  { id: 12, bookName: '小王子', author: '圣埃克苏佩里', category: '少儿', publisher: '人民文学出版社', isbn: '978-7-02-004249-4', price: 22, stock: 200, publishDate: '2003-09-01', status: 1, createTime: '2026-08-06 13:30:58' },
  { id: 13, bookName: '窗边的小豆豆', author: '黑柳彻子', category: '少儿', publisher: '南海出版公司', isbn: '978-7-5442-5394-9', price: 25, stock: 150, publishDate: '2011-01-01', status: 1, createTime: '2026-08-07 08:45:21' },
  { id: 14, bookName: 'JavaScript 高级程序设计', author: 'Matt Frisbie', category: '技术', publisher: '人民邮电出版社', isbn: '978-7-115-55457-9', price: 129, stock: 33, publishDate: '2020-12-01', status: 1, createTime: '2026-08-07 08:52:03' },
  { id: 15, bookName: '算法导论', author: 'Thomas H. Cormen', category: '技术', publisher: '机械工业出版社', isbn: '978-7-111-40701-0', price: 128, stock: 9, publishDate: '2013-01-01', status: 1, createTime: '2026-08-08 15:11:47' },
  { id: 16, bookName: '重构：改善既有代码的设计', author: 'Martin Fowler', category: '技术', publisher: '人民邮电出版社', isbn: '978-7-115-42506-0', price: 69, stock: 26, publishDate: '2015-12-01', status: 1, createTime: '2026-08-08 15:19:35' },
  { id: 17, bookName: '三体（全集）', author: '刘慈欣', category: '文学', publisher: '重庆出版社', isbn: '978-7-229-03068-0', price: 98, stock: 88, publishDate: '2010-11-01', status: 1, createTime: '2026-08-09 10:33:12' },
  { id: 18, bookName: '围城', author: '钱钟书', category: '文学', publisher: '人民文学出版社', isbn: '978-7-02-002475-9', price: 32, stock: 74, publishDate: '1980-07-01', status: 0, createTime: '2026-08-09 10:41:26' },
  { id: 19, bookName: '明朝那些事儿', author: '当年明月', category: '历史', publisher: '浙江人民出版社', isbn: '978-7-213-04583-6', price: 158, stock: 41, publishDate: '2011-12-01', status: 1, createTime: '2026-08-10 16:05:09' },
  { id: 20, bookName: '激荡三十年', author: '吴晓波', category: '经济', publisher: '中信出版社', isbn: '978-7-5086-1055-5', price: 45, stock: 30, publishDate: '2014-08-01', status: 1, createTime: '2026-08-10 16:12:44' },
  { id: 21, bookName: '穷爸爸富爸爸', author: '罗伯特·清崎', category: '经济', publisher: '南海出版公司', isbn: '978-7-5442-3905-9', price: 38, stock: 62, publishDate: '2011-04-01', status: 1, createTime: '2026-08-11 09:28:17' },
  { id: 22, bookName: '夏洛的网', author: 'E.B. 怀特', category: '少儿', publisher: '上海译文出版社', isbn: '978-7-5327-4898-3', price: 26, stock: 110, publishDate: '2014-08-01', status: 1, createTime: '2026-08-11 09:35:52' },
  { id: 23, bookName: '哈利·波特与魔法石', author: 'J.K. 罗琳', category: '少儿', publisher: '人民文学出版社', isbn: '978-7-02-003343-0', price: 42, stock: 0, publishDate: '2008-12-01', status: 0, createTime: '2026-08-12 11:47:03' },
  { id: 24, bookName: '代码整洁之道', author: 'Robert C. Martin', category: '技术', publisher: '人民邮电出版社', isbn: '978-7-115-39724-4', price: 59, stock: 17, publishDate: '2017-12-01', status: 1, createTime: '2026-08-12 11:55:40' },
]

// ===== 页面配置 =====
export const bookPageConfig: PageConfig = {
  title: '书本管理',
  desc: '全部数据存在浏览器 localStorage，纯前端增删改查',
  // 数据在 localStorage 里的键名
  storageKey: 'config-page:book-list',
  idField: 'id',
  seed,
  showIndex: true,

  // ===== 表格列 =====
  // show      ：该列是否显示（改成 false 立即从表格和筛选区消失）
  // filterable：该列是否作为筛选条件（不写 = true，即「存在的列就能筛」）
  columns: [
    {
      prop: 'bookName',
      label: '书名',
      show: true,
      filterable: true,
      filterType: 'input',
      minWidth: 200,
      showOverflowTooltip: true,
    },
    {
      prop: 'author',
      label: '作者',
      show: true,
      minWidth: 130,
      showOverflowTooltip: true,
    },
    {
      prop: 'category',
      label: '分类',
      show: true,
      columnType: 'tag',
      options: categoryOptions,
      width: 100,
      align: 'center',
    },
    {
      prop: 'publisher',
      label: '出版社',
      show: true,
      filterable: false, // 列照常显示，但显式关闭筛选，筛选区不会出现这一项
      minWidth: 170,
      showOverflowTooltip: true,
    },
    {
      prop: 'price',
      label: '价格',
      show: true,
      columnType: 'money',
      filterType: 'numberRange', // 最小值 ~ 最大值
      width: 110,
      align: 'right',
      sortable: true,
    },
    {
      prop: 'stock',
      label: '库存',
      show: true,
      filterType: 'numberRange',
      width: 100,
      align: 'right',
      sortable: true,
    },
    {
      prop: 'publishDate',
      label: '出版日期',
      show: true,
      columnType: 'date',
      filterType: 'daterange', // 日期区间筛选
      width: 120,
      align: 'center',
      sortable: true,
    },
    {
      prop: 'status',
      label: '状态',
      show: true,
      columnType: 'tag',
      options: statusOptions,
      width: 90,
      align: 'center',
    },
    {
      // 演示隐藏列：show 为 false，表格和筛选区都不会出现
      prop: 'createTime',
      label: '创建时间',
      show: false,
      minWidth: 170,
    },
    {
      prop: 'isbn',
      label: 'ISBN',
      show: false,
      minWidth: 160,
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
      quickEdit: { prop: 'status', label: '销售状态', type: 'select', options: statusOptions },
    },
    {
      key: 'delete',
      label: '删除',
      show: true,
      type: 'danger',
      link: true,
      icon: Delete,
      confirm: true,
      confirmText: (row) => `确认删除《${String(row.bookName ?? '')}》吗？删除后不可恢复。`,
    },
  ],

  // ===== 工具栏按钮：查询 / 重置 / 新增（新增固定显示在筛选条件之后）=====
  toolbar: {
    search: { key: 'search', label: '查询', show: true, type: 'primary', icon: Search },
    reset: { key: 'reset', label: '重置', show: true, icon: RefreshRight },
    add: { key: 'add', label: '新增书本', show: true, type: 'success', icon: Plus },
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
      confirmText: '将清空本地改动并恢复为初始的 24 条书本数据，确认继续？',
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
    { prop: 'bookName', label: '书名', type: 'input', required: true, placeholder: '请输入书名', span: 12 },
    { prop: 'author', label: '作者', type: 'input', required: true, placeholder: '请输入作者', span: 12 },
    { prop: 'category', label: '分类', type: 'select', required: true, options: categoryOptions, placeholder: '请选择分类', span: 12 },
    { prop: 'publisher', label: '出版社', type: 'input', placeholder: '请输入出版社', span: 12 },
    { prop: 'isbn', label: 'ISBN', type: 'input', disabledOnEdit: true, placeholder: '如：978-7-115-56852-1', span: 12 },
    { prop: 'publishDate', label: '出版日期', type: 'date', required: true, placeholder: '请选择出版日期', span: 12 },
    { prop: 'price', label: '价格', type: 'number', required: true, min: 0, max: 99999, step: 0.5, span: 12 },
    { prop: 'stock', label: '库存', type: 'number', required: true, min: 0, max: 99999, step: 1, span: 12 },
    { prop: 'status', label: '状态', type: 'radio', options: statusOptions, defaultValue: 1, span: 24 },
  ],
}
