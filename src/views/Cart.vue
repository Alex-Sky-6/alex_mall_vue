<template>
  <div class="wrapper">
    <!-- header部分 -->
    <header>
      <div class="back-arrow" @click="toback()">
        <el-icon><ArrowLeftBold /></el-icon>
      </div>
      <p>购物车</p>
    </header>

    <!-- 购物车商家列表 -->
    <div class="cart-content" v-if="cartBusinessList.length > 0">
      <div class="business-section" v-for="business in cartBusinessList" :key="business.businessId">
        <!-- 商家信息 -->
        <div class="business-header">
          <div class="business-checkbox">
            <input type="checkbox" :id="'business-' + business.businessId" v-model="business.selected" @change="onBusinessSelect(business)">
            <label :for="'business-' + business.businessId"></label>
          </div>
          <div class="business-logo">
            <img :src="business.businessImg">
          </div>
          <div class="business-info">
            <h3>{{business.businessName}}</h3>
            <p>{{business.businessExplain}}</p>
            <p>配送费{{business.deliveryPrice}}元</p>
          </div>
        </div>

        <!-- 商品列表 -->
        <ul class="food">
          <li v-for="(item, index) in business.cartItems" :key="item.cartId">
            <div class="food-left" v-if="item.goods">
              <img :src="item.goods.goodsImg">
              <div class="food-left-info">
                <h3>{{item.goods.goodsName}}</h3>
                <p>{{item.goods.goodsExplain}}</p>
                <p class="price">&#165; <em>{{item.goods.goodsPrice}}</em></p>
              </div>
            </div>
            <div class="food-left" v-else>
              <div class="food-left-info">
                <h3>商品信息加载中...</h3>
                <p>请稍候</p>
                <p class="price">&#165; <em>0</em></p>
              </div>
            </div>
            <div class="food-right">
              <div @click="minus(business.businessId, item)">
                <el-icon><RemoveFilled /></el-icon>
              </div>
              <p>
                <span>{{item.quantity}}</span>
              </p>
              <div @click="add(business.businessId, item)">
                <el-icon><CirclePlusFilled /></el-icon>
              </div>
            </div>
          </li>
        </ul>

        <!-- 商家小计 -->
        <div class="business-total">
          <p>小计: &#165; {{$fmtPrice(getBusinessTotal(business.cartItems, business))}}</p>
        </div>
      </div>
    </div>

    <!-- 空购物车状态 -->
    <div class="empty-cart" v-else>
      <div class="empty-icon">
        <el-icon size="80" color="#ccc"><ShoppingCartFull /></el-icon>
      </div>
      <p>购物车是空的</p>
      <p>快去选购商品吧~</p>
    </div>

    <!-- 底部结算栏 -->
    <div class="cart-bottom" v-if="cartBusinessList.length > 0">
      <div class="cart-left">
        <div class="cart-left-info">
          <p>总计: &#165; {{$fmtPrice(totalPrice)}}</p>
          <p>共 {{totalQuantity.value}} 件商品</p>
        </div>
      </div>
      <div class="cart-right">
        <div @click="toOrderConfirm()" class="cart-right-item">
          去结算
        </div>
      </div>
    </div>

    <!-- Footer组件 -->
    <!-- <Footer></Footer> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { get, post } from "@/api"
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import { CirclePlusFilled, RemoveFilled, ShoppingCartFull, ArrowLeftBold } from '@element-plus/icons-vue'
import { getSessionStorage } from "@/common"
import Footer from '@/components/Footer.vue'

// 创建路由对象
const router = useRouter()

// 取出登录用户数据
const account = getSessionStorage('account')

// 购物车商家列表
const cartBusinessList = ref([])

// 商家选择处理
const onBusinessSelect = (business) => {
  // 这里可以添加额外的选择逻辑
}

// 跳转至订单确认页面
const toOrderConfirm = () => {
  // 获取选中的商家
  const selectedBusinesses = cartBusinessList.value.filter(business => business.selected)
  if (selectedBusinesses.length === 0) {
    ElMessage({
      message: '请选择要结算的商家',
      type: 'warning',
    })
    return
  }
  // 暂时跳转到第一个选中商家的订单确认页面
  router.push({path: '/orderConfirm', query: {businessId: selectedBusinesses[0].businessId}})
}

