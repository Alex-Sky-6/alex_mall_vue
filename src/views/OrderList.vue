<template>
    <div class="wrapper">
  
        <!-- header部分 -->
        <header>
            <p>我的订单</p>
        </header>
  
        <!-- 订单列表部分 -->
        <div class="order-tabs">
            <div :class="['tab-item', { active: activeTab === 0 }]" @click="changeTab(0)">全部订单</div>
            <div :class="['tab-item', { active: activeTab === 1 }]" @click="changeTab(1)">已支付</div>
            <div :class="['tab-item', { active: activeTab === 2 }]" @click="changeTab(2)">待支付</div>
        </div>

        <div class="search-bar">
            <input type="text" v-model="searchKeyword" placeholder="请输入您想搜索的商家名">
            <i class="fa fa-search"></i>
        </div>
  
        <ul class="order-list">
            <li v-if="filteredOrders.length === 0" style="text-align: center; color: #999; padding: 20px;">
                暂无订单数据
            </li>
            <li v-for="order in filteredOrders" :key="order.orderId">
                <div class="order-header">
                    <p class="business-name">
                        <img src="@/assets/cart.png" alt="cart" class="cart-icon" />
                        {{ order.business ? order.business.businessName : '未知商家' }}
                    </p>
                    <p :class="['status', order.statu == 1 ? 'paid' : 'unpaid']">
                        {{ order.statu == 1 ? '已支付' : '未支付' }}
                    </p>
                </div>
                <div class="order-content">
                    <div class="info">
                        <p>交易金额：{{ order.orderTotal ? order.orderTotal.toFixed(2) : '0.00' }} 元</p>
                        <p class="date">交易日期：{{ order.created || '未知日期' }}</p>
                    </div>
                    <div class="action">
                        <button v-if="order.statu == 0" @click="toPayment(order.orderId)" class="btn-pay">前往支付 &gt;</button>
                        <button v-if="order.statu == 1" class="btn-comment">去评价 &gt;</button>
                    </div>
                </div>
            </li>
        </ul>
  
        <!-- 底部菜单部分 -->
        <Footer></Footer>
    </div>
</template>
  
<script setup>
    import Footer from '../components/Footer.vue';
    import { ref, onMounted, computed } from 'vue';
    import { useRouter,useRoute } from "vue-router";
    import {getSessionStorage,getLocalStorage} from "@/common.js";
    import { get,post } from "@/api";
    import { ElMessage } from 'element-plus';

    const route = useRoute();
    const router = useRouter();
    const account = getSessionStorage('account');

    const activeTab = ref(0); // 0: 全部, 1: 已支付, 2: 待支付
    const searchKeyword = ref('');
    const orderList = ref([]);

    const filteredOrders = computed(() => {
        let list = orderList.value;
        
        // 筛选状态
        if (activeTab.value === 1) { // 已支付
            list = list.filter(order => order && order.statu === 1);
        } else if (activeTab.value === 2) { // 待支付
            list = list.filter(order => order && order.statu === 0);
        }
        
        // 筛选关键字
        if (searchKeyword.value.trim() !== '') {
            list = list.filter(order => 
                order && 
                order.business && 
                order.business.businessName && 
                order.business.businessName.includes(searchKeyword.value.trim())
            );
        }
        
        return list;
    });

    onMounted(() => {
        if (!account) {
            router.push('/login');
            return;
        }
        // 从服务器加载订单列表
        let url = `/orders/listOrdersByAccountId/${account.accountId}`;
        
        console.log('orderId:', account.accountId);
        console.log('请求订单详情接口:', url);
        
        get(url).then(res => {
            console.log('接口返回:', res.data);
            if (res.data.code === 20000) {
                // console.log('订单数据:', res.data.resultdata);
                // 检查每个订单的数据结构
                if (res.data.resultdata && res.data.resultdata.length > 0) {
                    // console.log('第一个订单的完整结构:', res.data.resultdata[0]);
                }
                orderList.value = res.data.resultdata;
                
                // 为每个订单加载商家信息
                loadBusinessInfoForOrders(res.data.resultdata);
            }
        }).catch(e => console.error(e));
        
    });

    // 为订单加载商家信息
    const loadBusinessInfoForOrders = (orders) => {
        if (!orders || orders.length === 0) return;
        
        // console.log('开始为订单加载商家信息，订单数量:', orders.length);
        
        orders.forEach((order, index) => {
            // console.log(`订单 ${index + 1}:`, {
            //     orderId: order.orderId,
            //     businessId: order.businessId,
            //     hasBusiness: !!order.business,
            //     businessData: order.business
            // });
            
            if (order.businessId && !order.business) {
                // console.log(`正在为订单 ${order.orderId} 加载商家信息，商家ID: ${order.businessId}`);
                get(`/business/info/${order.businessId}`).then(res => {
                    if (res.data.code === 20000) {
                        // console.log(`订单 ${order.orderId} 的商家信息:`, res.data.resultdata);
                        // 使用Vue的响应式更新
                        const orderIndex = orderList.value.findIndex(o => o.orderId === order.orderId);
                        if (orderIndex !== -1) {
                            orderList.value[orderIndex].business = res.data.resultdata;
                        }
                    } else {
                        // console.error(`加载订单 ${order.orderId} 的商家信息失败:`, res.data);
                    }
                }).catch(e => console.error(`加载订单 ${order.orderId} 的商家信息失败:`, e));
            }
        });
    };

    const changeTab = (index) => {
        activeTab.value = index;
    };

    const toPayment = (orderId) => {
        router.push({ path: '/payment', query: { orderId: orderId } });
        console.log('orderId:', orderId);
        console.log('请求订单详情接口:', url);
        get(url).then(res => {
            console.log('接口返回:', res.data);
            if (res.data.code === 20000) {
                order.value = res.data.resultdata;
                if (res.data.resultdata.orders) {
                    orderDetailList.value = res.data.resultdata.orders;
                    console.log('订单明细:', orderDetailList.value);
                }
            }
        }).catch(e => console.error(e));
    };

