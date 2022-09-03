const getGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

//json字符串
const getFiles = (data) => {
    if (!data || data.length == 0) return

    let files = []
    data.forEach((item) => {
        let url = item.path
        let size = item.size || 0
        let name = item.name || '文件'

        let property = getFileProperty(url)
        let fileIcon = property.icon
        let fileType = property.type

        files.push({
            icon: fileIcon,
            name: name,
            type: fileType,
            size: size,
            sizeText: fileSizeChange(size),
            url: url,
        })
    })
    return files
}
const fileSizeChange = (limit) => {
    let size = ''
    if (limit < 0.1 * 1024) {
        //小于0.1KB，则转化成B
        size = limit.toFixed(2) + 'B'
    } else if (limit < 0.1 * 1024 * 1024) {
        //小于0.1MB，则转化成KB
        size = (limit / 1024).toFixed(2) + 'KB'
    } else if (limit < 0.1 * 1024 * 1024 * 1024) {
        //小于0.1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
    } else {
        //其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
    }
    let sizeStr = size + '' //转成字符串
    let index = sizeStr.indexOf('.') //获取小数点处的索引
    let dou = sizeStr.substring(index + 1, index + 3) //获取小数点后两位的值
    // let dou = sizeStr.substr(index + 1, 2) //获取小数点后两位的值
    if (dou == '00') {
        //判断后两位是否为00，如果是则删除00
        return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5)
        // return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
    }
    return size
}

const getFileProperty = (url) => {
    let map = {
        pdf: 'common/icon_file_pdf.png',
        picture: 'common/icon_file_picture.png',
        excel: 'common/icon_file_excel.png',
        word: 'common/icon_file_word.png',
        txt: 'common/icon_file_txt.png',
        video: 'common/icon_file_video.png',
        default: 'common/icon_file_unknown.png',
    }
    let icon = map.default
    let type = 'txt'

    if (url) {
        //获得文件扩展名,有时后缀会带有?1234566
        let patternFileExtension = /\.([0-9a-zA-Z]+)(?:[\?#]|$)/i
        let fileExtension = url.match(patternFileExtension)
        console.log(fileExtension)

        let fileType = (fileExtension && fileExtension.length > 1 && fileExtension[1]) || 'txt'
        type = fileType.toLowerCase()
        switch (type) {
            case 'pdf':
            case 'ppt':
            case 'pptx':
                icon = map.pdf
                break
            case 'doc':
            case 'docx':
                icon = map.word
                break
            case 'xls':
            case 'xlsx':
                icon = map.excel
                break
            case 'txt':
                icon = map.txt
                break
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'ico':
            case 'bmp':
                icon = map.picture
                break
            case 'mp4':
            case 'flv':
            case 'rm':
            case 'rmvb':
            case 'wmv':
            case 'avi':
            case 'mkv':
            case '3gp':
            case 'mov':
            case 'vob':
                icon = map.video
                break
            default:
                icon = map.default
                break
        }
        console.log(type)
    }
    return {
        type: type,
        icon: icon,
    }
}

const trimStr = (str) => {
    return str.replace(/(^\s*)|(\s*$)/g, '')
}
//返回介于 min 和 max之间的随机整数 , (1,100)  1<=number<=100, (1,100,false) 1<=number<100
const getRndInteger = (min, max, includeMax = true) => {
    return Math.floor(Math.random() * (max - min + (includeMax ? 1 : 0))) + min
}
export default {
    getGuid,
    getFiles,
    getFileProperty,
    fileSizeChange,
    trimStr,
    getRndInteger,
}
