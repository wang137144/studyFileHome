<script setup lang="ts">
// ===== 首页：云南省经济 / 金融 / 旅游 发展态势可视化（模拟数据）=====
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { TrendCharts, Money, User, ShoppingCart } from '@element-plus/icons-vue'
import BaseChart from '@/components/BaseChart.vue'
import {
  years,
  gdpTotal,
  gdpGrowth,
  primaryIndustry,
  secondaryIndustry,
  tertiaryIndustry,
  depositBalance,
  loanBalance,
  touristVisits,
  tourismRevenue,
  tourismGdpRatio,
  kpis,
} from './common/homeData'

// Element Plus 图标映射（与 homeData 中 icon 字符串对应）
const iconMap: Record<string, unknown> = { TrendCharts, Money, User, ShoppingCart }

// 统一调色板（与后台蓝色主题协调）
const palette = ['#1890ff', '#13c2c2', '#52c41a', '#fa8c16', '#722ed1', '#f5222d']

// 柱状渐变辅助：顶部主色 → 底部主色淡出
function grad(hex: string) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: hex },
    { offset: 1, color: hex + '22' },
  ])
}

const baseGrid = { left: 8, right: 8, bottom: 4, top: 44, containLabel: true }
const dashSplit = { lineStyle: { type: 'dashed', color: '#eee' } }
const baseLegend = { top: 4, itemWidth: 14, itemHeight: 8, textStyle: { color: '#666' } }

// 1. 地区生产总值与增速（柱 + 线，双 Y 轴）
const gdpOption = ({
  color: palette,
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { ...baseLegend, data: ['GDP总量', 'GDP增速'] },
  grid: baseGrid,
  xAxis: { type: 'category', data: years, axisTick: { alignWithLabel: true } },
  yAxis: [
    { type: 'value', name: '亿元', nameTextStyle: { color: '#999' }, splitLine: dashSplit },
    {
      type: 'value',
      name: '增速%',
      nameTextStyle: { color: '#999' },
      axisLabel: { formatter: '{value}%' },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: 'GDP总量',
      type: 'bar',
      yAxisIndex: 0,
      barWidth: '46%',
      itemStyle: { borderRadius: [6, 6, 0, 0], color: grad('#1890ff') },
      data: gdpTotal,
    },
    {
      name: 'GDP增速',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3, color: '#fa8c16' },
      itemStyle: { color: '#fa8c16' },
      data: gdpGrowth,
    },
  ],
} as EChartsOption)

// 2. 三次产业增加值结构（堆叠面积图）
const industryOption = ({
  color: ['#52c41a', '#1890ff', '#722ed1'],
  tooltip: { trigger: 'axis' },
  legend: { ...baseLegend, data: ['第一产业', '第二产业', '第三产业'] },
  grid: baseGrid,
  xAxis: { type: 'category', boundaryGap: false, data: years },
  yAxis: { type: 'value', name: '亿元', splitLine: dashSplit },
  series: [
    { name: '第一产业', type: 'line', stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, lineStyle: { width: 1 }, data: primaryIndustry },
    { name: '第二产业', type: 'line', stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, lineStyle: { width: 1 }, data: secondaryIndustry },
    { name: '第三产业', type: 'line', stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, lineStyle: { width: 1 }, data: tertiaryIndustry },
  ],
} as EChartsOption)

// 3. 金融：金融机构本外币存、贷款余额（双面积折线）
const financeOption = ({
  color: ['#13c2c2', '#1890ff'],
  tooltip: { trigger: 'axis' },
  legend: { ...baseLegend, data: ['存款余额', '贷款余额'] },
  grid: baseGrid,
  xAxis: { type: 'category', boundaryGap: false, data: years },
  yAxis: { type: 'value', name: '亿元', splitLine: dashSplit },
  series: [
    { name: '存款余额', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, areaStyle: { opacity: 0.12 }, lineStyle: { width: 3 }, data: depositBalance },
    { name: '贷款余额', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, areaStyle: { opacity: 0.12 }, lineStyle: { width: 3 }, data: loanBalance },
  ],
} as EChartsOption)

