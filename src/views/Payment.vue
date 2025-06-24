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
            <h4>{{order.business.businessName}}</h4>
            <p>&#165; {{order.orderTotal}}</p>
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
      business:{
          businessName:'商家名称'
      },
      orderTotal:10000
  });
  const paymentType = ref(1);

  onMounted(() => {
      // 此处应根据orderId从服务器获取订单信息
      // let url = `/orders/getOrdersById/${orderId}`;
      // get(url).then(res=>{
      //     if(res.data.code==20000){
      //         order.value = res.data.resultdata;
      //     }
      // }).catch(e=>{
      //     console.error(e);
      // });
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

.wrapper .order-info .order-info-row h4{
    font-size: 4.2vw;
    color: #555;
}
.wrapper .order-info .order-info-row p{
    font-size: 4.2vw;
    color: orangered;
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