// 计算总价（只计算选中的商家）
const totalPrice = computed(() => {
  let total = 0
  cartBusinessList.value.forEach(business => {
    if (business.selected) {
      business.cartItems.forEach(item => {
        if (item.goods) {
          total += item.quantity * item.goods.goodsPrice
        }
      })
      // 添加配送费
      if (business.deliveryPrice) {
        total += business.deliveryPrice
      }
    }
  })
  return total
})

// 计算总数量（只计算选中的商家）
const totalQuantity = computed(() => {
  let total = 0
  cartBusinessList.value.forEach(business => {
    if (business.selected) {
      business.cartItems.forEach(item => {
        total += item.quantity
      })
    }
  })
  return total
})

// 计算单个商家的小计（包含配送费）
const getBusinessTotal = (cartItems, business) => {
  let total = 0
  cartItems.forEach(item => {
    if (item.goods) {
      total += item.quantity * item.goods.goodsPrice
    }
  })
  // 添加配送费
  if (business && business.deliveryPrice) {
    total += business.deliveryPrice
  }
  return total
}

// 减少商品数量
const minus = (businessId, cartItem) => {
  if (!account) {
    router.push('/login')
    return
  }
  
  if (cartItem.quantity <= 1) {
    // 删除购物车项
    let url = "/cart/remove"
    let cart = {
      goodsId: cartItem.goodsId,
      businessId: businessId,
      accountId: account.accountId,
    }
    post(url, cart, true).then(res => {
      if (res.data.code == 20000) {
        loadCart()
      }
    })
  } else {
    // 更新数量
    updateCart(businessId, cartItem, -1)
  }
}

// 增加商品数量
const add = (businessId, cartItem) => {
  if (!account) {
    router.push('/login')
    return
  }
  updateCart(businessId, cartItem, 1)
}

// 更新购物车数量
const updateCart = (businessId, cartItem, num) => {
  let url = "/cart/update"
  let cart = {
    goodsId: cartItem.goodsId,
    businessId: businessId,
    accountId: account.accountId,
    quantity: cartItem.quantity + num
  }
  post(url, cart, true).then(res => {
    if (res.data.code == 20000) {
      cartItem.quantity += num
    }
  })
}

// 加载购物车数据
const loadCart = () => {
  if (!account) {
    router.push('/login')
    return
  }
  
  let url = `/cart/listCartByAccountId/${account.accountId}`
  get(url).then(res => {
    if (res.data.code === 20000) {
      let cartArray = res.data.resultdata
      
      // 按商家分组
      let businessMap = new Map()
      //将每个购物车项按所属商家 ID 归类到对应的商家对象的 cartItems 数组中
      cartArray.forEach(cart => {
        if (!businessMap.has(cart.businessId)) {
          businessMap.set(cart.businessId, {
            businessId: cart.businessId,
            businessName: '',
            businessImg: '',
            businessExplain: '',
            deliveryPrice: 0,
            selected: false,
            cartItems: []
          })
        }
        businessMap.get(cart.businessId).cartItems.push(cart)
      })
      
      // 获取商家信息和购物车详细数据
      let promises = []
      businessMap.forEach((business, businessId) => {
        // 获取商家信息
        let businessPromise = get(`/business/info/${businessId}`).then(res => {
          if (res.data.code === 20000) {
            let businessInfo = res.data.resultdata
            business.businessName = businessInfo.businessName
            business.businessImg = businessInfo.businessImg
            business.businessExplain = businessInfo.businessExplain
            business.deliveryPrice = businessInfo.deliveryPrice
          }
        })
        
        // 获取该商家的购物车详细数据（包含商品信息）
        let cartPromise = get(`/cart/listCart/${account.accountId}/${businessId}`).then(res => {
          if (res.data.code === 20000) {
            business.cartItems = res.data.resultdata
          }
        })
        
        promises.push(businessPromise, cartPromise)
      })
      
      Promise.all(promises).then(() => {
        cartBusinessList.value = Array.from(businessMap.values())
      })
    } else {
      ElMessage({
        message: '购物车数据加载失败',
        type: 'error',
      })
    }
  })
}

