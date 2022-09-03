const test = () => {
    // import dateService from '../../utils/date-service'
    let date = new Date()
    let date1 = '2022-07-04 20:30:11'
    console.log(dateService.format(date, 'yyyy-MM-dd HH:mm'))
    console.log(dateService.convert(date1))
    console.log(dateService.format(dateService.convert(date1), 'HH:mm'))
}

export default {
    //fmt 格式  "yyyy-MM-dd HH:mm:ss"  "yyyy-MM-dd"

    format(dateStr, fmt) {
        if (!dateStr || !fmt) return dateStr

        let datetime = dateStr

        if (dateStr && typeof dateStr == 'string') {
            let array = dateStr.split(' ')
            let date = array[0].split('-')
            let time = array[1] && array[1].split(':')
            datetime =
                (time &&
                    new Date(
                        Number(date[0]),
                        Number(date[1]) - 1,
                        Number(date[2]),
                        Number(time[0]),
                        Number(time[1]),
                        Number(time[2] || 0)
                    )) ||
                new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))
        }
        let o = {
            'M+': datetime.getMonth() + 1, //月份

            'd+': datetime.getDate(), //日

            'h+': datetime.getHours(), //小时

            'H+': datetime.getHours(),

            'm+': datetime.getMinutes(), //分

            's+': datetime.getSeconds(), //秒

            S: datetime.getMilliseconds(), //毫秒
        }

        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (datetime.getFullYear() + '').substr(4 - RegExp.$1.length))

        for (let k in o)
            if (new RegExp('(' + k + ')').test(fmt))
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))

        return fmt
    },

    convert(dateStr) {
        let datetime

        if (dateStr && typeof dateStr == 'string') {
            let array = dateStr.split(' ')
            let date = array[0].split('-')
            let time = array[1] && array[1].split(':')
            datetime =
                (time &&
                    new Date(
                        Number(date[0]),
                        Number(date[1]) - 1,
                        Number(date[2]),
                        Number(time[0]),
                        Number(time[1]),
                        Number(time[2] || 0)
                    )) ||
                new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))
        }
        return datetime
    },

    //返回 DateTime(year,month,day,hour,minute,second)
    getLambdaFullDate(dateStr, onlyDay) {
        if (!dateStr) {
            return ''
        }
        let datetime = dateStr

        if (dateStr && typeof dateStr == 'string') {
            let array = dateStr.split(' ')
            let date = array[0].split('-')
            let time = array[1] && array[1].split(':')
            datetime =
                (time &&
                    new Date(
                        Number(date[0]),
                        Number(date[1]) - 1,
                        Number(date[2]),
                        Number(time[0]),
                        Number(time[1]),
                        Number(time[2] || 0)
                    )) ||
                new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))
        }
        let year = datetime.getFullYear()
        let month = datetime.getMonth() + 1
        let day = datetime.getDate()
        let hour = datetime.getHours()
        let minute = datetime.getMinutes()
        let second = datetime.getSeconds()

        if (onlyDay) {
            return 'java.time.LocalDateTime.of(' + year + ',' + month + ',' + day + ')'
            // return 'DateTime(' + year + ',' + month + ',' + day + ')'
        } else {
            return 'java.time.LocalDateTime.of(' + year + ',' + month + ',' + day + ',' + hour + ',' + minute + ',' + second + ')'
            // return 'DateTime(' + year + ',' + month + ',' + day + ',' + hour + ',' + minute + ',' + second + ')'
        }
    },
}
