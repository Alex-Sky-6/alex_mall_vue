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
          <img class="avatar" :src="comment.userAvatar" alt="用户头像" />
          <div class="user-details">
            <p class="username">{{ comment.username }}</p>
            <p class="comment-date">{{ comment.date }}</p>
          </div>
        </div>
        
        <!-- 评分区域 -->
        <div class="rating">
          <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= comment.rating }">★</span>
          <span class="rating-text">{{ comment.rating }}.0</span>
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
import { get, post } from '@/api/index.js';
import { getSessionStorage } from '@/common';

const router = useRouter();
const account = getSessionStorage('account');

// 评论列表数据
const commentList = ref([
  {
    id: 1,
    userAvatar: '/src/assets/businessImg/1.jpg',
    username: '小谷姐姐（软件园...',
    date: '2024-06-21',
    rating: 4,
    content: '非常好吃，性价比超高！！！肉馅也很满，很棒，这家也很快，店家服务态度超好，下次继续！！！',
    images: ['/src/assets/businessImg/1.jpg']
  }
]);

// 回退方法
const toback = () => {
  router.back();
};

// 删除评论
const deleteComment = (commentId) => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 这里应该调用删除评论的API
    // const res = await post(`/comment/delete/${commentId}`);
    // if (res.data.code === 20000) {
      commentList.value = commentList.value.filter(comment => comment.id !== commentId);
      ElMessage.success('评论删除成功');
    // } else {
    //   ElMessage.error('删除失败');
    // }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 加载评论数据
const loadComments = async () => {
  try {
    // 这里应该调用获取用户评论的API
    // const res = await get(`/comment/user/${account.accountId}`);
    // if (res.data.code === 20000) {
    //   commentList.value = res.data.resultdata;
    // }
  } catch (error) {
    console.error('加载评论失败:', error);
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