/**
 * 获取默认图片
 * @param {*} photo  图片json字符串  "[{\"Category\":null,\"Index\":0,\"Items\":[\"http://xxx/x.jpg\"]}]"
 * @param {*} config  图片压缩配置 { width: 100 , height: 100 , original: false } ，目标宽高，是否需要原图，需要原图的话，将返回对象列表 [{thumbnail: xx, url: xx}] ,否则只返回 图片列表 [xxx, xxx ]
 */
const getPicture = (photo, config) => {
    let picture = photo && toPicture(photo)
    return config ? compressPicture(picture, config) : picture
}

/**
 * 获取图片列表
 * @param {*} photo  图片json字符串  "[{\"Category\":null,\"Index\":0,\"Items\":[\"http://xxx/x.jpg\"]}]"
 * @param {*} needDefault  是否需要默认图片中的图片列表
 * @param {*} config  图片压缩配置 { width: 100 , height: 100 , original: false } ，目标宽高，是否需要原图，需要原图的话，将返回对象列表 [{thumbnail: xx, url: xx}] ,否则只返回 图片列表 [xxx, xxx ]
 */
const getPictures = (photo, needDefault = false, config) => {
    let pictures = photo && toPictures(photo, needDefault)
    return config ? compressPictures(pictures, config) : pictures
}

/**
 * 仅压缩图片
 * @param {*} photo 图片地址
 * @param {*} config  图片压缩配置 { width: 100 , height: 100 , original: false } ，目标宽高，是否需要原图，需要原图的话，将返回对象列表 [{thumbnail: xx, url: xx}] ,否则只返回 图片列表 [xxx, xxx ]
 */
const compressPicture = (photo, config) => {
    let picture
    if (photo && config) {
        let img = compress(photo, config.width || 0, config.height || 0)
        if (config.original) {
            picture = {
                thumbnail: img,
                url: photo,
            }
        } else {
            picture = img
        }
    }
    return picture || photo
}

/**
 * 仅压缩图片
 * @param {*} photos 图片列表地址
 * @param {*} config  图片压缩配置 { width: 100 , height: 100 , original: false } ，目标宽高，是否需要原图，需要原图的话，将返回对象列表 [{thumbnail: xx, url: xx}] ,否则只返回 图片列表 [xxx, xxx ]
 */
const compressPictures = (photos, config) => {
    let pictures
    if (photos && config) {
        pictures = photos.map((photo) => {
            let img = compress(photo, config.width || 0, config.height || 0)
            if (config.original) {
                return {
                    thumbnail: img,
                    url: photo,
                }
            } else {
                return img
            }
        })
    }
    return pictures || photos
}

/**
 * 获取图片
 * @param {*} photo 图片json字符串  "[{\"Category\":null,\"Index\":0,\"Items\":[\"http://xxx/x.jpg\"]}]"
 * @param {*} index 图片下标，默认取第一个
 * @returns
 */
const toPicture = (photo, index) => {
    let picture
    try {
        let pictures = JSON.parse(photo)

        if (!pictures) return
        pictures.forEach((item) => {
            if (item && (!item.Category || item.Category == null)) {
                picture = item
                return
            }
        })
    } catch (err) {
        console.log(err)
        return picture
    }
    return picture && (index < picture.Items.length ? picture.Items[index] : picture.Items[0])
}

const toPictures = (photo, needDefault = false) => {
    let list = []
    try {
        let pictures = JSON.parse(photo)

        pictures &&
            pictures.forEach((item) => {
                if (item && (needDefault || (item.Category && item.Category != null))) {
                    list = list.concat(item.Items)
                }
            })
    } catch (err) {
        console.log(err)
    }
    return list
}
const compress = (uri, width, height) => {
    let pixedRatio = window.devicePixelRatio || 2
    // Cos对象存储
    // let template
    // if (width == 0 && height == 0) {
    //     template = `imageView2/q/85/format/png` //https://cloud.tencent.com/document/product/460/6929
    // } else {
    //     template = `imageView2/2/w/${width * pixedRatio}/h/${height * pixedRatio}/q/85/format/png` //https://cloud.tencent.com/document/product/460/6929
    // }
    // console.log(template)

    // return `${uri.replace(this.constantService.cos.domain, this.constantService.cos.piccd)}?${template}`

    // 服务器裁剪
    // let windowWidth = Number(window.innerWidth)
    // if (config && config.ratio && windowWidth > 0 && width > 0)
    //     width = config.ratio ? Math.round((width * pixedRatio * windowWidth) / 750) : width

    // if (config && config.ratio && windowWidth > 0 && height > 0)
    //     height = config.ratio ? Math.round((height * pixedRatio * windowWidth) / 750) : height

    // let format = 'jpg'
    // let mode = 'high'
    // let stretch = 'uniform'
    // let compress = 90
    // return `${uri}?format=${format}&mode=${mode}&stretch=${stretch}&compress=${compress}&width=${width}&height=${height}`

    return uri
}
const test = () => {
    // import pictureService from '../../utils/picture-service'

    let photo =
        'http://upload.lianma.tech/live/debug/debug/upload/platform_member_user/bb4b2fd90b3a4214af844231f22fc60b/8bf5d7f6c43f56013d5edf96f3f57c36.jpg'
    let picture =
        '[{"Category":null,"Index":0,"Items":["http://upload.lianma.tech/live/debug/debug/upload/platform_member_user/bb4b2fd90b3a4214af844231f22fc60b/8bf5d7f6c43f56013d5edf96f3f57c36.jpg"]},{"Category":"abc","Index":0,"Items":["http://upload.lianma.tech/live/debug/debug/upload/platform_member_user/bb4b2fd90b3a4214af844231f22fc60b/8bf5d7f6c43f56013d5edf96f3f57c36.jpg","http://upload.lianma.tech/live/debug/debug/upload/platform_member_user/bb4b2fd90b3a4214af844231f22fc60b/8bf5d7f6c43f56013d5edf96f3f57c36.jpg","http://upload.lianma.tech/live/debug/debug/upload/platform_member_user/bb4b2fd90b3a4214af844231f22fc60b/8bf5d7f6c43f56013d5edf96f3f57c36.jpg"]}]'

    // console.log(pictureService.getPicture(picture))
    console.log(pictureService.getPicture(picture, { width: 100 }))
    console.log(pictureService.getPicture(picture, { width: 100, original: true }))
    // console.log(pictureService.getPictures(picture))
    console.log(pictureService.getPictures(picture, true, { width: 100 }))
    console.log(pictureService.getPictures(picture, true, { width: 100, original: true }))
    // console.log(pictureService.compressPicture(photo))
    // console.log(pictureService.compressPicture(photo, { width: 100 }))
}

