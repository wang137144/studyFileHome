/// <reference types="vite/client" />

// 自定义环境变量类型声明，便于 TS 校验 import.meta.env.VITE_*
interface ImportMetaEnv {
  /** 后端接口基础地址：开发走 /api（经 Vite 代理转发），生产为完整后端 URL */
  readonly VITE_API_BASE_URL: string
}

// 让 ImportMeta.env 识别上面的自定义字段（与 vite/client 内置声明合并）
interface ImportMeta {
  readonly env: ImportMetaEnv
}
