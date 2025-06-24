<template>
    <div class="wrapper">
        <header>
        <p>全部分类</p>
      </header>


        <!-- 商品的分类信息 动态数据
             {{ 插值表达式 }}只能将数据显示在标签中 <h1>{{变量名}}</h1>
              插值表达式无法将数据  赋给 标签的属性。
              使用v-bind 指令完成标签属性的绑定（赋值）
              v-bind:src="item.categoryCover"  v-bind后属性"item.categoryCover"不再是字符串，而是表达式
              v-bind:src="item.categoryCover" 简写 :src="item.categoryCover"
              :key="不重复数据"  作用优化v-for循环显示渲染数据的效率
         -->
              
        <ul class="category-ul">
            <li v-for="item in categoryList" :key="item.categoryId" @click="toBusinessList(item.categoryId)">
                <img :src="item.categoryCover" />
                <p>{{ item.categoryName }}</p>
            </li>
        </ul>
        
        <!-- 步骤3：使用组件 -->
        <Footer></Footer>
    </div>
</template>

<script setup>
    //vue3步骤1: 导入公共组件 (子组件)
    import Footer from '@/components/Footer.vue'
    // 在<script setup>顶部添加
    import { get,post } from '@/api/index.js'
    // 在<script setup>顶部添加
    import {ref,onMounted, onUnmounted,computed} from "vue"
    import {getSessionStorage} from "@/common.js"
    import {useRouter,useRoute} from "vue-router"
    import { ElMessage } from 'element-plus'
    import axios from 'axios'
    const router = useRouter(); //创建路由对象
    const route = useRoute();
    //用户登录信息
    const account = getSessionStorage("account");

    const categoryList = ref([]);
    const businessList = ref([]);
    const originalBusinessList = ref([]);
    //判断是否登录
    const isLogin = () => {
        if (!account || getSessionStorage("account") == null) {
            return false;
        } else {
            return true;
        }
    }


 //加载页面的商家分类
const loadCategory=()=>{
 get('/category/list').then(res=>{
 categoryList.value = res.data.resultdata;
 });
 }

    

// 在script setup中添加
const searchQuery = ref(''); // 搜索关键词


// 搜索方法
const searchBusiness = () => {
  if (!searchQuery.value.trim()) {
    // 搜索为空时恢复原始列表
    businessList.value = [...originalBusinessList.value];
    return;
  }
  
  // 调用后端搜索API
  get('/business/search', { 
    params: { 
      keyword: searchQuery.value.trim(),
      location: account?.accountAddress // 可添加位置筛选
    }
  }).then(res => {
    businessList.value = res.data.resultdata;
  });
}

 //页面初始化的方法
const init = ()=>{
 loadCategory();
}
 init();  //调用

const toBusinessList = (id) =>{
    //需要使用路由跳转时 传递参数
    router.push({path:'/businessList',query:{categoryId:id}})
}

 
</script>

