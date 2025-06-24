<template>
  <div class="wrapper">  
    <!-- header部分 -->
    <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>商家详情</p>
  </header>
    

    <!-- 商家信息banner -->
    <div class="business-info-banner">
        <!-- 查看全部评论 -->
        <div class="top-right" >
            <div class="AllComment" @click="toBusinessComment">
                查看评论
                <i class="el-icon-d-arrow-right"></i>
            </div>
        </div>

        <div class="business-logo">
            <img :src="business.businessImg">
        </div>

        <div class="business-info">
            <h1>{{business.businessName}}</h1>
            <p style="color:#333; align">&#165;  {{business.starPrice}} 起送  &nbsp;|&nbsp;  &#165; {{business.deliveryPrice}} 配送</p>
            <p>{{business.businessExplain}}</p>
        </div>
    </div>


    <!-- 商品信息 -->
    <ul class="food">
        <!--TODO: 循环迭代显示 商家售卖 商品数组信息 Begin -->
        <li v-for="(item,index) in goods" :key="item.goodsId" >
          <div class="food-left">
            <!-- 根据remark属性是否有值，动态显示 -->
            <div class="dish-img-feature" v-if="item.remarks">
              {{ item.remarks }}
            </div>
            <img :src="item.goodsImg">
            <div class="food-left-info">
              <h3>{{item.goodsName}}</h3>
              <p>{{item.goodsExplain}}</p>
              <p class="price">&#165; <em>{{item.goodsPrice}}</em></p>
            </div>
          </div>
          <div class="food-right">
            <!-- disabled 标签失效(不可用)  -->
            <div @click="minus(index)">
              <!--减去餐品数量按钮：如果数量等于或者小于0，那么按钮不显示  v-show="item.quantity!=0"-->
              <!-- <i class="el-icon-remove-outline"></i>  -->
               <el-icon :style="{ color:'#ff812c' }"><RemoveFilled /></el-icon>
            </div>
            <p>
              <span> {{item.quantity}} </span>
              <!-- <span v-show="true">1</span> -->
            </p>
            <div @click="add(index)">
               <el-icon :style="{ color:'#ff812c' }"><CirclePlusFilled /></el-icon>
            </div>
          </div>
          <div class="mask" v-if ="item.statu==0">
              <span>抱歉, 该商品已下架</span>
          </div>  
        </li>
        <!--TODO: 循环迭代显示 商家售卖 餐品信息 End -->
    </ul>

    <!--TODO: 购物车部分 Begin-->
    <div class="cart">
        <div class="cart-left">
          <!--购物车中没有商品，则显示灰色图标 -->
          <div class="cart-left-icon" :style="totalQuantity > 0 ? 'background-color:#fb8b0d' : 'background-color:#cecece'"> 
            <!-- <div class="cart-left-icon" style="background-color:#ffde09"> -->
                <!-- <i class="el-icon-shopping-cart-1"></i> -->
                 <el-icon><ShoppingCartFull /></el-icon>
                <div class="cart-left-icon-quantity"> 
                  {{totalQuantity}}
                </div>
          </div>
          <div class="cart-left-info">
            <!-- 餐品总价 -->
            <p>&#165; {{totalPrice}}</p>
            <p>另需配送费 {{business.deliveryPrice}} 元</p>
          </div>
        </div>
        <div class="cart-right">
          <!-- 不够起送费显示内容  -->
           <div @click="toOrderConfirm()"  v-if="totalPrice>=business.starPrice" class="cart-right-item" >
            去结算
          </div>
          <div v-else class="cart-right-item" :style="'background-color:#CECECE;'" >
            &#165; {{business.starPrice}} 起送
          </div> 
          
        </div>
      </div>
      <!--TODO: 购物车部分End-->
  </div>
</template>

<script setup>
import { ref,computed } from "vue"
import { get ,post} from "@/api";
import { useRouter, useRoute } from "vue-router"
import { ElMessage } from 'element-plus'
import { CirclePlusFilled, RemoveFilled,ShoppingCartFull } from '@element-plus/icons-vue'
import { getSessionStorage } from "@/common";
//页面显示商家详情对象
const business = ref({});
//创建路由对象
const router = useRouter();
const route = useRoute();
//商品的数组
const goods = ref([]);
//获得商家编号businessId，查询商家
const businessId = route.query.businessId;

//取出登录用户数据
const account = getSessionStorage('account');

//跳转至订单确认页面
const toOrderConfirm =()=>{
  router.push({path:'/orderConfirm',query:{businessId:businessId}});
}

