import { defineConfig } from 'umi';
const PORT = 8001;
export default defineConfig({
  outputPath: '../../public',
  publicPath: 'http://127.0.0.1:8001/',
  runtimePublicPath: true,
  history: {
    type: 'hash'
  },
  devServer: {
    port: PORT,
    host: '0.0.0.0',
    // writeToDisk: true
  },
  mfsu: {},
  // headScripts: [
  //   { src: './renderer.js' },
  //   { content: 'window.routerBase = "/"',charset: 'utf-8' }
  // ],
  // layout: {},
  routes: [
    { path: '/', component: '@/pages/home' },
  ],
});
