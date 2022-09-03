import config from '../config'
/**
 * 使用方式
 * * * main.js挂载全局
 *  import storage from './utils/localstorage';
    const app = createApp(App);
    app.config.globalProperties.$storage = storage;
 * * * vue3.0 全局使用 vue实例上的数据
 *  import { defineComponent, reactive, getCurrentInstance } from "vue";
 *  let { proxy } = getCurrentInstance();
    proxy.$storage.set("username","aaa");
    proxy.$storage.set("age",20);
    proxy.$storage.set("user",{ name : 'a',age : 18});
    proxy.$storage.get("user");
    proxy.$storage.remove("age");
    proxy.$storage.clear();
 */
export default {
    get(key) {
        let value
        if (key) {
            value = localStorage.getItem(`${config.namespace}_${key}`)
            if (value && value != 'undefined' && value != null) value = JSON.parse(value)
        }
        return value
    },

    set(key, value) {
        if (!key) return
        if (value) localStorage.setItem(`${config.namespace}_${key}`, JSON.stringify(value))
        else this.remove(key)
    },

    remove(key) {
        if (key) localStorage.removeItem(`${config.namespace}_${key}`)
    },

    clear() {
        localStorage.clear()
    },
}