//加载购物车数据
const loadCart = () => {
    let url = `/cart/listCart/${account.accountId}/${businessId}`;
    get(url).then(res => {
        if (res.data.code === 20000) {
            let cartArray = res.data.resultdata;
            for (let g of goods.value) {
                g.quantity = 0;
                for (let cart of cartArray) {
                    if (g.goodsId === cart.goodsId) {
                        g.quantity = cart.quantity;
                    }
                }
            }
        }
    });
}

// 计算属性
const totalPrice = computed(() => {
    let s = 0;
    for (let item of goods.value) {
        s += item.quantity * item.goodsPrice;
    }
    return s;
});

//计算属性 计算商品数量
const totalQuantity = computed(() => {
    let count = 0;
    for (let g of goods.value) {
        count += g.quantity;
    }
    return count;
});

const minus = (index) => {
    if (account == null) {
        router.push('/login');
        return;
    }
    if (goods.value[index].quantity == 0) {
        return;
    }
    if (goods.value[index].quantity > 1) {
        //数量-1 执行数据update
        updateCart(index, -1);
    } else {
        //数据库记录 从(1)到(0) ，执行delete
        let url = "/cart/remove";
        let cart = {
            goodsId: goods.value[index].goodsId,
            businessId: businessId,
            accountId: account.accountId,
        };
        post(url, cart, true).then(res => {
            if (res.data.code == 20000) {
                goods.value[index].quantity = 0;
            }
        })
    }
}

const add = (index) => {
    if (account == null) {
        router.push('/login');
        return;
    }

    if (goods.value[index].quantity == 0) {
        //购物车记录 (0)到(1)，往数据库新增(insert)
        let url = "/cart/add";
        let cart = {
            goodsId: goods.value[index].goodsId,
            businessId: businessId,
            accountId: account.accountId,
            quantity: 1 //减 -1 加 1
        };
        post(url, cart, true).then(res => {
            if (res.data.code == 20000) {
                goods.value[index].quantity = 1;
            }
        });
    } else {
        //购物车记录已经存在该商品，执行 数量+1 （update）
        updateCart(index, 1);
    }
}

const updateCart = (index, num) => {
    let url = "/cart/update";
    let cart = {
        goodsId: goods.value[index].goodsId,
        businessId: businessId,
        accountId: account.accountId,
        quantity: goods.value[index].quantity + num // 减 -1 加 1
    };
    post(url, cart, true).then(res => {
        if (res.data.code == 20000) {
            goods.value[index].quantity += num;
        }
    });
}


const loadGoodsByBusinessId = () => {
    let url = `/goods/listByBusinessId/${businessId}`;
    get(url).then(res => {
        if (res.data.code === 20000) {
            let tempArray = res.data.resultdata;
            //循环tempArray,给每个商品添加quantity属性
            for (let i = 0; i < tempArray.length; i++) {
                tempArray[i].quantity = 0; //每个商品的数量默认为 0
            }
            goods.value = tempArray;

            //先查询商品数据，再取购物车数据
            if(account!=null){
              loadCart();
            }
        } else {
            ElMessage({
                message: '商品数据加载失败',
                type: 'error',
            })
        }
    })
}

const loadBusinessInfo = () => {
    let url = `/business/info/${businessId}`;
    get(url).then(res => {
        if (res.data.code === 20000) {
            business.value = res.data.resultdata;
        } else {
            ElMessage({
                message: '商家数据加载失败',
                type: 'error',
            })
        }
    });
}

const init = () => {
    loadBusinessInfo();
    loadGoodsByBusinessId();
}
init();

const toback=()=>{
  router.back();
}

// 跳转到商家评论页面
const toBusinessComment = () => {
  router.push({path: '/businessComment', query: {businessId: businessId}});
}

</script>

