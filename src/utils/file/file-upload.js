import '../../assets/js/cos-auth.min.js'
import axios from 'axios'

/**
 *
 * @param {*} file
 * @param {*} options { server ,  directory }
 * @returns
 */
const cosUpload = (file, options) => {
    let fileName = file.name
    let fileSize = file.size
    let _options = {
        server: options.server,
        path: `${options.directory}/${fileName}`,
        fileName: fileName,
    }

    let formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
        cosFileAuth(_options, {
            success: (url, url2, name, headers) => {
                let SecurityToken = headers['SecurityToken']
                let auth = headers['Authorization']
                let xhr = new XMLHttpRequest()
                xhr.open('PUT', url, true)
                xhr.setRequestHeader('Authorization', auth)
                SecurityToken && xhr.setRequestHeader('x-cos-security-token', SecurityToken)
                xhr.upload.onprogress = function (e) {
                    let progress = Math.round((e.loaded / e.total) * 10000) / 100
                    console.log('上传进度 ' + progress + '%')
                }
                xhr.onload = function () {
                    console.log(xhr)
                    if (/^2\d\d$/.test('' + xhr.status)) {
                        console.log(url2)
                        // vm.callback.progress.call(vm.scope, 100)
                        resolve({
                            url: url2,
                            name: fileName,
                            size: fileSize,
                        })
                    } else {
                        // callback('文件 ' + Key + ' 上传失败，状态码：' + xhr.status);
                        reject(`上传失败`)
                    }
                }
                xhr.onerror = function () {
                    // callback('文件 ' + Key + ' 上传失败，请检查是否没配置 CORS 跨域规则');
                    reject(`上传失败`)
                }
                xhr.send(file)
            },
            fail: (msg) => {
                // vm.callback.fail.call(vm.scope, msg)
                reject(msg)
            },
        })
    })
}

const cosFileAuth = (_options, callback = { success: (url, url2, name, headers) => {}, fail: (msg) => {} }) => {
    // let directory = `${this.options.directory || this.globalService.getGuid}`
    // // let fileType: string = fileUrl.substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length)
    // //获得文件扩展名,有时后缀会带有?1234566
    // let patternFileExtension = /\.([0-9a-zA-Z]+)(?:[\?#]|$)/i
    // let fileExtension = fileUrl.match(patternFileExtension)
    // let fileType = (fileExtension && fileExtension.length > 1 && fileExtension[1]) || 'jpg'

    // let fileName = `${this.options.name || this.globalService.getGuid()}.${fileType}`
    // let _options = {
    //     server: this.options.server,
    //     path: `${directory}/${fileName}`,
    // }
    console.log(_options)
    getAuthorization(
        _options,
        (authData) => {
            let headers = {
                Authorization: authData.authorization,
                SecurityToken: authData.xCosSecurityToken,
            }
            let url = authData.prefix + camSafeUrlEncode(_options.path).replace(/%2F/g, '/')
            let url2 = authData.domain ? authData.domain + '/' + camSafeUrlEncode(_options.path).replace(/%2F/g, '/') : url
            callback.success(url, url2, _options.fileName, headers)
        },
        (error) => {
            callback.fail(`上传失败`)
        }
    )
}

// 签名
const getAuthorization = (options, callback, errback) => {
    getTmpCredential(
        options.server,
        (res) => {
            // let prefix = `https://${environment.cos.domain}/`
            let prefix = `https://${res.bucket}.cos.${res.region}.myqcloud.com/`
            let authorization = window.CosAuth({
                SecretId: res.credentials.tmpSecretId,
                SecretKey: res.credentials.tmpSecretKey,
                Method: 'PUT',
                Pathname: '/' + options.path,
            })
            let authData = {
                xCosSecurityToken: res.credentials.token, // token
                authorization: authorization, // 签名
                prefix: prefix, // 客户端不保存上传路径内的桶名称和区域名称，需要通过回调获得
                domain: res.domain,
            }
            console.log('获取签名成功')
            console.log(authData)
            callback(authData)
        },
        (err) => {
            console.log('获取签名失败')
            console.log(err)
            errback(err)
        }
    )
}

// 获取临时密钥
const getTmpCredential = (server, callback, errback) => {
    let url = `https://release.gsdl.top/gateway/api/tencent/cos/getCredential?server=${server}`
    axios
        .get(url, {
            timeout: 1000,
        })
        .then((res) => {
            console.log('getTmpCredential res', res)
            if (res.data.success && res.data.result) {
                console.log('获取临时密钥成功')
                console.log(res.data.result)
                callback(res.data.result)
            } else {
                console.log('获取临时密钥失败')
                console.log(res)
                errback('获取临时密钥出错')
            }
        })
        .catch((err) => {
            console.log('getTmpCredential err', err)
            console.log('获取临时密钥失败')
            console.log(err)
            errback(err)
        })
}

// url转换
const camSafeUrlEncode = (str) => {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
}

export default {
    cosUpload,
}