// 回退方法
const toback = () => {
  router.back()
}

// 页面初始化
const init = () => {
  loadCart()
}

onMounted(() => {
  init()
})
</script>

<style scoped>
/****************** 总容器 ******************/
.wrapper {
  width: 100%;
  height: 100%;
  padding-bottom: 15vw;
  background-color: #f5f5f5;
}

/****************** header部分 ******************/
.wrapper header {
  width: 100%;
  height: 12vw;
  background: linear-gradient(to right, #fff1eb, #ace0f9);
  color: #596164;
  font-size: 4.8vw;
  letter-spacing: 1vw;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.wrapper header .back-arrow {
  position: absolute;
  left: 4vw;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 5vw;
  color: #596164;
}

/****************** 购物车内容 ******************/
.cart-content {
  margin-top: 15vw;
  padding: 2vw;
}

.business-section {
  background-color: #fff;
  margin-bottom: 3vw;
  border-radius: 2vw;
  overflow: hidden;
}

/****************** 商家头部 ******************/
.business-header {
  padding: 3vw;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.business-checkbox {
  margin-right: 3vw;
}

.business-checkbox input[type="checkbox"] {
  width: 4vw;
  height: 4vw;
  margin: 0;
  cursor: pointer;
}

.business-checkbox label {
  cursor: pointer;
}

.business-logo img {
  width: 12vw;
  height: 12vw;
  border-radius: 2vw;
  margin-right: 3vw;
}

.business-info h3 {
  font-size: 4vw;
  color: #333;
  margin-bottom: 1vw;
}

.business-info p {
  font-size: 3vw;
  color: #999;
}

/****************** 食品列表部分 ******************/
.wrapper .food {
  width: 100%;
}

.wrapper .food li {
  width: 100%;
  box-sizing: border-box;
  padding: 3vw;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.wrapper .food li:last-child {
  border-bottom: none;
}

.wrapper .food li .food-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.wrapper .food li .food-left img {
  width: 16vw;
  height: 16vw;
  border-radius: 2vw;
}

.wrapper .food li .food-left .food-left-info {
  margin-left: 3vw;
  flex: 1;
}

.wrapper .food li .food-left .food-left-info .price {
  color: #df5643;
  font-weight: bold;
}

.wrapper .food li .food-left .food-left-info .price em {
  font-size: 3.6vw;
}

.wrapper .food li .food-left .food-left-info h3 {
  font-size: 3.8vw;
  color: #555;
  margin-bottom: 1vw;
}

.wrapper .food li .food-left .food-left-info p {
  font-size: 3vw;
  color: #888;
  margin-top: 1vw;
}

.wrapper .food li .food-right {
  width: 16vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wrapper .food li .food-right div {
  width: 5vw;
  height: 5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.wrapper .food li .food-right p {
  padding: 0 2vw;
  font-size: 4vw;
  color: #333;
}

/****************** 商家小计 ******************/
.business-total {
  padding: 3vw;
  text-align: right;
  background-color: #f9f9f9;
  border-top: 1px solid #f0f0f0;
}

.business-total p {
  font-size: 3.5vw;
  color: #333;
  font-weight: bold;
}

/****************** 空购物车状态 ******************/
.empty-cart {
  margin-top: 20vw;
  text-align: center;
  padding: 10vw;
}

.empty-icon {
  margin-bottom: 5vw;
}

.empty-cart p {
  font-size: 4vw;
  color: #999;
  margin-bottom: 2vw;
}

/****************** 底部结算栏 ******************/
.cart-bottom {
  width: 100%;
  height: 14vw;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  z-index: 10000;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.cart-bottom .cart-left {
  flex: 2;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding-left: 3vw;
}

.cart-bottom .cart-left .cart-left-info p:first-child {
  font-size: 4.5vw;
  color: #333;
  font-weight: bold;
  margin-bottom: 1vw;
}

.cart-bottom .cart-left .cart-left-info p:last-child {
  font-size: 3vw;
  color: #999;
}

.cart-bottom .cart-right {
  flex: 1;
}

.cart-bottom .cart-right .cart-right-item {
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