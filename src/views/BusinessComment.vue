<template>
  <div class="wrapper">
    <header class="custom-header">
      <!-- 回退按钮 -->
      <div class="back-arrow" @click="toback()">
        <el-icon><ArrowLeftBold /></el-icon>
      </div>
      <p>商家评论</p>
    </header>

    <!-- 商家信息卡片 -->
    <div class="business-card">
      <div class="business-info">
        <img class="business-logo" :src="business.businessImg" alt="商家logo" />
        <div class="business-details">
          <h3>{{ business.businessName }}</h3>
          <p class="business-address">商家地址：{{ business.businessAddress || '沈阳市浑南区软件园E18栋' }}</p>
        </div>
      </div>
    </div>

    <!-- 评论筛选标签 -->
    <div class="comment-filter">
      <div 
        v-for="filter in filterOptions" 
        :key="filter.key"
        class="filter-item"
        :class="{ active: activeFilter === filter.key }"
        @click="setActiveFilter(filter.key)"
      >
        {{ filter.label }}
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-for="comment in filteredComments" :key="comment.id" class="comment-item">
        <!-- 用户信息区域 -->
        <div class="user-info">
          <img class="avatar" :src="account.accountImg" alt="用户头像" />
          <div class="user-details">
            <p class="username">{{ comment.username }}</p>
            <p class="comment-date">{{ comment.date }}</p>
          </div>
        </div>
        
        <!-- 商品信息 -->
        <div class="goods-info" v-if="comment.goods">
          <div class="goods-image" v-if="comment.goods.goodsImg">
            <img :src="comment.goods.goodsImg" alt="商品图片" />
          </div>
          <div class="goods-details">
            <h4 class="goods-name">{{ comment.goods.goodsName }}</h4>
            <p class="goods-price">￥{{ comment.goods.goodsPrice }}</p>
          </div>
        </div>
        
        <!-- 评分区域 -->
        <div class="rating">
          <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= comment.rating }">★</span>
          <span class="rating-text">{{ comment.rating }}</span>
        </div>
        
        <!-- 评论内容 -->
        <div class="comment-content">
          <p>{{ comment.content }}</p>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredComments.length === 0" class="empty-state">
        <p>暂无评论</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { get } from '@/api/index.js';
import { ElMessage } from 'element-plus';
import {getSessionStorage} from "@/common.js"

const router = useRouter();
const route = useRoute();
const businessId = route.query.businessId;
//用户登录信息
const account = getSessionStorage("account");

// 商家信息
const business = ref({
  businessName: '',
  businessImg: '',
  businessAddress: ''
});



// 筛选选项
const filterOptions = ref([
  { key: 'all', label: '全部' },
  { key: 'good', label: '好评' },
  { key: 'medium', label: '中评' },
  { key: 'bad', label: '差评' }
]);

// 当前激活的筛选项
const activeFilter = ref('all');

// 评论列表数据
const commentList = ref([]);

// 显示的评论列表（直接使用commentList，因为筛选在后端完成）
const filteredComments = computed(() => {
  return commentList.value;
});

// 设置激活的筛选项
const setActiveFilter = async (filterKey) => {
  activeFilter.value = filterKey;
  await loadCommentsByFilter(filterKey);
};

// 根据筛选条件加载评论
const loadCommentsByFilter = async (filterKey) => {
  try {
    const res = await get(`/comment/business/${businessId}/filter?ratingFilter=${filterKey}`);
    console.log('筛选API返回数据:', res.data);
    if (res.data.code === 20000) {
      // 检查resultdata是否存在且为数组
      if (res.data.resultdata && Array.isArray(res.data.resultdata)) {
        // 将后端返回的数据格式转换为前端需要的格式
        commentList.value = res.data.resultdata.map(comment => ({
          id: comment.coId || comment.id,
          userAvatar: '/src/assets/businessImg/1.jpg', // 默认头像
          username: comment.accountId || '匿名用户',
          date: comment.created ? new Date(comment.created).toLocaleDateString() : '',
          rating: comment.rate || 5,
          content: comment.coText || '',
          images: comment.coImg ? [comment.coImg] : [],
          goods: comment.goods || null
        }));
        console.log('加载的评论数据:', commentList.value);
      } else {
        // 如果resultdata不是数组，设置为空数组
        commentList.value = [];
        console.log('后端返回的resultdata不是数组:', res.data.resultdata);
        ElMessage.warning('暂无评论数据');
      }
    } else {
      commentList.value = [];
      ElMessage.warning(res.data.message || '暂无评论数据');
    }
  } catch (error) {
    console.error('加载筛选评论失败:', error);
    commentList.value = [];
    ElMessage.error('加载筛选评论失败');
  }
};

