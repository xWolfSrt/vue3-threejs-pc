import http from '../utils/http/httpclient'
import pictureService from '../utils/picture-service.js'
import dateService from '../utils/date-service'
let { post } = http

const query = (pager) =>
    post('/platform/api/profile/information/queryListResult', {
        pager: pager,
    })

const fetch = (id) =>
    post('/platform/api/profile/information/fetchUserSummaryResult', {
        information: id,
    })

const getList = (list) => {
    return (
        list &&
        list.map((item) => {
            return getItem(item)
        })
    )
}
const getItem = (item) => {
    let type = getCategory(item.category && item.category.code)
    let photos = []
    if (type == 'picture') {
        photos = item.photo && pictureService.getPictures(item.photo, false, { width: window.innerWidth / 3 })
    }
    return {
        id: item.id,
        agent: {
            id: item.organization && item.organization.id,
            name: item.organization && item.organization.name,
            photo: pictureService.getPicture(item.organization && item.organization.photo, { width: 120 }),
        },
        type: type,
        name: item.title,
        content: item.content,
        photo: pictureService.getPicture(item.photo, { width: 400 }),
        photos: photos,
        time: dateService.format(item.addTime, 'yyyy-MM-dd'),
        top: item.top,
    }
}

const getCategory = (code) => {
    let category = 'text'
    switch (code) {
        case 'BannerCategory_Profile_Text':
            category = 'text'
            break
        case 'BannerCategory_Profile_ManyImage':
            category = 'picture'
            break
        case 'BannerCategory_Profile_BigImage':
            category = 'video'
            break
        case 'BannerCategory_Profile_ImageText':
            category = 'text'
            break
        default:
            break
    }
    return category
}
export default {
    query,
    fetch,
    getList,
    getItem,
}
