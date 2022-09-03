import { defineStore } from 'pinia'

const modules = [
    { name: '工作台', code: 'work', page: '/work', component: 'Work' },
    { name: '业务台', code: 'business', page: '/business', component: 'Business' },
    { name: '管理台', code: 'manage', page: '/manage', component: 'Manage' },
    { name: '日程表', code: 'schedule', page: '/schedule', component: 'Schedule' },
    { name: '通讯录', code: 'contact', page: '/contact', component: 'Contact' },
]

export const appStore = defineStore('app', {
    state: () => {
        return {
            tabs: [],
        }
    },
    getters: {
        //获取keep-live需要include的组件数组
        keepAlive(state) {
            let keep = state.tabs.map((item) => {
                return item.component
            })
            console.log('~~~~~~~~~~app store~~~~~~~~~~~', keep)
            return keep
        },
    },
    actions: {
        addTab(url) {
            let page = url.indexOf('?') != -1 ? url.substring(0, url.indexOf('?')) : url
            console.log('app store page=' + page)

            let menu = modules.find((module) => module.page == page) //判断是否是需要处理标签的路由
            if (!menu) return
            let existMenu = this.tabs.find((tab) => tab.page == page)
            console.log('app store existMenu=', existMenu)
            console.log('app store modules=', modules)
            this.tabs.forEach((tab) => (tab.selected = false))
            if (existMenu) {
                //如果存在不添加，当前表示选中
                existMenu.selected = true
                // existMenu.path = url //更新当前的路由，保存路由参数
            } else {
                //如果不存在，则添加，
                let newMenu = JSON.parse(JSON.stringify(menu))
                newMenu.selected = true
                this.tabs.push(newMenu)
            }

            // //判断是否存在工作台，如果不存在，则添加
            // let existWork = this.tabs.find((tab) => tab.page == defaultTab)
            // if (!existWork) {
            //     console.log('不存在工作台')
            //     let menuWork = modules.find((module) => module.page == defaultTab)
            //     let newMenu = JSON.parse(JSON.stringify(menuWork))
            //     this.tabs.unshift(newMenu)
            // }
            return this.tabs
        },
        closeTab(index, router) {
            let tab = this.tabs[index]
            let isLast = index == this.tabs.length - 1
            let isSelected = tab.selected
            //删除标签页
            this.tabs.splice(index, 1)
            //如果删除的标签页是选中的，则不作处理，否则按规则切换标签
            if (isSelected) {
                //如果删除的是最后一个，则选择前一个，否则显示当前位置的标签
                let next = this.tabs[isLast ? index - 1 : index]
                router.push(`${next.page}`)
            }
            return this.tabs
        },
        clear() {
            this.tabs = []
        },
        getTabs() {
            return this.tabs
        },
    },
})
