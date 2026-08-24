// ===== Pinia 用户状态仓库（项目脚手架自带示例 store）=====
import { defineStore } from 'pinia'

// 定义一个名为 'user' 的 store，管理简单的用户信息
export const useUserStore = defineStore('user', {
  // state：响应式状态
  state: () => ({
    name: '', // 用户名
    age: 0, // 年龄
  }),
  // getters：基于 state 的计算属性
  getters: {
    getName(state) {
      return state.name
    },
    getAge(state) {
      return state.age
    },
  },
  // actions：修改 state 的方法
  actions: {
    setName(name: string) {
      this.name = name
    },
    setAge(age: number) {
      this.age = age
    },
  },
})