// 回退方法
const toback = () => {
  router.back();
};

// 加载商家信息
const loadBusinessInfo = async () => {
  try {
    const res = await get(`/business/info/${businessId}`);
    if (res.data.code === 20000) {
      business.value = res.data.resultdata;
    }
  } catch (error) {
    console.error('加载商家信息失败:', error);
  }
};

// 加载评论数据
const loadComments = async () => {
  try {
    const res = await get(`/comment/business/${businessId}`);
    console.log('评论API返回数据:', res.data);
    if (res.data.code === 20000) {
      // 检查resultdata是否存在且为数组
      if (res.data.resultdata && Array.isArray(res.data.resultdata)) {
        // 将后端返回的数据格式转换为前端需要的格式
        commentList.value = res.data.resultdata.map(comment => ({
          id: comment.coId || comment.id,
          userAvatar: '/src/assets/businessImg/1.jpg', // 默认头像
          username: comment.accountId || '匿名用户',
          date: comment.created ? new Date(comment.created).toLocaleDateString() : '',
          rating: comment.rate || 5,
          content: comment.coText || '',
          images: comment.coImg ? [comment.coImg] : [],
          goods: comment.goods || null
        }));
        console.log('加载的评论数据:', commentList.value);
      } else {
        // 如果resultdata不是数组，设置为空数组
        commentList.value = [];
        console.log('后端返回的resultdata不是数组:', res.data.resultdata);
        ElMessage.warning('暂无评论数据');
      }
    } else {
      commentList.value = [];
      ElMessage.warning(res.data.message || '暂无评论数据');
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    commentList.value = [];
    ElMessage.error('加载评论失败');
  }
};

onMounted(() => {
  if (businessId) {
    loadBusinessInfo();
    loadComments();
  }
});
</script>

<style scoped>
.wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
  box-sizing: border-box;
}

/* 顶部标题栏 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.custom-header p {
  margin: 0;
  letter-spacing: 2vw;
}

.back-arrow {
  position: absolute;
  left: 4vw;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 6vw;
  color: #596164;
}

/* 商家信息卡片 */
.business-card {
  background: white;
  margin: 12vw 10px 10px 10px;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.business-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.business-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
}

.business-details h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.business-address {
  font-size: 12px;
  color: #666;
  margin: 0;
}



/* 评论筛选标签 */
.comment-filter {
  display: flex;
  background: white;
  margin: 0 10px 10px 10px;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.filter-item.active {
  color: #ffb900;
  border-bottom-color: #ffb900;
  font-weight: bold;
}

/* 评论列表 */
.comment-list {
  margin: 0 10px;
}

.comment-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: #333;
}

.comment-date {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 评分 */
.rating {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.star {
  color: #ddd;
  font-size: 16px;
  margin-right: 2px;
}

.star.active {
  color: #ffb900;
}

.rating-text {
  margin-left: 8px;
  font-size: 14px;
  color: #ffb900;
  font-weight: bold;
}

/* 评论内容 */
.comment-content {
  margin-bottom: 10px;
}

.comment-content p {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin: 0;
}

/* 商品信息 */
.goods-info {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  border-left: 3px solid #007bff;
}

.goods-image {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  flex-shrink: 0;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.goods-details {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #333;
}

.goods-price {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
  margin: 0;
}



/* 空状态 */
.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #999;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}
</style>