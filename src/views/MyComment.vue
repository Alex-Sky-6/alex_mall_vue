<template>
  <div class="wrapper">
    <header class="custom-header">
      <!-- 回退按钮 -->
      <div class="back-arrow" @click="toback()">
        <el-icon><ArrowLeftBold /></el-icon>
      </div>
      <p>我的评论</p>
    </header>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-for="comment in commentList" :key="comment.id" class="comment-item">
        <!-- 用户信息区域 -->
        <div class="user-info">
          <img class="avatar" :src="account.accountImg" alt="用户头像" />
          <div class="user-details">
            <p class="username">{{ comment.username }}</p>
            <p class="comment-date">{{ comment.date }}</p>
          </div>
        </div>
        
        <!-- 商店和商品信息 -->
        <div class="business-info">
          <div class="business-name">
            <span class="label">商店：</span>
            <span class="value">{{ comment.businessName }}</span>
          </div>
          <div class="goods-info" v-if="comment.goods">
            <span class="label">商品：</span>
            <span class="value">{{ comment.goods.goodsName }}</span>
            <span class="price">￥{{ comment.goods.goodsPrice }}</span>
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
        
        <!-- 评论图片 -->
        <div class="comment-images" v-if="comment.images && comment.images.length > 0">
          <img v-for="(image, index) in comment.images" :key="index" :src="image" alt="评论图片" class="comment-image" />
        </div>
        
        <!-- 删除按钮 -->
        <div class="comment-actions">
          <el-icon class="delete-icon" @click="deleteComment(comment.id)"><Delete /></el-icon>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="commentList.length === 0" class="empty-state">
        <p>暂无评论</p>
      </div>
    </div>
    
    <!-- 底部导航栏 -->
    <Footer />
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { get, post, del } from '@/api/index.js';
import { getSessionStorage } from '@/common';

const router = useRouter();
const account = getSessionStorage('account');

// 评论列表数据
const commentList = ref([]);

// 回退方法
const toback = () => {
  router.back();
};

// 删除评论
const deleteComment = async (commentId) => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      console.log('开始删除评论，评论ID:', commentId);
      const res = await del(`/comment/delete/${commentId}`);
      console.log('删除评论响应:', res);
      
      if (res.data.code === 20000) {
        commentList.value = commentList.value.filter(comment => comment.id !== commentId);
        ElMessage.success('评论删除成功');
      } else {
        console.error('删除评论失败，错误码:', res.data.code, '错误信息:', res.data.message);
        ElMessage.error('删除失败: ' + (res.data.message || '未知错误'));
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 加载评论数据
const loadComments = async () => {
  try {
    console.log('开始加载用户评论，用户ID:', account.accountId);
    const res = await get(`/comment/user/${account.accountId}`);
    console.log('获取用户评论响应:', res);
    
    if (res.data.code === 20000) {
      // 检查返回的数据是否为数组
      if (Array.isArray(res.data.resultdata)) {
        commentList.value = res.data.resultdata.map(comment => {
          console.log('处理单个评论数据:', comment);
          return {
            id: comment.coId || comment.id,
            username: account.accountName,
            date: comment.created,
            rating: comment.rate || 0,
            content: comment.coText || '',
            images: comment.coImg ? [comment.coImg] : [],
            businessName: comment.businessName || '未知商店',
            goods: comment.goods || null
          };
        });
        console.log('评论数据加载成功:', commentList.value);
      } else {
        console.warn('返回的评论数据不是数组:', res.data.resultdata);
        commentList.value = [];
      }
    } else {
      console.error('获取评论失败，错误码:', res.data.code, '错误信息:', res.data.message);
      ElMessage.error('获取评论失败: ' + (res.data.message || '未知错误'));
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    ElMessage.error('加载评论失败，请稍后重试');
  }
};

onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 14vw;
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

/* 评论列表 */
.comment-list {
  margin-top: 12vw;
  padding: 10px;
}

.comment-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* 商店和商品信息 */
.business-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  border-left: 3px solid #007bff;
}

.business-name, .goods-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.goods-info:last-child {
  margin-bottom: 0;
}

.business-info .label {
  font-size: 12px;
  color: #666;
  font-weight: bold;
  min-width: 40px;
}

.business-info .value {
  font-size: 13px;
  color: #333;
  margin-right: 10px;
}

.business-info .price {
  font-size: 13px;
  color: #ff6b6b;
  font-weight: bold;
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

/* 评论图片 */
.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.comment-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

/* 操作按钮 */
.comment-actions {
  position: absolute;
  top: 15px;
  right: 15px;
}

.delete-icon {
  font-size: 18px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.delete-icon:hover {
  color: #ff4757;
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