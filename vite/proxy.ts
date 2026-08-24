import type { ProxyOptions } from 'vite'

/**
 * 开发环境代理配置（独立成文件，便于复用与维护）
 *
 * 作用：把前端开发服务器收到的 /api 请求【完整】转发到本地后端 Spring Boot。
 * 例如前端请求 /api/role/list -> http://localhost:8080/api/role/list
 *
 * 重要：
 * - 后端接口本身已带 /api 前缀（如 /api/user/list），所以【不要】用 rewrite 去掉 /api，
 *   否则转发后变成 /role/list 导致 404。
 * - 若后端更换端口或部署地址，只需修改下面的 target。
 */
const proxy: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://localhost:8080', // 后端地址（本地 Spring Boot 默认 8080）
    changeOrigin: true, // 改写 Host 头为目标地址，避免被后端按 Host 拒绝
    // 不配置 rewrite：保留 /api 前缀完整转发给后端
  },
}

export default proxy
