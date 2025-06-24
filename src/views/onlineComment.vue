<template>
    <div class="wrapper">
      <!-- 顶部标题栏 -->
      <header class="custom-header">
        <div class="back-arrow" @click="toback()">
          <el-icon><ArrowLeftBold /></el-icon>
        </div>
        <p>在线评论</p>
      </header>
  
      <!-- 内容区域 -->
      <div class="content">
        <p class="question">这次的购物让您满意吗？</p>
  
        <!-- 店铺信息 - 成功状态 -->
        <div class="shop-info" v-if="merchantInfo && !loading && !error">
          <div class="shop-logo-wrap">
            <img 
              class="shop-logo" 
              :src="merchantInfo.businessImg" 
              alt="店铺logo" 
            /> 
            <span class="new-tag" v-if="merchantInfo.remarks">
              {{ merchantInfo.remarks }}
            </span>
          </div>
          <p class="shop-name">{{ merchantInfo.businessName }}</p>
          <p class="shop-type">
            {{ merchantInfo.businessExplain || '商家类型加载中' }}
          </p>
        </div>
  
        <!-- 加载状态 -->
        <div v-else-if="loading" class="loading">
          <p>加载商家信息中...</p>
        </div>
  
        <!-- 错误状态 -->
        <div v-else class="error">
          <p>获取商家信息失败，请重试</p>
          <button @click="fetchMerchantInfo">重试</button>
        </div>
  
        <!-- 星级评分 -->
        <div class="star-rating-container">
          <!-- <div 
            class="star-rating" 
            @mousemove="handleStarHover" 
            @mouseleave="resetStarHover" 
            @click="handleStarClick"
          >
            <span 
              v-for="index in 5" 
              :key="index" 
              class="star-item"
            >
              <i 
                class="iconfont icon-star" 
                :class="{ active: index <= currentFullStars }"
              ></i>
              <i 
                class="iconfont icon-star-half" 
                :class="{ active: index === halfStarPos }"
              ></i>
            </span> -->
            <div>
            <el-rate v-model="value" allow-half />
          </div>
          <p class="rating-text">
            {{ value }} 星
          </p>
        </div>
  
        <!-- 评论输入框 -->
        <textarea 
          class="comment-input" 
          placeholder="说点什么吧...." 
          v-model="commentContent"
        ></textarea>
  
        <!-- 提交按钮 -->
        <button class="submit-btn" @click="submitReview">提交评论</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ElMessage } from 'element-plus'
  import { ArrowLeftBold } from '@element-plus/icons-vue'; 
  import {get,post} from '@/api'
  import { getSessionStorage } from '@/common';
  
  const router = useRouter();
  const route = useRoute();
  const orderId = route.query.orderId; 
  const value = ref()
  const commentContent = ref('');
  const merchantInfo = ref({});
  const loading = ref(true);
  const error = ref(false);
  const account = getSessionStorage('account');
  
  onMounted(() => {
    if (!orderId) {
      error.value = true;
      loading.value = false;
      console.error('错误：未获取到订单ID');
      return;
    }
    fetchMerchantInfo();
  });
  
  // 核心修复：统一接口路径
  const fetchMerchantInfo = () => {
    loading.value = true;
    error.value = false;
    get(`/orders/businessInfo/${orderId}`) 
      .then(response => {
        if (response.data.code === 20000) {
          const firstOrder = response.data.resultdata;
          if (firstOrder) {
            console.log('firstOrder 的内容：', firstOrder); 
            console.log('business:',firstOrder.business);
            // // merchantInfo 直接存 business 对象
            merchantInfo.value = firstOrder[0].business;

          } else {
            throw new Error('订单中未包含商家信息');
          }
        } else {
          throw new Error(response.data.message || '获取商家信息失败');
        }
      })
      .catch(err => {
        console.error('网络异常:', err);
        error.value = true;
      })
      .finally(() => {
        loading.value = false;
      });
  };
  
  const submitReview = () => {
    if (!commentContent.value.trim()) {
        ElMessage({
            message: '评价不能为空',
            type: 'error',
        });
      return;
    }
  
    const reviewData = {
    accountId:account.accountId,
    businessId: merchantInfo.value?.businessId || 0,
    orderId:orderId,
    rate: value.value, // 注意这里原代码用的是 value，和定义的 ref 对应上
    coText: commentContent.value,
  };

  console.log('提交评论数据：', reviewData);
  post('/comment/save', reviewData, {
  headers: {
    'Content-Type': 'application/json' 
  }
})
   .then(response => {
      if (response.data.code === 20000) {
        ElMessage({
          message: '提交成功',
          type:'success',
        });
        commentContent.value = '';
        router.push({ name: 'orderList' });
      } else {
        ElMessage({
          message: response.data.message || '提交评论失败，请重试',
          type: 'error',
        });
      }
    })
   .catch(err => {
      console.error('提交评论出错：', err);
      ElMessage({
        message: '网络异常，提交评论失败',
        type: 'error',
      });
    });
};
  
  const toback = () => {
    router.back();
  };
  </script>
  
  <style scoped>
  /* 顶部标题栏 */
  .custom-header {
    width: 100%;
    height: 12vw;
    background: linear-gradient(to right, #f0f0f0, #c9e6f7);
    color: #333;
    font-size: 5vw;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .back-arrow {
    position: absolute;
    left: 3vw;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #333;
    font-size: 4vw;
  }
  
  /* 内容区域 */
  .wrapper {
    min-height: 100vh;
    background-color: #fff;
    padding-top: 12vw;
    padding-bottom: 10vw;
    box-sizing: border-box;
  }
  
  .content {
    padding: 15px;
    text-align: center;
  }
  
  .question {
    font-size: 14px;
    color: #333;
    margin-bottom: 15px;
  }
  
  /* 店铺信息 */
  .shop-info {
    margin-bottom: 20px;
  }
  
  .shop-logo-wrap {
    position: relative;
    display: inline-block;
    margin-bottom: 10px;
  }
  
  .shop-logo {
    width: 80px; 
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #eee;
  }
  
  .new-tag {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #ff4d4f;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px 0 4px 0;
  }
  
  .shop-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  
  .shop-type {
    font-size: 14px;
    color: #666;
  }
  
  /* 星级评分 */
  .star-rating-container {
    margin-bottom: 20px;
  }
  
  .star-rating {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
  
  .star-item {
    position: relative;
    width: 24px;
    height: 24px;
    margin: 0 2px;
  }
  
  .iconfont {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: 24px;
    line-height: 24px;
    color: #000000; /* 空心星星默认黑色 */
    transition: color 0.2s;
  }
  
  /* 激活状态（填充黄色） */
  .icon-star.active,
  .icon-star-half.active {
    color: #d17306; 
  }
  
  .icon-star-half {
    z-index: 2;
    width: 50%;
    overflow: hidden;
  }
  
  .rating-text {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
  }
  
  /* 评论输入框 */
  .comment-input {
    width: 100%;
    height: 100px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: none;
    box-sizing: border-box;
    margin-bottom: 20px;
  }
  
  .comment-input:focus {
    outline: none;
    border-color: #fdbf00;
    box-shadow: 0 0 0 2px rgba(253, 191, 0, 0.2);
  }
  
  /* 提交按钮 */
  .submit-btn {
    width: 100%;
    height: 40px;
    background-color: #fdbf00;
    color: #fff;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .submit-btn:hover {
    background-color: #e6a200;
  }
  
  /* 加载状态样式 */
  .loading {
    padding: 20px;
    color: #666;
  }
  
  /* 错误状态样式 */
  .error {
    padding: 20px;
    color: #ff4d4f;
  }
  
  .error button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #fdbf00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>