import { defineStore } from 'pinia'

// 定义用户模块的store
export const useUserStore = defineStore('user', {   
    state: () => ({
        name: '',
        age: 0,
    }),
    getters: {
        getName(state) {
            return state.name
        },
        getAge(state) {
            return state.age
        },
    },
    actions: {
        setName(name: string) {
            this.name = name
        },
        setAge(age: number) {
            this.age = age
        },
    },
})