<style scoped>
    /****************** 总容器 ******************/
    .wrapper {
      width: 100%;
      height: 100%;
      padding-bottom: 15vw;
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
    
    .wrapper .business-info-banner{  
       
        padding:0;
        margin: 0;
        margin-top:15vw;
    }

    .wrapper .business-info-banner .top-right{
        float: right;
        margin-right: 4vw;
        margin-bottom: 6vw;
        border-radius: 2.5vw;
        padding: 1vw 2vw;
    }
    .wrapper .business-info-banner .AllComment{
        font-size: 3.5vw;
        color:#1c95ff;
    }

    /****************** 商家logo部分 ******************/
    .wrapper .business-logo {  
      width: 100%;
      height: 35vw;
      /*使用上外边距避开header部分*/
  
      display: flex;
      justify-content: center;
      align-items: center;
      
    }
    .wrapper .business-logo img {
      width: 30vw;
      height: 30vw;
      border-radius: 5vw;
      border: 2vw solid #efefef;
    }
  
    /****************** 商家信息部分 ******************/
    .wrapper .business-info {
      width: 100%;
      height: 20vw;
  
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .wrapper .business-info h1 {
      font-size: 4vw;
      margin-top: 2vw;
    }
    .wrapper .business-info p {
      font-size: 3vw;
      color: #999;
      margin-top: 1vw;
      align-items: left;
    }
  
    /****************** 食品列表部分 ******************/
    .wrapper .food {
      width: 100%;
      /*使用下外边距避开footer部分*/
      margin-bottom: 14vw;
      padding:5vw;
      box-sizing: border-box;
    }
    .wrapper .food li {
      width: 100%;
      box-sizing: border-box;
      padding: 2.5vw;
      user-select: none;
  
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .wrapper .food li .food-left {
      display: flex;
      align-items: center;
    }

    .wrapper .food li .food-left .dish-img-feature {
        background-color: #ff812c;
        width: 6.8vw;
        height: 4.5vw;

        position: absolute;
        top: 3vw;
        left: -0.3vw;
        z-index: 50;

        color: #fff;
        font-size: 2.6vw;
        line-height: 4vw;
        text-align: center;
        border-bottom-right-radius: 1vw;
        border: 0.1vw solid #444;

        box-shadow: 0.3vw 0.3vw 0.3vw rgba(0, 0, 0, 0.5);
    }

    .wrapper .food li .food-left img {
      width: 19vw;
      height: 19vw;
      border-radius: 3vw;
    }
    .wrapper .food li .food-left .food-left-info {
      margin-left: 3vw;
    }

    .wrapper .food li .food-left .food-left-info .price{
      color:#df5643;
      
      font-weight: bold;
    }
    .wrapper .food li .food-left .food-left-info .price em{
      font-size:3.6vw;
    }

    .wrapper .food li .food-left .food-left-info h3 {
      font-size: 3.8vw;
      color: #555;
    }
    .wrapper .food li .food-left .food-left-info p {
      font-size: 3vw;
      color: #888;
      margin-top: 2vw;
    }
    .wrapper .food li .food-right {
      width: 16vw;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .wrapper .food li .food-right i {
      font-size: 5vw;
      color: #0197f4;
      cursor: pointer;
    }
    .wrapper .food li .food-right p {
      padding:0 2vw;
      font-size: 4.5vw;
      color: #333;
    }
    .wrapper .food li .food-right .fa-plus-circle {
      font-size: 5.5vw;
      color: #3cba92;
      cursor: pointer;
    }

    .wrapper .food li .mask {
        position:absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 1.5vw;
        background-color: rgba(1, 53, 121, 0.2);
        z-index: 999;

        display: flex;
        justify-content: center;
        align-items: center;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .wrapper .food  li .mask span{
        color: #fefefe;
        font-size: 4vw;
        font-weight: 800;
    }
  
    /****************** 购物车部分 ******************/
    .wrapper .cart {
      width: 100%;
      height: 14vw;
  
      position: fixed;
      left: 0;
      bottom: 0;
      display: flex;
      /*保证工具栏显示在所有页面标签之上*/
      z-index:10000;
    }
    .wrapper .cart .cart-left {
      flex: 2;
      background-color: #66717d;
      display: flex;
    }
    .wrapper .cart .cart-left .cart-left-icon {
      width: 16vw;
      height: 16vw;
      box-sizing: border-box;
      border: solid 1.6vw #444;
      border-radius: 8vw;
      background-color: #66acfd;
      font-size: 7vw;
      color: #fff;
  
      display: flex;
      justify-content: center;
      align-items: center;
  
      margin-top: -4vw;
      margin-left: 3vw;
  
      position: relative;
    }
    .wrapper .cart .cart-left .cart-left-icon-quantity {
      width: 5vw;
      height: 5vw;
      border-radius: 2.5vw;
      background-color: red;
      color: #fff;
      font-size: 3.6vw;
  
      display: flex;
      justify-content: center;
      align-items: center;
  
      position: absolute;
      right: -1.5vw;
      top: -1.5vw;
    }
    .wrapper .cart .cart-left .cart-left-info p:first-child {
      font-size: 4.5vw;
      color: #fff;
      margin-top: 1vw;
    }
    .wrapper .cart .cart-left .cart-left-info p:last-child {
      font-size: 2.8vw;
      color: #80b5e6;
    }
  
    .wrapper .cart .cart-right {
      flex: 1;
    }
    /*达到起送费时的样式*/
    .wrapper .cart .cart-right .cart-right-item {
      width: 100%;
      height: 100%;
      background-color: #ff812c;
      color: #fff;
      font-size: 4.5vw;
      font-weight: 700;
      user-select: none;
      cursor: pointer;
  
      display: flex;
      justify-content: center;
      align-items: center;
    }
</style>