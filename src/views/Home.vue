<template>
    <div class="wrapper">
        <!-- 头部分 -->
        <div class="header">
            <div class="location-text">
                <i class="location_icon"></i>
                {{ account?account.accountName:'' }}
            </div>
            <!-- 用户登录之后显示头像 -->
            <div class="location-account" v-if="isLogin()" @click="gotocenter()">
                <img :src="account.accountImg" />
            </div>
        </div>
        <!-- 搜索栏 -->
        <div class="search">
            <div class="search-top" ref="fixedBox">
                <div class="search-box">
                    <i class="search_icon" aria-hidden="true" />
                    <input 
                        type="text" 
                        placeholder="搜索商家名称、商品名称" 
                        v-model="searchQuery"
                        @keyup.enter="handleSearch"
                    />
                </div>
            </div>
        </div>

        <!-- 商品的分类信息 动态数据
             {{ 插值表达式 }}只能将数据显示在标签中 <h1>{{变量名}}</h1>
              插值表达式无法将数据  赋给 标签的属性。
              使用v-bind 指令完成标签属性的绑定（赋值）
              v-bind:src="item.categoryCover"  v-bind后属性"item.categoryCover"不再是字符串，而是表达式
              v-bind:src="item.categoryCover" 简写 :src="item.categoryCover"
              :key="不重复数据"  作用优化v-for循环显示渲染数据的效率
         -->
        <ul class="category-ul">
            <span  @click="toAllCategory">...</span> <!-- 添加商品分类更多 按钮选项 -->
            <li v-for="item in categoryList.slice(0,10)" :key="item.categoryId" @click="toBusinessList(item.categoryId)">
                <img :src="item.categoryCover" />
                <p>{{ item.categoryName }}</p>
            </li>
        </ul>
        <!-- 横幅广告 -->
        <div class="banner">
            <h3>上海海洋大学临港校区</h3>
            <p>在线商城 齐全吃的香</p>
            <a>立即下单 &gt;</a>
        </div>

        <!-- 超级会员 -->
        <div class="supermember">
            <div class="left">
                <img src="../assets/super_member.png" />
                <h3>超级会员</h3>
                <p>&#8226; 每月享超级权益</p>
            </div>
            <div class="right">
                立即开通 &gt;
            </div>
        </div>

        <!--推荐商家-->
        <div class="show-business">
            <div class="show-business-line"></div>
            <p>推荐商家</p>
            <div class="show-business-line"></div>
        </div>

        <!-- 推荐方式 -->
        <ul class="showtype">
            <li>综合排序<i class="fa fa-caret-down" aria-hidden="true" /></li>
            <li>距离最近</li>
            <li>销量最高</li>
            <li>筛选<i class="fa fa-filter" aria-hidden="true" /></li>
        </ul>

        <!-- 商家列表信息
             v-for="(元素,下标) in 数组""
         -->
        <ul class="business">
            <li v-for="(item) in businessList" :key="item.businessId" @click="toBusinessInfo(item.businessId)">
                <div style="position: relative; z-index:0">
                    <img :src="item.businessImg" />
                    <div class="business-img-quantity" v-if="item.quantity!= undefined & item.quantity != 0">
                        {{item.quantity}}
                    </div>
                </div>
                <div class="business-info">
                    <div class="business-info-h">
                        <h3>{{ item.businessName }}</h3>
                        <div class="business-info-like" @click.stop="toggleFavorite(item)">
                            <i class="heart_icon" :class="{'heart_favorited': item.isFavorite}" />
                        </div>
                    </div>
                    <div class="business-info-star">
                        <div class="business-info-star-left">
                            
                            <p>评分:5 月售{{ item.soldNum }}单</p>
                        </div>
                        <div class="business-info-star-right">
                            商家专送
                        </div>
                    </div>
                    <div class="business-info-delivery">
                        <p>&#165; {{ item.starPrice }} 起送 | &#165; {{ item.deliveryPrice }} 配送</p>
                    </div>
                    <div class="business-info-explain">
                        <div>{{ item.businessExplain }}</div>
                    </div>
                </div>
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
    const searchQuery = ref(''); // 修复：定义searchQuery变量
    const handleSearch = () => {
    if (!searchQuery.value.trim()) return;
    router.push({
        path: '/search',
        query: { 
        keyword: searchQuery.value.trim() // 统一使用keyword
        }
    });
    }
    //判断是否登录
    const isLogin = () => {
        if (!account || getSessionStorage("account") == null) {
            return false;
        } else {
            return true;
        }
    }
    //加载页面的商家数据
const loadBusiness = ()=>{
 get('/business/list').then(res=>{
 businessList.value = res.data.resultdata.map(business => {
    return {
        ...business,
        isFavorite: false // 初始状态未收藏
    }
});
 if(account!=null){
    loadCart();
    loadFavorites();
 }
 })
 }
 //加载页面的商家分类
