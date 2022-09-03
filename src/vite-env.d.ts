/// <reference types="vite/client" />
declare module 'stats-js'

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
