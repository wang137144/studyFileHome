<script setup lang="ts">
/**
 * 可复用 ECharts 图表容器组件
 * - 自动初始化 / 销毁实例，避免内存泄漏
 * - 监听容器尺寸变化（侧边栏折叠、窗口缩放）自动 resize
 * - 通过 option 属性驱动渲染，支持外部 loading 态
 */
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: string | number
    loading?: boolean
  }>(),
  { height: 320, loading: false },
)

const el = ref<HTMLDivElement | null>(null)
const chart = shallowRef<echarts.ECharts | null>(null)
let ro: ResizeObserver | null = null

function render() {
  if (!el.value) return
  if (!chart.value) chart.value = echarts.init(el.value)
  chart.value.setOption(props.option, true)
}

function onResize() {
  chart.value?.resize()
}

onMounted(() => {
  render()
  ro = new ResizeObserver(() => chart.value?.resize())
  if (el.value) ro.observe(el.value)
  window.addEventListener('resize', onResize)
})

// option 变化（引用或深层字段变化）时重新渲染
watch(
  () => props.option,
  (opt) => chart.value?.setOption(opt, true),
  { deep: true },
)

// 外部 loading 态联动
watch(
  () => props.loading,
  (v) => {
    if (!chart.value) return
    if (v) {
      chart.value.showLoading('default', {
        text: '加载中...',
        color: '#1890ff',
        textColor: '#666',
        maskColor: 'rgba(255,255,255,0.6)',
      })
    } else {
      chart.value.hideLoading()
    }
  },
)

onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('resize', onResize)
  chart.value?.dispose()
  chart.value = null
})
</script>

<template>
  <div
    ref="el"
    class="base-chart"
    :style="{ height: typeof height === 'number' ? height + 'px' : height }"
  ></div>
</template>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
