import getAssetsFile from './pub-use'
import storage from './localstorage'
let list = [
    {
        name: '工作台',
        code: 'work',
        icon: {
            common: getAssetsFile('tab/icon_tab_work.png'),
            selected: getAssetsFile('tab/icon_tab_work_selected.png'),
        },
        path: '/work',
        enable: false,
    },
    // {
    //     name: '业务台',
    //     code: 'business',
    //     icon: {
    //         common: getAssetsFile('tab/icon_tab_business.png'),
    //         selected: getAssetsFile('tab/icon_tab_business_selected.png'),
    //     },
    //     path: '/business',
    //     enable: false,
    // },
    // {
    //     name: '管理台',
    //     code: 'manage',
    //     icon: {
    //         common: getAssetsFile('tab/icon_tab_manage.png'),
    //         selected: getAssetsFile('tab/icon_tab_manage_selected.png'),
    //     },
    //     path: '/manage',
    //     enable: false,
    // },
    {
        name: '日程表',
        code: 'schedule',
        icon: {
            common: getAssetsFile('tab/icon_tab_schedule.png'),
            selected: getAssetsFile('tab/icon_tab_schedule_selected.png'),
        },
        path: '/schedule',
        enable: false,
    },
    {
        name: '通讯录',
        code: 'contact',
        icon: {
            common: getAssetsFile('tab/icon_tab_contact.png'),
            selected: getAssetsFile('tab/icon_tab_contact_selected.png'),
        },
        path: '/contact',
        enable: false,
    },
]
const getList = () => {
    checkPermissionList()
    return list
}

const checkPermissionList = () => {
    let permissionSet = storage.get('permissionSet')
    console.log(permissionSet)
    console.log('checkPermissionList 1', JSON.parse(JSON.stringify(list)))
    if (permissionSet) {
        checkPermissionNode(permissionSet)
    }
    console.log('checkPermissionList 2', JSON.parse(JSON.stringify(list)))
}
const checkPermissionNode = (permissionSet) => {
    let permission = permissionSet.permission
    let rule = permissionSet.rule
    let items = permissionSet.items
    let name = permission.entity.name

    let target = checkInList(list, name)

    let isManager = storage.get('employeeInfo') == null || !storage.get('employeeInfo').enable
    if (target) {
        //如果是管理员，不显示工作台，日程表和通讯录
        if (isManager && (target.code == 'work' || target.code == 'schedule' || target.code == 'contact')) {
            target.enable = false
        } else {
            let enable = rule == 'allow'
            if (enable) {
                target.enable = true
            } else {
                findChildPermissionNodeEnable(permissionSet, () => {
                    target.enable = true
                })
            }
        }
    }
    items &&
        items.forEach((item) => {
            checkPermissionNode(item)
        })
}

const findChildPermissionNodeEnable = (permissionSet, callback) => {
    let permission = permissionSet.permission
    let rule = permissionSet.rule
    let items = permissionSet.items
    let name = permission.entity.name

    if (rule == 'allow') {
        callback.call()
        return
    }
    items &&
        items.forEach((item) => {
            findChildPermissionNodeEnable(item, callback)
        })
}
const checkInList = (list, target) => {
    let t =
        target &&
        list.filter((item) => {
            return target == item.name
        })
    return t.length > 0 ? t[0] : undefined
}
export default {
    getList,
}
