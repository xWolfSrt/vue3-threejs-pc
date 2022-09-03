import { defineStore } from 'pinia'
import getAssetsFile from '../utils/pub-use'
const defaultTab = '/work'
const modules = [
    { name: '首页', code: 'work', icon: getAssetsFile('work/home/icon_tab_work.png'), page: '/work', component: 'WorkHome', fixed: true }, //fixed为true,则不允许删除
    { name: '搜索', code: 'search', icon: getAssetsFile('work/home/icon_tab_search.png'), page: '/work/search', component: 'WorkSearch' },
    {
        name: '待办事项详情',
        code: 'schedule',
        icon: getAssetsFile('work/home/icon_tab_dbsx.png'),
        page: '/work/schedule',
        component: 'WorkSchedule',
    },
    {
        name: '通知公告',
        code: 'notification',
        icon: getAssetsFile('work/home/icon_tab_tzgg.png'),
        page: '/work/notification',
        component: 'WorkNotification',
    },
    {
        name: '问卷调查',
        code: 'question',
        icon: getAssetsFile('work/home/icon_tab_wjdc.png'),
        page: '/work/question',
        component: 'WorkQuestion',
    },
    { name: '投票调查', code: 'vote', icon: getAssetsFile('work/home/icon_tab_tpdc.png'), page: '/work/vote', component: 'WorkVote' },
    {
        name: '会议会务',
        code: 'meeting',
        icon: getAssetsFile('work/home/icon_tab_hyhw.png'),
        page: '/work/meeting',
        component: 'WorkMeeting',
    },
    {
        name: '活动报名',
        code: 'activity',
        icon: getAssetsFile('work/home/icon_tab_hdbm.png'),
        page: '/work/activity',
        component: 'WorkActivity',
    },
    {
        name: '内参资料',
        code: 'document',
        icon: getAssetsFile('work/home/icon_tab_nczl.png'),
        page: '/work/document',
        component: 'WorkDocument',
    },
    { name: '文件共享', code: 'file', icon: getAssetsFile('work/home/icon_tab_wjgx.png'), page: '/work/file', component: 'WorkFile' },
    { name: '群组设置', code: 'group', icon: getAssetsFile('work/home/icon_tab_qzsz.png'), page: '/work/group', component: 'WorkGroup' },
]

export const workStore = defineStore('work', {
    state: () => {
        return {
            tabs: [],
            subscriptionMap: {},
            pageCallback: undefined,
        }
    },
    getters: {
        //获取keep-live需要include的组件数组
        keepAlive(state) {
            let keep = state.tabs.map((item) => {
                return item.component
            })
            console.log('~~~~~~~~~~work store~~~~~~~~~~~~', keep)
            return keep
        },
    },
    actions: {
        addTab(url) {
            let page = url.indexOf('?') != -1 ? url.substring(0, url.indexOf('?')) : url
            console.log('work store page=' + page)

            let menu = modules.find((module) => module.page == page) //判断是否是需要处理标签的路由
            if (!menu) return
            let existMenu = this.tabs.find((tab) => tab.page == page)
            console.log('work store existMenu=', existMenu)
            console.log('work store modules=', modules)
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

            //判断是否存在工作台，如果不存在，则添加
            let existWork = this.tabs.find((tab) => tab.page == defaultTab)
            if (!existWork) {
                console.log('不存在工作台')
                let menuWork = modules.find((module) => module.page == defaultTab)
                let newMenu = JSON.parse(JSON.stringify(menuWork))
                this.tabs.unshift(newMenu)
            }
            return this.tabs
        },
        closeTab(index, router) {
            let tab = this.tabs[index]
            let isLast = index == this.tabs.length - 1
            let isSelected = tab.selected
            //删除复用
            // ZwRouteReuseStrategy.deleteRouteSnapshot(tab.page)
            //删除路由消息订阅
            this.removeSubscription(tab.page)
            //删除页面已读消息回调监听
            this.removeReadListener(tab.page)
            //删除websocket消息订阅
            this.removeWebsocketListener(tab.page)
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
            this.clearSubscription()
        },
        getTabs() {
            return this.tabs
        },
        /**
         *
         * @param url
         * @param callback  refresh 点击顶部刷新按钮时回调，search 点击顶部搜索后回调
         */
        setPageCallback(url, callback = { refresh: (result) => {}, search: (result) => {} }) {
            this.pageCallback = {
                url: url,
                callback: callback,
            }
        },
        refreshPage(currentUrl) {
            if (this.pageCallback && this.pageCallback.callback) {
                console.log(currentUrl)
                console.log(this.pageCallback.url)

                if (currentUrl == this.pageCallback.url) {
                    this.pageCallback.callback.refresh()
                }
            }
        },
        searchContent(content, currentUrl) {
            if (this.pageCallback && this.pageCallback.callback && this.pageCallback.callback.search) {
                console.log(currentUrl)
                console.log(this.pageCallback.url)
                if (currentUrl == this.pageCallback.url) {
                    this.pageCallback.callback.search(content)
                }
            }
        },
        addSubscription(path, item) {
            console.log('addSubscription path=' + path, item)
            //如果存在订阅，则先取消
            let last = this.subscriptionMap[path]
            if (last) {
                // console.log('~~~~~~~~~~~addSubscription last=' + path, last)
                last.unsubscribe()
            }
            // 删除之前的订阅
            delete this.subscriptionMap[path]
            // console.log('addSubscription subscriptionMap 1=', this.subscriptionMap)
            // 同一个路由只保留一份订阅
            this.subscriptionMap[path] = item
            // console.log('addSubscription subscriptionMap 2=', this.subscriptionMap)
        },
        clearSubscription() {
            try {
                for (let key in this.subscriptionMap) {
                    let item = this.subscriptionMap[key]
                    item.unsubscribe()
                    console.log('clearSubscription key=' + key, item)
                }
                this.subscriptionMap = {}
            } catch (err) {
                console.log('clearSubscription err', err)
            }
        },

        removeSubscription(path) {
            try {
                let item = this.subscriptionMap[path]
                if (item) {
                    item.unsubscribe()
                    console.log('removeSubscription key=' + path, item)
                }
            } catch (err) {
                console.log('removeSubscription err', err)
            }
        },
        removeReadListener(path) {
            // this.receiveService.removeListener(path)
        },
        removeWebsocketListener(path) {
            // try {
            //     this.webSocketService.removeListener(path)
            //     console.log('removeWebsocketListener key=' + path)
            // } catch (err) {
            //     console.log('removeSubscription err', err)
            // }
        },
    },
})
