import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {getCurDate,setSessionStorage,getLocalStorage} from './common.js'
import ElementPlus from 'element-plus';
import '/node_modules/element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import filter from './filter/index.js'


const app = createApp(App); 
// 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

//全局注册过滤器
Object.keys(filter).forEach(key => {
    app.config.globalProperties[`$${key}`] = filter[key];
});


app.use(router).use(ElementPlus).mount('#app')
