import axios from 'axios'
import storage from '../localstorage'
import router from '../../router'
import config from '../../config'
// axios.defaults.baseURL = ''  //正式

let domain = storage.get('host')
//cowx-union-employee-provider-foreground-web:fa695e96-a92b-4413-b886-5fe692cec0f8
let authorization = 'Y293eC11bmlvbi1lbXBsb3llZS1wcm92aWRlci1mb3JlZ3JvdW5kLXdlYjpmYTY5NWU5Ni1hOTJiLTQ0MTMtYjg4Ni01ZmU2OTJjZWMwZjg=' //h5 赣商动力 商联协同

//请求接口需要登录权限的列表
const list = ['api/verification/sms/fetch', 'api/verification/sms/validate', 'api/register/sms', 'gateway/api/refresh']

axios.defaults.baseURL = config.isTest ? config.defaultDomain : domain
// 请求头，headers 信息
axios.defaults.headers['Content-Type'] = 'application/json'
axios.defaults.headers['Authorization'] = `basic ${authorization}`

// 表示跨域请求时是否需要使用凭证 允许跨域携带cookie信息
axios.defaults.withCredentials = false

//post请求头
// 允许跨域
axios.defaults.headers.post['Access-Control-Allow-Origin-Type'] = '*'
// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

//设置超时
axios.defaults.timeout = 15000

// 添加请求拦截器
axios.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        console.log('interceptors request', config)
        let url = config.url
        let token = storage.get('token')
        // console.log(token)
        if (!config.headers['x-cos-security-token']) {
            if (!token || checkNeedNotToken(url)) {
                config.headers['Authorization'] = `basic ${authorization}`
            } else {
                config.headers['Authorization'] = `${token.token_type} ${token.access_token}`
            }
        }
        return config
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
    }
)

axios.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        // console.log('interceptors response', response)
        // if (response.status == 200) {
        return Promise.resolve(response)
        // } else {
        // return Promise.reject(response)
        // }
    },
    (error) => {
        // 对响应错误做点什么
        // alert(JSON.stringify(error), '请求异常', {
        //     confirmButtonText: '确定',
        //     callback: (action) => {
        //         console.log(action)
        //     }
        // });
        return Promise.reject(error)
    }
)

const checkNeedNotToken = (url) => {
    let result = false
    if (list) {
        list.forEach((item) => {
            if (url.indexOf(item) != -1) {
                result = true
            }
        })
    }
    return result
}

const complete = (args, callback, result) => {
    //获取服务器时间
    let serverDate = (result && result.headers && result.headers['Date']) || result.headers['date']
    storage.set('serverDate', (serverDate && new Date(serverDate)) || new Date())

    console.log('complete', result)
    switch (result.status) {
        case 200:
            if (result.data.success) {
                _success(callback, args, result.data.result)
            } else {
                //如果token过期，鉴权失败，则跳转到登录页面
                if (result.data.errorCode && result.data.errorCode == 'PermissionException') {
                    authInvalid(callback, args, { msg: '登录已过期' })
                    return
                }
                //如果该用户已在别处登录,登录失败，则跳转到登录页面
                if (result.data.errorCode && result.data.errorCode == 'AuthenticationException') {
                    authInvalid(callback, args, { msg: '该用户已在别处登录' })
                    return
                }
                let code, msg
                let message = (result.data.errorMessage && result.data.errorMessage.split('|')) || []

                if (message.length == 1) {
                    if (result.data.errorMessage.indexOf('EX_') != -1) {
                        msg = ''
                        code = message[0]
                    } else {
                        msg = message[0]
                    }
                } else if (message.length > 1) {
                    msg = message[0]
                    code = message[1]
                }
                _error(callback, args, { msg: msg, code: code })
            }
            break
        case 202:
            // router.navigate(['/system-maintenance'])
            _error(callback, args, { msg: '服务器维护中' })
            break
        // case 500:
        //     console.log('----------5000-----', result)

        //     //如果token过期，鉴权失败，则跳转到登录页面
        //     if (result && result.body && result.body.message && result.body.message == 'unauthorized exception') {
        //         _error(callback, args, { msg: '登录已过期' })
        //         authInvalid(args)
        //         return
        //     }
        default:
            // _error(callback, args, { msg: (result && result.body) || '网络异常' })
            _error(callback, args, { msg: '网络异常' })
            break
    }
}
const _success = (callback, args, result) => {
    if (result && (/(register\/sms)/g.test(args.url) || /(login\/password)/g.test(args.url) || /(register\/token)/g.test(args.url))) {
        storage.set('token', result)
    }
    callback.resolve(result)
}
const _error = (callback, args, result) => {
    if (result.status == '401') {
        console.log('鉴权失败 token 无效')
        authExpire(callback, args, '登录已过期')
        return
    } else if (result.status == '404') {
        console.log('404')
    } else {
        console.log('_error ', result.status)
    }
    callback.reject({ msg: result.msg, code: result.code })
}