// 4. 旅游：接待游客量与旅游总收入（柱 + 线，双 Y 轴）
const tourismOption = ({
  color: ['#52c41a', '#fa8c16'],
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { ...baseLegend, data: ['游客量', '旅游收入'] },
  grid: baseGrid,
  xAxis: { type: 'category', data: years, axisTick: { alignWithLabel: true } },
  yAxis: [
    { type: 'value', name: '亿人次', splitLine: dashSplit },
    { type: 'value', name: '亿元', axisLabel: { formatter: '{value}' }, splitLine: { show: false } },
  ],
  series: [
    {
      name: '游客量',
      type: 'bar',
      yAxisIndex: 0,
      barWidth: '46%',
      itemStyle: { borderRadius: [6, 6, 0, 0], color: grad('#52c41a') },
      data: touristVisits,
    },
    {
      name: '旅游收入',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3, color: '#fa8c16' },
      itemStyle: { color: '#fa8c16' },
      data: tourismRevenue,
    },
  ],
} as EChartsOption)

// 5. 旅游总收入占 GDP 比重演变（单轴面积折线）
const ratioOption = ({
  color: ['#722ed1'],
  tooltip: { trigger: 'axis' },
  grid: { left: 8, right: 8, bottom: 4, top: 24, containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: years },
  yAxis: { type: 'value', name: '占GDP比重%', axisLabel: { formatter: '{value}%' }, splitLine: dashSplit },
  series: [
    {
      name: '旅游收入占GDP比重',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      areaStyle: { opacity: 0.18 },
      data: tourismGdpRatio,
    },
  ],
} as EChartsOption)
</script>

<template>
  <div class="dashboard">
    <!-- 页头 -->
    <header class="page-header">
      <div>
        <div class="page-title">云南省经济 · 金融 · 旅游 发展态势</div>
        <div class="page-sub">近十年（2015–2024）核心指标趋势可视化看板</div>
      </div>
      <div class="header-right">
        <span class="badge">模拟数据 · 仅供演示</span>
      </div>
    </header>

    <!-- KPI 概览 -->
    <el-row :gutter="16" class="block">
      <el-col
        v-for="k in kpis"
        :key="k.key"
        :xs="12"
        :sm="12"
        :md="6"
        :lg="6"
      >
        <div class="kpi-card" :style="{ '--c': k.color }">
          <div class="kpi-icon">
            <el-icon><component :is="iconMap[k.icon]" /></el-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-label">{{ k.label }}</div>
            <div class="kpi-value">
              {{ k.value }}<span class="kpi-unit">{{ k.unit }}</span>
            </div>
            <div class="kpi-yoy">
              同比 <span class="up">▲ {{ k.yoy }}%</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 经济：GDP 与 产业结构 -->
    <el-row :gutter="16" class="block">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="chart-title">地区生产总值与增速</span>
          </template>
          <BaseChart :option="gdpOption" :height="340" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="chart-title">三次产业增加值结构</span>
          </template>
          <BaseChart :option="industryOption" :height="340" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 金融 与 旅游 -->
    <el-row :gutter="16" class="block">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="chart-title">金融机构存贷款余额</span>
          </template>
          <BaseChart :option="financeOption" :height="340" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="chart-title">旅游接待量与总收入</span>
          </template>
          <BaseChart :option="tourismOption" :height="340" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 旅游对经济的贡献 -->
    <el-row :gutter="16" class="block">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="chart-title">旅游总收入占 GDP 比重演变</span>
          </template>
          <BaseChart :option="ratioOption" :height="320" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 16px;
}

/* 页头 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 16px;
  color: #fff;
  background: linear-gradient(135deg, #1d3b6e 0%, #2a5fb0 100%);
  box-shadow: 0 4px 14px rgba(29, 59, 110, 0.25);
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}
.page-sub {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.85;
}
.badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.18);
  white-space: nowrap;
}

.block {
  margin-bottom: 0;
}

/* KPI 卡片 */
.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 88px;
  padding: 0 16px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 10px;
  border-left: 4px solid var(--c);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.kpi-icon {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 22px;
  color: #fff;
  background: var(--c);
}
.kpi-label {
  font-size: 13px;
  color: #888;
}
.kpi-value {
  margin: 2px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2d3d;
}
.kpi-unit {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #999;
}
.kpi-yoy {
  font-size: 12px;
  color: #999;
}
.kpi-yoy .up {
  color: #f5222d;
  font-weight: 600;
}

/* 图表卡片 */
.chart-card {
  margin-bottom: 16px;
  border-radius: 10px;
}
.chart-title {
  font-weight: 600;
  color: #1f2d3d;
}
</style>
