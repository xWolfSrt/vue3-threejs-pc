import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/',
    //设置的别名
    resolve: {
        // 如果报错__dirname找不到，需要安装node,
        // 执行npm i @types/node --save-dev
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@common': path.resolve(__dirname, './src/common'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@components': path.resolve(__dirname, './src/components'),
            '@views': path.resolve(__dirname, './src/views'),
            '@styles': path.resolve(__dirname, './src/styles'),
        },
    },
    // 服务配置
    server: {
        // host: '0.0.0.0',
        port: 3001, // 端口号
        open: true, // 自动在浏览器打开
        https: false, // 是否开启 https
    },
    // css 处理
    css: {
        preprocessorOptions: {
            scss: {
                /* .scss全局预定义变量，引入多个文件 以;(分号分割)*/
                additionalData: `@import "./src/styles/css/global.scss";`,
            },
        },
    },
    //  生产环境
    build: {
        // 指定输出路径
        assetsDir: './',
        // 指定输出文件路径
        outDir: 'dist',
        // 块大小警告的限制（以 kbs 为单位）
        chunkSizeWarningLimit: 1500,
        // 代码压缩配置
        terserOptions: {
            // 生产环境移除console
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
    },
})
