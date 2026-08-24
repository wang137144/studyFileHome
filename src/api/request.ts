import axios from 'axios'

// 所有请求走 /api 前缀，由 vite 代理转发到后端 8080
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 响应拦截器：剥离 Axios 包装，直接返回后端 ApiResponse 结构
request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default request
