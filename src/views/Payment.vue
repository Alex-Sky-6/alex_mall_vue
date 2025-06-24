<template>
    <div class="wrapper">
  
      <!-- header部分 -->
      <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>在线支付</p>
  </header>
  
      <!-- 订单信息部分 -->
      <div class="order-info">
        <p>订单信息：</p>
        <div class="order-info-row">
            <div class="business-info">
                <img v-if="order.business?.businessImg" :src="order.business?.businessImg" alt="商店图片" class="business-img">
                <div class="business-details">
                    <h4>{{order.business?.businessName || '加载中...'}}</h4>
                    <br>
                    <h5>配送费：&#165;{{order.business?.deliveryPrice || 0}}</h5>
                    <p>&#165; {{order.orderTotal || 0}}</p>
                </div>
            </div>
        </div>
        
        <!-- 商品详情部分 -->
        <div class="goods-details-section" v-if="order.ordersdetailet && order.ordersdetailet.length > 0">
          <p class="goods-title">商品详情：</p>
          <ul class="goods-list">
            <li v-for="(item, index) in order.ordersdetailet" :key="item.odId" class="goods-item">
              <div class="goods-left">
                <img v-if="item.goods?.goodsImg" :src="item.goods?.goodsImg" alt="商品图片" class="goods-img">
                <div class="goods-info">
                  <h4 class="goods-name">{{item.goods?.goodsName || '商品名称'}}</h4>
                  <p class="goods-price">&#165; {{item.goods?.goodsPrice || 0}}</p>
                </div>
              </div>
              <div class="goods-right">
                <p class="goods-quantity">x {{item.quantity || 1}}</p>
                <p class="goods-total">&#165; {{((item.goods?.goodsPrice || 0) * (item.quantity || 1)).toFixed(2)}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- 支付方式部分 -->
      <ul class="payment-type">
        <li @click="selectPaymentType(1)" :class="{ active: paymentType === 1 }">
          <div class="payment-left">
            <img src="../assets/alipay.png">
            <div class="payment-info">
              <p class="payment-name">支付宝</p>
            </div>
          </div>
          <div class="payment-right">
            <i class="fa fa-check-circle" v-if="paymentType === 1"></i>
            <i class="fa fa-circle-o" v-else></i>
          </div>
        </li>
        <li @click="selectPaymentType(2)" :class="{ active: paymentType === 2 }">
          <div class="payment-left">
            <img src="../assets/wechat.png">
            <div class="payment-info">
              <p class="payment-name">微信支付</p>
            </div>
          </div>
          <div class="payment-right">
            <i class="fa fa-check-circle" v-if="paymentType === 2"></i>
            <i class="fa fa-circle-o" v-else></i>
          </div>
        </li>
      </ul>
      <div class="payment-button">
        <button @click="pay()">确认支付</button>
      </div>
  
      <!-- 底部菜单部分 -->
      <Footer></Footer>
    </div>
</template>
  
<script setup>
  import Footer from '../components/Footer.vue';
  import {ref,onMounted} from 'vue';
  import {useRouter,useRoute} from 'vue-router';
  import {getSessionStorage} from '../common.js';
  import {get,post,put} from '../api/index.js';
  import {ElMessage} from 'element-plus';

  const router = useRouter();
  const route = useRoute();

  const orderId = route.query.orderId;
  const account = getSessionStorage('account');
  const order = ref({
      businessName:'加载中...',
      orderTotal:0,
      businessImg: '' // 添加商店图片字段
  });
  const paymentType = ref(1);

  onMounted(() => {
      // 根据orderId从服务器获取订单信息
      let url = `/orders/businessInfo/${orderId}`;
      get(url).then(res=>{
          console.log('API响应:', res.data);
          if(res.data.code==20000){
              const data = res.data.resultdata;
              console.log('订单原始数据:', data);
              // 直接使用返回的数据结构              
              const orderData = data[0];
              // 确保 ordersdetailet 是一个数组
              if (orderData.ordersdetailet && !Array.isArray(orderData.ordersdetailet)) {
                  orderData.ordersdetailet = [orderData.ordersdetailet];
              }

              // 如果ordersdetailet存在，则将商品信息合并进去
              if (orderData.ordersdetailet && orderData.goods) {
                  orderData.ordersdetailet.forEach(item => {
                      // 因为API返回的ordersdetailet中没有goodsId来匹配，
                      // 并且只有一个顶层goods对象，我们直接将其赋给订单详情项
                      item.goods = orderData.goods;
                  });
              }
              order.value = orderData;
              console.log('处理后的订单数据:', order.value);
          } else {
              console.error('API返回错误:', res.data);
          }
      }).catch(e=>{
          console.error('获取订单信息失败:', e);
      });
  });

  const selectPaymentType = (type) => {
      paymentType.value = type;
  }

  const pay = () => {
      const paymentMethod = paymentType.value === 1 ? '支付宝' : '微信支付';
      
      // 调用后端API更新订单支付状态
      const url = `/orders/updatePaymentStatus/${orderId}/1`; // 1表示已支付
      // 使用PUT请求更新支付状态
      put(url).then(res => {
          if(res.data.code === 20000) {
              ElMessage.success(`使用${paymentMethod}支付成功`);
              // 支付成功后跳转到订单列表页面
              router.push('/orderList');
          } else {
              ElMessage.error(res.data.message || '支付失败，请重试');
          }
      }).catch(e => {
          console.error('支付请求失败:', e);
          ElMessage.error('支付失败，请重试');
      });
  }