const authInvalid = (callback, args, result) => {
    if (args && /(api\/gsmh\/home\/fetch)/g.test(args.url)) {
        console.log('authInvalid', args.url)
        //进入登录页面则清空token
        storage.remove('token')
        //清除登录信息
        storage.remove('currentAccount')
        post(args.url, args.data, callback)
    } else {
        toLogin()
        _error(callback, args, result)
    }
}
const authExpire = (callback, args, result) => {
    let token = storage.get('token')
    //如果报401，则刷新token，否则跳转到登录页面
    if (token && token.refresh_token) {
        let url = `/gateway/api/refresh`
        console.log(url)

        //如果是刷新token的时候报401，则说明refreshtoken已过期，不继续刷新token
        if (args && /(gateway\/api\/refresh)/g.test(args.url)) {
            //防止某些页面路由守卫不允许跳转，导致一直刷新token的问题
            storage.remove('token')
            toLogin()
            callback.reject({ msg: result.msg, code: result.code })
        } else {
            get(url, {
                token: token.refresh_token,
            })
                .then((res) => {
                    storage.set('token', res)
                    if (args.type == 'POST') {
                        post(args.url, args.data, callback)
                    } else {
                        get(args.url, args.data, callback)
                    }
                })
                .catch((err) => {
                    //防止某些页面路由守卫不允许跳转，导致一直刷新token的问题
                    storage.remove('token')
                    toLogin()
                    callback.reject({ msg: result.msg, code: result.code })
                })
        }
    } else {
        //如果是门户首页，401的话，就清空token 重新调用首页接口
        if (args && /(api\/gsmh\/home\/fetch)/g.test(args.url)) {
            console.log('authExpire', args.url)
            //进入登录页面则清空token
            storage.remove('token')
            //清除登录信息
            storage.remove('currentAccount')
            if (args.type == 'POST') {
                post(args.url, args.data, callback)
            } else {
                get(args.url, args.data, callback)
            }
        } else {
            toLogin()
            callback.reject({ msg: result.msg, code: result.code })
        }
    }
}
const toLogin = () => {
    router.push({
        path: '/login',
        query: {
            needBack: true,
            is401: true,
        },
    })
}
/**
 * @param {String} url
 * @param {Object} data
 * @param { resolve: (result) => {}, reject: (error) => {} } callback  //可为空
 * @returns Promise
 */
const post = (url, data, callback) => {
    return new Promise((resolve, reject) => {
        if (!callback) {
            callback = { resolve, reject }
        }
        axios({
            method: 'post',
            url,
            // data: qs.stringify(data),
            data: data,
        })
            .then((result) => {
                console.log('post请求成功', result)
                // resolve(result.data)
                complete({ type: 'POST', url: url, data: data }, callback, result)
            })
            .catch((error) => {
                // reject(error)
                console.log('root post请求失败', error)
                _error(
                    callback,
                    { type: 'POST', url: url, data: data },
                    {
                        msg: (error && error.error) || (error && error.name && error.name == 'TimeoutError' && '请求超时') || '网络异常',
                        status: error && error.response && error.response.status,
                    }
                )
            })
    })
}

/**
 * @param {String} url
 * @param {Object} data
 * @param { resolve: (result) => {}, reject: (error) => {} } callback  //可为空
 * @returns Promise
 */
const get = (url, data, callback) => {
    return new Promise((resolve, reject) => {
        if (!callback) {
            callback = { resolve, reject }
        }
        axios({
            method: 'get',
            url,
            params: data,
        })
            .then((result) => {
                console.log('get请求成功', result)
                complete({ type: 'GET', url: url, data: data }, callback, result)
                // resolve(result.data)
            })
            .catch((error) => {
                // reject(error)
                console.log('get请求失败', error)
                _error(
                    callback,
                    { type: 'GET', url: url, data: data },
                    {
                        msg: (error && error.error) || (error && error.name && error.name == 'TimeoutError' && '请求超时') || '网络异常',
                        status: error && error.response && error.response.status,
                    }
                )
            })
    })
}

/**
 * @param {String} url
 * @param {Object} data
 * @returns Promise
 */
const postOriginal = (url, data) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url,
            // data: qs.stringify(data),
            data: data,
        })
            .then((result) => {
                console.log('postOriginal请求成功', result)
                resolve(result)
            })
            .catch((error) => {
                reject(error)
                console.log('postOriginal请求失败', error)
            })
    })
}

/**
 * @param {String} url
 * @param {Object} data
 * @returns Promise
 */
const getOriginal = (url, data) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url,
            params: data,
        })
            .then((result) => {
                console.log('getOriginal请求成功', result)
                resolve(result)
            })
            .catch((error) => {
                console.log('getOriginal请求失败', error)
                reject(error)
            })
    })
}
export default {
    get,
    getOriginal,
    post,
    postOriginal,
}
