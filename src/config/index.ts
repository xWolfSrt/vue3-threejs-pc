// 环境配置
// 引入的时候 import config from "XXX/config";
const env = import.meta.env.MODE || 'prod'
const envConfig = {
    dev: {
        // baseApi: '/',
    },
    test: {
        // baseApi: '/',
    },
    prod: {
        // baseApi: '/',
    },
}
export default {
    namespace: 'threejs',
    contactPhone: '400-000-0001',
    isTest: true,
    defaultDomain: 'https://release.gsdl.top',
    organization: 'a4c0acb5-c69d-11eb-b768-0c42a1039856',
    env,
    ...envConfig,
}
