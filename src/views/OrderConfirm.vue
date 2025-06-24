<template>
  <div class="wrapper">
    <!-- header部分 -->
    <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>确认订单</p>
  </header>

    <!-- 配送地址部分 -->
    <div class="order-info">
      <h5>订单配送至：</h5>
      <div class="order-info-address" @click="toAddress()">
        <p>{{ deliveryAddress!=null?deliveryAddress.address:'请选择配送地址' }}</p>
         <!-- <p>上海市静安区静安寺街道常德路195号</p> -->
        <i class="el-icon-arrow-right"></i>
      </div>
      <p v-if="deliveryAddress!=null">  
          {{deliveryAddress.contactName }}
          {{$fmtSex(deliveryAddress.contactSex)}} 
          <em>{{deliveryAddress.contactTel}}</em>
      </p> 
    </div>


    <h3>{{business.businessName}}</h3>
    <!-- 订单明细部分 -->
    <ul class="order-detailed">
      <li v-for="(item,index) in cartList" :key="item.cartId">
        <div class="order-detailed-left">
          <img :src="item.goods.goodsImg">
          <p>{{item.goods.goodsName}}  {{ item.goods.goodsPrice }}  元 x {{item.quantity}}</p>
        </div>
        <p>&#165; {{$fmtPrice(item.goods.goodsPrice * item.quantity)}}</p>
      </li>

    </ul>
    <div class="order-deliveryfee">
      <p>配送费</p>
      <p>&#165; {{business.deliveryPrice}}</p>
    </div>

    <!-- 合计部分 -->
    <div class="total">
      <div class="total-left">总价：
        &#165; {{$fmtPrice(totalPrice)}}
      </div>
      <div class="total-right" @click="toPayment()">
        去支付
      </div>
    </div>
  </div>
</template>

<script setup>
  import {ref,reactive,computed} from "vue"
  import { useRouter, useRoute } from "vue-router"
  import { get ,post} from "@/api";
  import { ElMessage } from 'element-plus'
  import { getLocalStorage, getSessionStorage,setLocalStorage} from "@/common";


  //创建路由对象
  const router = useRouter();
  const route = useRoute();
  //获得商家编号businessId，查询商家
  const businessId = route.query.businessId;
  //取出登录用户数据
  const account = getSessionStorage('account');

  const deliveryAddress = getLocalStorage(account.accountId);

  const business = ref({});
  const cartList = ref([]);

  const totalPrice = computed(() => {
    let total = 0;
    cartList.value.forEach(cart => {
        total += cart.goods.goodsPrice * cart.quantity;
    });
    //商品总价+配送费
    total += business.value.deliveryPrice;
    return total;
  });
  //跳转至 配送信息页面
  const toAddress = () => {
    //确认订单--->配送列表需要传递businessId参数，因为设置完配送信息
    //会返回确定订单页面，而确认订单页面需要businessId参数
    router.push({ path: '/address', query: { businessId: businessId } });
  };
  //加载购物车的数据
  const loadCart = () => {
      let url = `/cart/listCart/${account.accountId}/${businessId}`;
      get(url).then(res => {
          if (res.data.code === 20000) {
              cartList.value = res.data.resultdata;
          } else {
              ElMessage({
                  message: '订单的商品数据加载失败',
                  type: 'error',
              })
          }
      });
  }
  //加载商家对象信息
  const loadBusiness = () => {
      let url = `/business/info/${businessId}`;
      get(url).then(res => {
          if (res.data.code === 20000) {
              business.value = res.data.resultdata;
              //查询商家下面 当前用户购买的商品信息
              loadCart();
          } else {
              ElMessage({
                  message: '订单商家数据加载失败',
                  type: 'error',
              })
          }
      });
  }

  //跳转至支付页面
  const toPayment = () => {
      if (deliveryAddress === null) {
          ElMessage({
              message: '请选择配送地址信息',
              type: 'error',
          });
          return;
      }
      //生成订单
      let url = "/orders/save";
      let orders = {
          accountId: account.accountId,
          businessId: businessId,
          daId: deliveryAddress.daId,
          orderTotal: totalPrice.value
      };
      post(url, orders, true).then(res => {
          let orderId = res.data.resultdata;
          router.push({ path: '/payment', query: { businessId: businessId, orderId: orderId } });
      });
  };
  const init =()=>{
    loadBusiness();
  }
  init();
  const toback=()=>{
    //router.push({path:'/businessInfo',query:{businessId: businessId}});
    router.back();
  }
</script>

<style scoped>
  /****************** 总容器 ******************/
  .wrapper {
    width: 100%;
    height: 100%;
    padding: 2vw;
    box-sizing: border-box;

    padding-bottom:16vw;
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

  /****************** 订单信息部分 ******************/
  .wrapper .order-info {
    /*注意这里，不设置高，靠内容撑开。因为地址有可能折行*/
    width: 95%;
    margin:16vw auto 10vw auto;
    
    background:linear-gradient(to right bottom,#d8edfd,#f6faff);
    box-sizing: border-box;
    color: #436283;
    border-radius:2vw;
    padding: 4vw;
    margin-bottom: 5vw;
    padding: 4vw;
    box-sizing: border-box;
    box-shadow: 0.5vw 0.5vw 3vw rgba(0, 0, 0, 0.1);
  }

  .wrapper .order-info h5 {
    font-size: 3.6vw;
    font-weight: 600;
    color:#001747;
    margin-bottom:4vw;
  }

  .wrapper .order-info .order-info-address {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-weight: 500;
    user-select: none;
    cursor: pointer;
    margin: 1vw 0;
    
  }

  .wrapper .order-info .order-info-address p {
    width: 90%;
    font-size: 4vw;
    text-align: left;
  }

  .wrapper .order-info .order-info-address i {
    font-size: 5vw;
  }

  .wrapper .order-info p {
    font-size: 3.5vw;
    margin-top: 2vw;
    text-align: right;
  }

  .wrapper h3 {
    box-sizing: border-box;
    padding: 3vw;
    font-size: 4vw;
    color: #66717d;
    border-bottom: solid 1px #ddd;
  }

  /****************** 订单明细部分 ******************/
  .wrapper .order-detailed {
    width: 100%;
  }

  .wrapper .order-detailed li {
    width: 100%;
    height: 16vw;
    box-sizing: border-box;
    padding: 10vw 3vw;
    color: #666;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wrapper .order-detailed li .order-detailed-left {
    display: flex;
    align-items: center;
  }

  .wrapper .order-detailed li .order-detailed-left img {
    width: 16vw;
    height: 16vw;
    border-radius: 2vw;
  }

  .wrapper .order-detailed li .order-detailed-left p {
    font-size: 3.5vw;
    margin-left: 3vw;
    color: #393939;
  }

  .wrapper .order-detailed li p {
    font-size: 3.5vw;
    color: #df5643;
    font-weight: 700;
  }

  .wrapper .order-deliveryfee {
    width: 100%;
    box-sizing: border-box;
    padding: 2vw 3vw;
    color: #466457;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 3.8vw;
    background-color:#e5e7da;
    border-radius: 0.5vw;
    margin-top: 4vw;
  }

  /****************** 订单合计部分 ******************/
  .wrapper .total {
    width: 100%;
    height: 14vw;

    position: fixed;
    left: 0;
    bottom: 0;

    display: flex;
  }

  .wrapper .total .total-left {
    flex: 2;
    background-color: #66717d;
    color: #fff;
    font-size: 4.5vw;
    font-weight: 700;
    user-select: none;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .wrapper .total .total-right {
    flex: 1;
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
