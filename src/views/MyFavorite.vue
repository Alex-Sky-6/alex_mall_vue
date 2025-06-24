<template>
    <div class="wrapper">  
      <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>我的收藏</p>
  </header>
      
      <ul class="business">
        <!--: 循环迭代 商家列表部分 Begin -->
        <li v-for="business in businessList" :key="business.businessId" @click="toBusinessInfo(business.businessId)">
          <div class="business-img">
            <img :src="business.businessImg" />
            <!-- 角标：显示是购物车中的商品数量 -->
            <div class="business-img-quantity" v-if="business.quantity!= undefined & business.quantity != 0">
              {{business.quantity}}
            </div>
          </div>
          <div class="business-info">
            <h3>{{ business.businessName }}</h3>
            <p>&#165; {{ business.starPrice }} 起送 | &#165; {{ business.deliveryPrice }} 配送</p>
            <p>{{ business.businessExplain }}</p>    
          </div>
        </li>
        <!--: 循环迭代 商家列表部分 End -->
      </ul>
      
      <!-- 该分类下商家数组businessList长度小于等于0。显示没有商家数据 -->
      <div style="text-align: center; margin-top:20vw; ">该类别目前没有商家信息</div> 
      <!-- 底部菜单部分 -->
      <Footer></Footer>
  
    </div>
  </template>
  
  <script setup>
    import Footer from '../components/Footer.vue'
    import {ref} from "vue"
    import { get } from '@/api';
    import {useRouter,useRoute} from "vue-router"
    import { getSessionStorage } from '@/common';
    const router = useRouter(); //创建路由对象
    const route = useRoute();
    const businessList = ref([]);
    // 取出登录用户数据
    const account = getSessionStorage('account');
    //点击商家，获得商家编号，传递至商家详情页面
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

    //请求服务器端，查询该分类下的所有商家数据
    const loadBusiness=()=>{
        let url = `/favorite/byAccount/${account.accountId}`;
        get(url).then(res=>{
            businessList.value = res.data.resultdata;
            //先加载页面上商家的数据，然后再去加载购物车角标
            if(account!=null){
              loadCart();
            }
        })       
    }

        //请求服务器端，查询该分类下的所有商家数据
    // const loadBusiness=()=>{
    //     let url = `/favorite/byAccount?accountId=${account.accountId}`;
    //     get(url).then(res=>{
    //         businessList.value = res.data.resultdata;
    //         //先加载页面上商家的数据，然后再去加载购物车角标
    //         if(account!=null){
    //           loadCart();
    //         }
    //     })       
    // }
    

    const init = ()=>{
        loadBusiness();
    }
    init();
    const toback=()=>{
      router.back();
    }
  </script>
  
  <style scoped>
    /****************** 总容器 ******************/
    .wrapper {
      width: 100%;
      height: 100%;
    }
  
    /****************** header部分 ******************/
    .custom-header {
  width: 100%;
  height: 12vw;
  background: linear-gradient(to right, #fff1eb, #ace0f9);
  color: #596164;
  font-size: 5vw;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  /* 核心：让标题水平居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 箭头单独绝对定位，贴左侧 */
.back-arrow {
  position: absolute;
  left: 3vw; /* 距离左侧间距，可微调 */
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
}
  
    /****************** 商家列表部分 ******************/
    .wrapper .business {
      width: 100%;
      margin-top: 12vw;
      margin-bottom: 14vw;
    }
  
    .wrapper .business li {
      width: 100%;
      box-sizing: border-box;
      padding: 2.5vw;
      border-bottom: solid 1px #ddd;
      user-select: none;
      cursor: pointer;
  
      display: flex;
      align-items: center;
    }
  
    .wrapper .business li .business-img {
      /*这里设置为相当定位，成为business-img-quantity元素的父元素*/
      position: relative;
      
    }
  
    .wrapper .business li .business-img img {
      width: 20vw;
      height: 20vw;
      border-radius: 2.5vw;
    }
  
    .wrapper .business li .business-img .business-img-quantity {
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
  
    .wrapper .business li .business-info {
      margin-left: 3vw;
    }
  
    .wrapper .business li .business-info h3 {
      font-size: 3.8vw;
      color: #555;
    }
  
    .wrapper .business li .business-info p {
      font-size: 3vw;
      color: #888;
      margin-top: 2vw;
    }
  </style>
  