// ===== 统一的 HTTP 请求封装（基于 axios）+ 全局错误处理 =====
import axios, { type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/api/types'

// 创建 axios 实例：基础地址来自环境变量 VITE_API_BASE_URL
// - 开发环境(.env.development)：'/api'，再由 Vite 代理(vite.config.ts)转发到 localhost:8080
// - 生产环境(.env.production)：'http://localhost:8080/api'，直连后端（生产无 Vite 代理）
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 请求超时：10 秒
})

// ---- 请求拦截器：统一注入鉴权信息 ----
request.interceptors.request.use(
  (config) => {
    // 预留：从本地存储读取登录 token 注入 Authorization 头。
    // 当前项目未做登录，取不到则不添加，不影响接口调用。
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 统一的错误提示（轻提示，可手动关闭）
function showError(message: string) {
  ElMessage({ message, type: 'error', duration: 3000, showClose: true })
}

// ---- 响应拦截器：剥离 Axios 包装 + 全量错误分类 ----
request.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>
    // 业务成功：直接把后端 ApiResponse 交给业务层
    if (body && body.code === 200) {
      return response.data
    }
    // 业务失败（HTTP 200，但后端返回的 code !== 200）：提示后端业务消息
    const msg = body?.message || '请求失败'
    showError(msg)
    return Promise.reject({ type: 'business', code: body?.code, message: msg })
  },
  (error: AxiosError) => {
    // 1) 服务器有响应，但 HTTP 状态码非 2xx
    if (error.response) {
      const status = error.response.status
      let msg = '请求出错'
      switch (status) {
        case 400: msg = '请求参数错误'; break
        case 401: msg = '未授权，请先登录'; break
        case 403: msg = '无权限访问该资源'; break
        case 404: msg = '请求的资源不存在（接口路径错误）'; break
        case 500: msg = '服务器内部错误'; break
        case 502: msg = '网关错误'; break
        case 503: msg = '服务暂不可用'; break
        case 504: msg = '网关超时'; break
        default: msg = `请求失败（HTTP ${status}）`
      }
      showError(msg)
      return Promise.reject({ type: 'http', status, message: msg })
    }

    // 2) 请求超时（后端处理太慢 / 网络差）
    if (error.code === 'ECONNABORTED') {
      const msg = '请求超时，请稍后重试'
      showError(msg)
      return Promise.reject({ type: 'timeout', message: msg })
    }

    // 3) 网络层错误（最常见：后端未启动 → ECONNREFUSED）
    if (error.code === 'ECONNREFUSED') {
      const msg = '无法连接后端服务，请确认后端已启动（localhost:8080）'
      showError(msg)
      return Promise.reject({ type: 'network', message: msg })
    }

    // 4) 其他未知错误
    const msg = error.message || '网络异常，请检查连接'
    showError(msg)
    return Promise.reject({ type: 'unknown', message: msg })
  },
)

export default request