const toback=()=>{
  router.push('orderList');
}
</script>
  
<style scoped>
/*************** 总容器 ***************/
.wrapper {
  width: 100%;
  height: 100%;
}

/*************** header ***************/
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

/*************** 订单信息部分 ***************/
.wrapper .order-info {
  /*注意这里，不设置高，靠内容撑开。因为地址有可能折行*/
  width: 100%;
  margin-top: 12vw;
  background-color: #fff;
  padding: 4vw 4vw 0 4vw;
  box-sizing: border-box;

}

.wrapper .order-info p {
  font-size: 3.8vw;
  color: #666;
}

.wrapper .order-info .order-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2vw;
  padding-bottom: 2vw;
  border-bottom: solid 1px #eee;
}

.wrapper .business-info {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.wrapper .business-img {
  width: 15vw;
  height: 15vw;
  border-radius: 2vw;
  object-fit: cover;
  margin-right: 3vw;
  border: 1px solid #eee;
}

.wrapper .business-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wrapper .business-details h4 {
  font-size: 4.5vw;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.wrapper .business-details p {
  font-size: 5vw;
  color: #FF6B35;
  margin: 0;
  font-weight: 700;
}

/*************** 商品详情部分 ***************/
.wrapper .goods-details-section {
  margin-top: 3vw;
  padding-top: 3vw;
  border-top: 1px solid #eee;
}

.wrapper .goods-title {
  font-size: 3.8vw;
  color: #666;
  margin: 0 0 2vw 0;
}

.wrapper .goods-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wrapper .goods-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2vw 0;
  border-bottom: 1px solid #f5f5f5;
}

.wrapper .goods-item:last-child {
  border-bottom: none;
}

.wrapper .goods-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.wrapper .goods-img {
  width: 12vw;
  height: 12vw;
  border-radius: 1.5vw;
  object-fit: cover;
  margin-right: 3vw;
  border: 1px solid #eee;
}

.wrapper .goods-info {
  flex: 1;
}

.wrapper .goods-name {
  font-size: 3.5vw;
  color: #333;
  margin: 0 0 1vw 0;
  font-weight: 500;
  line-height: 1.3;
}

.wrapper .goods-price {
  font-size: 3.2vw;
  color: #FF6B35;
  margin: 0;
  font-weight: 600;
}

.wrapper .goods-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.wrapper .goods-quantity {
  font-size: 3.2vw;
  color: #666;
  margin: 0 0 1vw 0;
}

.wrapper .goods-total {
  font-size: 3.8vw;
  color: #333;
  margin: 0;
  font-weight: 600;
}

/*************** 支付方式部分 ***************/
.wrapper .payment-type {
  width: 100%;
  background-color: #fff;
  padding: 0 4vw;
  box-sizing: border-box;
}

.wrapper .payment-type li {
  width: 100%;
  height: 20vw;
  border-bottom: solid 1px #eee;
  padding: 2vw 0;
  cursor: pointer;
  transition: all 0.3s ease;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wrapper .payment-type li:hover {
  background-color: #f8f9fa;
}

.wrapper .payment-type li.active {
  background-color: #e3f2fd;
  border-left: 4px solid #0097FF;
}

.wrapper .payment-type li .payment-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.wrapper .payment-type li img {
  width: 12vw;
  height: 8vw;
  object-fit: contain;
  margin-right: 3vw;
}

.wrapper .payment-type li .payment-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wrapper .payment-type li .payment-name {
  font-size: 4.2vw;
  color: #333;
  font-weight: 600;
  margin: 0;
  margin-bottom: 1vw;
}

.wrapper .payment-type li .payment-desc {
  font-size: 3vw;
  color: #999;
  margin: 0;
}

.wrapper .payment-type li .payment-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8vw;
}

.wrapper .payment-type li .fa-check-circle {
  font-size: 5vw;
  color: #38CA73;
}

.wrapper .payment-type li .fa-circle-o {
  font-size: 5vw;
  color: #ddd;
}

/*************** 支付按钮部分 ***************/
.wrapper .payment-button {
  width: 100%;
  padding: 4vw;
  box-sizing: border-box;
  margin-top: 4vw;
}

.wrapper .payment-button button {
  width: 100%;
  height: 12vw;
  border: none;
  outline: none;
  border-radius: 6vw;
  background: linear-gradient(135deg, #38CA73 0%, #2E7D32 100%);
  font-size: 4.2vw;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2vw 4vw rgba(56, 202, 115, 0.3);
}

.wrapper .payment-button button:hover {
  transform: translateY(-1vw);
  box-shadow: 0 3vw 6vw rgba(56, 202, 115, 0.4);
}

.wrapper .payment-button button:active {
  transform: translateY(0);
  box-shadow: 0 1vw 2vw rgba(56, 202, 115, 0.3);
}
</style>