</script>
  
<style scoped>
.wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 14vw;
    box-sizing: border-box;
    background: linear-gradient(90deg, #f8f8f8 0%, #e3f0fa 100%);
    font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

header {
    width: 100%;
    height: 12vw;
    background: linear-gradient(90deg, #fff1eb, #ace0f9);
    color: #333;
    font-size: 4.8vw;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    letter-spacing: 0.5em;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
}

.order-tabs {
    margin-top: 12vw;
    width: 100%;
    height: 10vw;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.tab-item {
    font-size: 3.5vw;
    color: #888;
    padding: 2vw 0;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: color 0.2s, border-bottom 0.2s;
}

.tab-item.active {
    color: #3ec6a6;
    border-bottom: 3px solid #3ec6a6;
    font-weight: 600;
    background: #e3f0fa;
}

.search-bar {
    width: 100%;
    padding: 2vw 4vw;
    box-sizing: border-box;
    background-color: #fff;
    display: flex;
    align-items: center;
    border-radius: 12px;
    margin-top: 2vw;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.search-bar input {
    flex: 1;
    height: 8vw;
    border: 1px solid #cce6f6;
    border-radius: 4vw;
    padding: 0 4vw;
    font-size: 3.5vw;
    background: #f7fbfd;
    outline: none;
    transition: border 0.2s;
}

.search-bar input:focus {
    border: 1.5px solid #3ec6a6;
}

.search-bar i {
    font-size: 4.5vw;
    color: #3ec6a6;
    margin-left: -10vw;
    padding: 0 3vw;
}

.order-list {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    padding: 2vw 4vw;
    box-sizing: border-box;
}

.order-list li {
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 16px;
    padding: 2vw 4vw;
    margin-bottom: 3vw;
    box-shadow: 0 2px 8px rgba(62,198,166,0.06);
    transition: box-shadow 0.2s;
}
.order-list li:hover {
    box-shadow: 0 4px 16px rgba(62,198,166,0.12);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f2f2f2;
    padding-bottom: 2vw;
}

.business-name {
    font-size: 4vw;
    color: #333;
    font-weight: 600;
    display: flex;
    align-items: center;
}

.cart-icon {
    width: 5vw;
    height: 5vw;
    margin-right: 2vw;
    vertical-align: middle;
}

.status {
    font-size: 3.2vw;
    padding: 0.5vw 2vw;
    border-radius: 2vw;
    color: #fff;
    font-weight: 500;
    letter-spacing: 0.1em;
}
.status.paid {
    background: linear-gradient(90deg, #3ec6a6 0%, #6ee7b7 100%);
    color: #fff;
}
.status.unpaid {
    background: linear-gradient(90deg, #ffb347 0%, #ffcc80 100%);
    color: #fff;
}

.order-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2vw;
}

.info {
    font-size: 3.2vw;
    color: #666;
}
.info .date {
    margin-top: 1vw;
    color: #b0b0b0;
}

.action button {
    border: none;
    border-radius: 3vw;
    padding: 1.5vw 4vw;
    font-size: 3.5vw;
    color: #fff;
    cursor: pointer;
    margin-bottom: 1vw;
    transition: background 0.2s, color 0.2s;
    box-shadow: 0 2px 8px rgba(62,198,166,0.08);
}

.btn-pay {
    background: linear-gradient(90deg, #3ec6a6 0%, #6ee7b7 100%);
}

.btn-pay:hover {
    background: linear-gradient(90deg, #2fa88b 0%, #4fd1b2 100%);
}

.btn-comment {
    background: linear-gradient(90deg, #ffe0c3 0%, #ffb347 100%);
    color: #555;
}

.btn-comment:hover {
    background: linear-gradient(90deg, #ffd6a0 0%, #ffb347 100%);
    color: #333;
}

</style>
