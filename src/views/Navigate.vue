<template>
    <div class="container"></div>
    <ZwLoading ref="zwLoading" @errorTap="zwLoadingErrorTap"></ZwLoading>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import ZwLoading from '../components/ZwLoading.vue'
import organizationService from '../api/organization'
import userService from '../api/user'
import tabbarService from '../utils/tabbar-service'
import { appStore } from '../store/app-store'
import { workStore } from '../store/work-store'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()
const zwLoading = ref(null)
const appService = appStore()
const workService = workStore()
let isReloading = false

let retryCount = 0
let maxRetryCount = 3

let maxWaitTime = 800
let temp = {
    from: undefined,
    organization: undefined,
}

onMounted(() => {
    console.log(proxy)
    console.log(proxy.$router.currentRoute)
    console.log(proxy.$router.currentRoute.value.query)
    try {
        let params = proxy.$router.currentRoute.value.query
        temp.from = params.from
        temp.organization = params.organization
    } catch (error) {
        console.log(error)
    }
    appService.clear()
    workService.clear()
    reload()
})
const reload = () => {
    isReloading = true
    zwLoading.value.showLoading()
    temp.start = new Date().getTime()
    getOrganizationList()
}
const getOrganizationList = () => {
    organizationService
        .queryList()
        .then((result) => {
            if (!result || result.length == 0) {
                ElMessage.error('暂未加入组织')
                toLogin()
                return
            }

            let list = organizationService.getList(result)
            proxy.$storage.set('organizationList', list)

            let selectedOrganizationId
            //如果是切换组织，则暂时使用选择的组织去刷新token，刷新成功，才保存为已选组织，防止刷新失败，但是组织却切换成功的问题
            if (temp.organization) {
                selectedOrganizationId = temp.organization
            } else {
                //检查之前是否选择过组织
                let lastSelectedOrganization = proxy.$storage.get('selectedOrganization')
                if (lastSelectedOrganization) {
                    selectedOrganizationId = lastSelectedOrganization.id
                }
            }
            let selectedOrganization
            //检查选择的组织是否还存在
            let index = findIndexInList(list, selectedOrganizationId)
            //如果未选择或者组织已经不存在，默认选择第一个
            if (!selectedOrganizationId || index == -1) {
                selectedOrganization = list[0]
            } else {
                selectedOrganization = list[index]
            }
            temp.selectedOrganization = selectedOrganization
            refreshToken(selectedOrganization.id)
        })
        .catch((err) => {
            console.log(err)
            reloadError()
        })
}
const findIndexInList = (list, target) => {
    return (
        (target &&
            list.findIndex((item) => {
                return target == item.id
            })) ||
        -1
    )
}

const refreshToken = (organization) => {
    let token = proxy.$storage.get('token')
    console.log('refreshToken', token)

    userService
        .refreshToken(token.refresh_token, organization)
        .then((result) => {
            proxy.$storage.set('token', result)
            proxy.$storage.set('selectedOrganization', temp.selectedOrganization)
            getPermissionSet()
        })
        .catch((err) => {
            console.log(err)
            reloadError()
        })
}

const getPermissionSet = () => {
    userService
        .getPermission()
        .then((result) => {
            if (result) {
                proxy.$storage.set('permissionSet', result)
                console.log(result)
                getEmployeeSummary()
            } else {
                reloadError()
            }
        })
        .catch((err) => {
            console.log(err)
            reloadError()
        })
}

const getEmployeeSummary = () => {
    organizationService
        .getEmployeeSummaryResult()
        .then((result) => {
            proxy.$storage.set('employeeInfo', result)
            console.log(result)
            reloadSuccess()
        })
        .catch((err) => {
            console.log(err)
            reloadError()
        })
}

const reloadError = () => {
    if (retryCount < maxRetryCount) {
        zwLoading.value.showError('加载数据失败，请重试')
    } else {
        zwLoading.value.showError('加载数据失败，请重新登录', false, '重新登录')
    }
}

const zwLoadingErrorTap = () => {
    if (retryCount < maxRetryCount) {
        retryCount += 1
        reload()
    } else {
        proxy.$router.replace('/login')
    }
}

const reloadFinish = () => {
    isReloading = false
    zwLoading.value.hide()
}

const reloadSuccess = () => {
    let end = new Date().getTime()
    let diff = end - temp.start
    let wait = diff > maxWaitTime ? 0 : maxWaitTime - diff
    console.log('diff=' + diff)
    console.log('wait=' + wait)

    setTimeout(() => {
        disposeNavigate()
    }, wait)
}

const disposeNavigate = () => {
    let list = tabbarService.getList()

    // list.forEach((item) => {
    //     item.enable = true
    // })
    let target
    list.forEach((item) => {
        if (!target && item.enable) {
            target = JSON.parse(JSON.stringify(item))
        }
    })
    if (target && target.path) {
        proxy.$router.push(target.path)
    } else {
        ElMessage.error('暂无权限使用该系统')
        proxy.$router.replace('/login')
    }
}
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
}
</style>