<style scoped>
    .wrapper {
        width: 100%;
        height: 100%;
    }
    /*头部*/
    
        header {
        width: 100%;
        height: 14vw;
        background: linear-gradient(to right, #fff1eb, #ace0f9);
        color: #333;
        font-size: 4.8vw;
        font-weight: bold;
        letter-spacing: 1vw;
        position: relative;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom-left-radius: 5vw;
        border-bottom-right-radius: 5vw;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    /*搜索栏*/
    
    .wrapper .search {
        width: 100%;
        height: 15vw;
        margin-top: -2vw;
        position: relative;
        z-index: 1000;
    }
    
    .wrapper .search .search-top {
        width: 100%;
        height: 15vw;
        background: linear-gradient(to right, #fff1eb, #ace0f9);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .wrapper .search .search-box {
        width: 90%;
        height: 9vw;
        background-color: #fff;
        border-radius: 4vw;
        border: 0.4vw solid #a1c4fd;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 3.5vw;
        color: #79859E;
        padding: 0 10vw;
        box-sizing: border-box;
    }
    
    .wrapper .search .search-box .search_icon {
        background-image: url(../assets/search.png);
        width: 6.6vw;
        height: 6.6vw;
        display: block;
        background-size: cover;
    }
    
    .wrapper .search .search-box input {
        width: 100%;
        height: 4.5vw;
        line-height: 4.5vw;
        font-size: 4vw;
        border: none;
        outline: none;
        margin-left: 2vw;
        color: #79859E;
    }
    /*商品分类*/
    
    .wrapper .category-ul{
        width:100%; height: auto;; display: flex; flex-wrap: wrap;
        justify-content: flex-start;;
        align-content:center; padding:4.4vw; box-sizing: border-box;
        position: relative;
    }
    
    .wrapper .category-ul span{
        position: absolute;
        right: 1.5vw;
        top:-2vw;
        background-color: #ffde09;
        color:#fb8b06;
        border:0.3vw solid #444;
        border-radius: 1vw;
        padding: 0.5vw 2vw;
        font-weight: 800;
        box-shadow: 0.2vw 0.2vw 0.2vw rgba(0, 0, 0, 0.5);
        z-index: 9999;
        height:5vw;
    }

    .wrapper .category-ul li {
        width: 18vw;
        height: 18vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        user-select: none;
        cursor: pointer;
    }
    
    .wrapper .category-ul li img {
        width: 13vw;
        height: 11.3vw;
    }
    
    .wrapper .category-ul li p {
        font-size: 3.2vw;
        color: #79859E;
    }
    /*横幅广告*/
    
    .wrapper .banner {
        width: 95%;
        margin: 0 auto;
        height: 29vw;
        background-image: url(../assets/index_banner.png);
        background-repeat: no-repeat;
        background-size: cover;
        box-sizing: border-box;
        padding: 3vw 6vw;
    }
    
    .wrapper .banner h3 {
        font-size: 4.2vw;
        margin-bottom: 1.2vw;
    }
    
    .wrapper .banner p {
        font-size: 3.4vw;
        color: #79859E;
        margin-bottom: 2.4vw;
    }
    
    .wrapper .banner a {
        font-size: 3.6vw;
        color: #FF3D8D;
        font-weight: 600;
        cursor: pointer;
    }
    /*超级会员*/
    
    .wrapper .supermember {
        width: 95%;
        margin: 0 auto;
        height: 11.5vw;
        background: linear-gradient(to right bottom, #e2d1c3, #fdfcfb);
        margin-top: 1.3vw;
        border-radius: 1vw;
        color: #644f1b;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .wrapper .supermember .left {
        display: flex;
        align-items: center;
        margin-left: 4vw;
        user-select: none;
    }
    
    .wrapper .supermember .left img {
        width: 6vw;
        height: 6vw;
        margin-right: 2vw;
    }
    
    .wrapper .supermember .left h3 {
        font-size: 4vw;
        margin-right: 2vw;
    }
    
    .wrapper .supermember .left p {
        font-size: 3vw;
    }
    
    .wrapper .supermember .right {
        font-size: 3.4vw;
        margin-right: 4vw;
    }
    /*推荐商家*/
    
    .wrapper .show-business {
        width: 100%;
        height: 14vw;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .wrapper .show-business .show-business-line {
        width: 8vw;
        height: 0.3vw;
        background-color: #e2d1c3;
    }
    
    .wrapper .show-business p {
        font-size: 4vw;
        margin: 0 4vw;
        color: #79859E;
    }
    /*推荐方式*/
    
    .wrapper .showtype {
        width: 100%;
        height: 5vw;
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-bottom: 5vw;
        color: #79859E
    }
    
    .wrapper .showtype li {
        font-size: 3.5vw;
        color: #79859E;
    }
    /* 商家列表 */
    
    .wrapper .business {
        width: 100%;
        margin-bottom: 14vw;
        padding-bottom: 15vw;
    }
    
    .wrapper .business li .business-img-quantity {
        width: 5vw;
        height: 5vw;
        background-color: red;
        color: #fff;
        font-size: 3.6vw;
        border-radius: 2.5vw;
        display: flex;
        justify-content: center;
        align-items: center;
        /*设置成绝对定位，不占文档流空间*/
        position: absolute;
        right: -1.5vw;
        top: -1.5vw;
    }
    
    .wrapper .business li {
        width: 100%;
        box-sizing: border-box;
        padding: 2.5vw;
        user-select: none;
        border-bottom: 0.3vw solid #e2d1c3;
        display: flex;
    }
    
    .wrapper .business li img {
        width: 18vw;
        height: 18vw;
        border-radius: 2vw;
        position: relative;
        z-index: 0;
    }
    
    .wrapper .business li .business-info {
        width: 100%;
        box-sizing: border-box;
        padding: 0 3vw;
    }
    
    .wrapper .business li .business-info .business-info-h {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .wrapper .business li .business-info .business-info-h h3 {
        font-size: 4vw;
        color: #696969;
    }
    
    .wrapper .business li .business-info .business-info-h .business-info-like {
        width: 4.6vw;
        height: 3.4vw;
        color: #FF3D8D;
        font-size: 4vw;
        margin-right: 4vw;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .wrapper .business li .business-info .business-info-h .business-info-like .heart_icon {
        background-image: url(../assets/heart2.jpg);
        width: 8vw;
        height: 7vw;
        display: block;
        background-size: cover;
        background-position: center;
    }
    
    .wrapper .business li .business-info .business-info-h .business-info-like .heart_favorited {
        background-image: url(../assets/heart1.png);
        width: 8vw;
        height: 7vw;
        display: block;
        background-size: cover;
        background-position: center;
    }

    .wrapper .business li .business-info .business-info-star {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 3.1vw;
    }
    
    .wrapper .business li .business-info .business-info-star .business-info-star-left {
        display: flex;
        align-items: center;
    }
    
    .wrapper .business li .business-info .business-info-star .business-info-star-left .fa-star {
        color: #fcba26;
        margin-right: 0.5vw;
    }
    
    .wrapper .business li .business-info .business-info-star .business-info-star-left p {
        color: #666;
        margin-left: 1vw;
    }
    
    .wrapper .business li .business-info .business-info-star .business-info-star-right {
        background-color: #016cf4;
        color: #f9f9f9;
        font-size: 2.8vw;
        border-radius: 0.4vw;
        padding: 0 0.8vw;
    }
    
    .wrapper .business li .business-info .business-info-delivery {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #666;
        font-size: 3.1vw;
        margin-bottom: 2vw;
    }
    
    .wrapper .business li .business-info .business-info-explain {
        display: flex;
        justify-content: left;
        align-items: center;
    }
    
    .wrapper .business li .business-info .business-info-explain div {
        border: 0.1vw solid #e2d1c3;
        font-size: 3vw;
        color: #666;
        border-radius: 1vw;
        padding: 0 2vw;
        background-color: #fdfcfb;
    }
</style>