const getMainColor = (imgId) => {
    const oImg = document.getElementById(imgId)

    const w = oImg.width
    const h = oImg.height
    console.log('===========', w, h)
    // 创建画布
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    // 绘制图片在画布上
    const context = canvas.getContext('2d')
    context.drawImage(oImg, 0, 0)

    // 取所有像素的平均值
    let imgData = context.getImageData(0, 0, canvas.width, canvas.height)
    let r = 0
    let g = 0
    let b = 0
    let a = 0
    for (let row = 0; row < canvas.height; row++) {
        for (let col = 0; col < canvas.width; col++) {
            r += imgData.data[(canvas.width * row + col) * 4]
            g += imgData.data[(canvas.width * row + col) * 4 + 1]
            b += imgData.data[(canvas.width * row + col) * 4 + 2]
            a += imgData.data[(canvas.width * row + col) * 4 + 3]
        }
    }
    // 求取平均值
    r /= canvas.width * canvas.height
    g /= canvas.width * canvas.height
    b /= canvas.width * canvas.height
    a /= canvas.width * canvas.height

    // 将最终的值取整
    r = Math.round(r)
    g = Math.round(g)
    b = Math.round(b)
    a = Math.round(a)

    let rgba = {
        r,
        g,
        b,
        a,
    }
    return rgba
}

/**
 * 图片转base64，并获取主色调
 * 使用方法
 * let picUrl = 'xxxx'
 *
 * let image = new Image()
 * image.src = picUrl
 * let vm = this
 * image.onload = function () {
 *    let base64 = vm.image2Base64(image)
 *    console.log(base64)
 * }
 */
const image2Base64 = (img) => {
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')

    // 图片原始尺寸
    let originWidth = img.width
    let originHeight = img.height
    // 最大尺寸限制，可通过设置宽高来实现图片压缩程度
    let maxWidth = window.innerWidth
    let maxHeight = (window.innerWidth * 9) / 16 //16/9
    // 目标尺寸
    let targetWidth = originWidth,
        targetHeight = originHeight
    // 图片尺寸超过最大尺寸限制
    if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
            // 更改宽度，按照宽度限定尺寸
            targetWidth = maxWidth
            targetHeight = Math.round(maxWidth * (originHeight / originWidth))
        } else {
            targetHeight = maxHeight
            targetWidth = Math.round(maxHeight * (originWidth / originHeight))
        }
    }
    // 对图片进行缩放
    canvas.width = targetWidth
    canvas.height = targetHeight
    // 清除画布
    context.clearRect(0, 0, targetWidth, targetHeight)
    /** 图片压缩
     * 第一个参数是创建的img对象
     * 第二三个参数是左上角坐标
     * 后两个参数是画布区域宽高
     */
    context.drawImage(img, 0, 0, targetWidth, targetHeight)
    /** 压缩后的base64文件
     * 第一个参数可以为image/jpeg或image/webp类型的图片
     * 第二个参数设置图片质量取值0-1，超出则以默认值0.92替代
     */
    // let newUrl = canvas.toDataURL('image/jpeg', 0.02)
    let dataURL = canvas.toDataURL('image/png', 0.02)
    console.log('-----------width----------', targetWidth)
    console.log('-----------width----------', targetHeight)

    // 取所有像素的平均值
    let imgData = context.getImageData(0, 0, canvas.width, canvas.height)
    let r = 0
    let g = 0
    let b = 0
    let a = 0
    for (let row = 0; row < canvas.height; row++) {
        for (let col = 0; col < canvas.width; col++) {
            r += imgData.data[(canvas.width * row + col) * 4]
            g += imgData.data[(canvas.width * row + col) * 4 + 1]
            b += imgData.data[(canvas.width * row + col) * 4 + 2]
            a += imgData.data[(canvas.width * row + col) * 4 + 3]
        }
    }

    // 求取平均值
    r /= canvas.width * canvas.height
    g /= canvas.width * canvas.height
    b /= canvas.width * canvas.height
    a /= canvas.width * canvas.height
    // 将最终的值取整
    r = Math.round(r)
    g = Math.round(g)
    b = Math.round(b)
    a = Math.round(a)

    let rgba = {
        r,
        g,
        b,
        a,
    }
    console.log(rgba)
    return {
        rgba,
        dataURL,
    }
}
export default {
    getPicture,
    getPictures,
    compressPicture,
    getMainColor,
}