const loadCategory=()=>{
 get('/category/list').then(res=>{
 categoryList.value = res.data.resultdata;
 });
 }
const loadCart =()=>{
      let url = `/cart/listCartByAccountId/${account.accountId}`;
      get(url).then(res=>{
      if(res.data.code == 20000){
        let cartArray = res.data.resultdata;
        for(let i=0;i<businessList.value.length;i++){
          businessList.value[i].quantity =0;
          for(let cart of cartArray){
            if(businessList.value[i].businessId == cart.businessId){
              businessList.value[i].quantity += cart.quantity;
              }
            }
          }
        }
      });
    }

    const toBusinessInfo=(id)=>{
        router.push({path:'/businessInfo',query:{businessId:id}});
    }
const loadFavorites = () => {
    if (!account) return;
    get(`/favorite/byAccount/${account.accountId}`).then(res => {
        if (res.data && res.data.resultdata) {
            const favorites = res.data.resultdata;
            businessList.value.forEach(business => {
                const found = favorites.find(fav => fav.businessId === business.businessId);
                if (found) {
                    business.isFavorite = true;
                }
            });
        }
    }).catch(error => {
        console.error("加载收藏数据失败:", error);
    });
}

const toggleFavorite = async (business) => {
    if (!isLogin() || !account) {
        ElMessage({
            message: '请先登录再收藏商家',
            type: 'error',
        });
        return;
    }
    try {
        if (business.isFavorite) {
            await cancelFavorite(business);
            business.isFavorite = false;
            ElMessage({
                message: `已取消收藏【${business.businessName}】`,
                type: 'success',
            });
        } else {
            await addFavorite(business);
            business.isFavorite = true;
            ElMessage({
                message: `已收藏【${business.businessName}】`,
                type: 'success',
            });
        }
    } catch (error) {
        console.error("切换收藏状态失败:", error);
        ElMessage({
            message: '操作失败，请重试',
            type: 'error',
        });
    }
}
    
const addFavorite = async (business) => {
    return post('/favorite/save', {
        accountId: account.accountId,
        businessId: business.businessId
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

const cancelFavorite = (business) => {
    // 构造查询字符串
    const params = new URLSearchParams({
        accountId: account.accountId,
        businessId: business.businessId,
    }).toString();
    let url = `/favorite/remove?${params}`;
    post(url, {}, true);
};



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
 loadBusiness();
}
 init();  //调用

const gotocenter=()=>{
    router.push('center');
}

const toBusinessList = (id) =>{
    //需要使用路由跳转时 传递参数
    router.push({path:'/businessList',query:{categoryId:id}})
}

const toAllCategory = () =>{
    //需要使用路由跳转时 传递参数
    router.push({path:'/allCagetory'})
}

 /* ---头部固定搜索--- */
 const fixedBox = ref(null);
 onMounted(() => {
 document.onscroll = () => {
 //获取滚动条位置
let s1 = document.documentElement.scrollTop;
 let s2 = document.body.scrollTop;
 let scroll = s1 == 0 ? s2 : s1;
 //获取视口宽度
let width = document.documentElement.clientWidth;
 //获取顶部固定块
let search = fixedBox.value;
 //判断滚动条超过视口宽度的12%时，搜索块变固定定位
if (scroll > width * 0.12) {
 search.style.position = "fixed";
 search.style.left = "0";
 search.style.top = "0";
 } else {
 search.style.position = "static";
 }
 };
 });
 // 销毁
onUnmounted(() => {
 //当切换到其他组件时，就不需要document滚动条事件，所以将此事件去掉
document.onscroll = null;
 });
</script>

<style scoped>
    .wrapper {
        width: 100%;
        height: 100%;
    }
    /*头部*/
    
    .wrapper .header {
        width: 100%;
        height: 14vw;
        background: linear-gradient(to right, #fff1eb, #ace0f9);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .wrapper .header .location-text {
        font-size: 4vw;
        font-weight: 600;
        color: #596164;
        margin: 0 1vw 0 3vw;
        display: flex;
        justify-content: left;
    }
    
    .wrapper .header .location-text .location_icon {
        background-image: url(../assets/location.png);
        width: 6.6vw;
        height: 6.6vw;
        display: block;
        background-size: cover;
    }
    
    .wrapper .header .location-text .fa-angle-down {
        margin-left: 1.5vw;
    }
    
    .wrapper .header .location-account img {
        width: 9vw;
        height: 9vw;
        border-radius: 5vw;
        margin: 2vw 3vw 0 0;
        border: 0.5vw solid #fff;
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
        width:100%; height: 44vw; display: flex; flex-wrap: wrap;
        justify-content: space-around;
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