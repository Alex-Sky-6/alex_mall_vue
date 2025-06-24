<template>
  <div class="wrapper">
    <!-- 顶部标题栏 -->
    <header>
      <p>我的</p>
    </header>

    <!-- 用户信息区域 -->
    <div class="user-info-card">
      <img class="avatar" :src="account.accountImg" alt="用户头像" />
      <div class="user-text">
        <p class="username">{{ account.accountName }}</p>
        <p class="user-detail">{{ account.accountId }} {{ $fmtSex(account.accountSex) }}</p>
      </div>
    </div>

    <!-- 功能列表区域 -->
    <ul class="function-list">
      <li class="function-item" @click="goToMyComment">
        <i class="icon-comment"></i>
        <span>我的评论</span>
        <i class="icon-arrow"></i>
      </li>
      <li class="function-item" @click="goToShopFollow">
        <i class="icon-follow"></i>
        <span>店铺关注</span>
        <i class="icon-arrow"></i>
      </li>
      <li class="function-item" @click="goToAddressManage">
        <i class="icon-address"></i>
        <span>地址管理</span>
        <i class="icon-arrow"></i>
      </li>
      <li class="function-item" @click="toUpdatePwd()">
        <i class="icon-pwd"></i>
        <span>修改密码</span>
        <i class="icon-arrow"></i>
      </li>
      <li class="function-item" @click="toUpdateName()">
        <i class="icon-nickname"></i>
        <span>修改昵称</span>
        <i class="icon-arrow"></i>
      </li>
      <li class="function-item" @click="toUpdateSex()">
        <i class="icon-gender"></i>
        <span>修改性别</span>
        <i class="icon-arrow"></i>
      </li>
    </ul>

    <!-- 底部操作按钮 -->
    <div class="bottom-btns">
      <button class="btn logout" @click="handleLogout">注销账号</button>
      <button class="btn exit" @click="handleExit">退出登录</button>
    </div>

    <!-- 底部导航栏组件 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Footer from '@/components/Footer.vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { get, post } from '@/api/index.js'; 
import { getSessionStorage, removeSessionStorage } from '@/common'; 

const router = useRouter();
const route = useRoute();

// 取出登录用户数据
const account = getSessionStorage('account');

// 跳转方法，结合 vue-router 做实际页面跳转
const goToMyComment = () => {
  router.push('/myComment');
};
const goToShopFollow = () => {
  router.push('/myFavorite') 
};
const goToAddressManage = () => {
  router.push('/addresslist') 
};
const toUpdatePwd = () => {
  router.push('/updatepwd') ;
};
const toUpdateName = () => {
  router.push('/updatename');
};
const toUpdateSex = () => {
  router.push('/updatesex') 
};

// 处理注销账号
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定注销账号吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning', // 建议使用 warning 类型
    }
  ).then(async () => {
    const res = await post(`/account/logout/${account.accountId}`);
    if (res.data.code === 20000) {
      removeSessionStorage('account');
      router.push('/Login');
      ElMessage.success('账号注销成功');
    } else {
      ElMessage.error(res.data.message || '注销失败');
    }
  }).catch((action) => {
    if (action === 'cancel') {
      ElMessage.info('已取消注销');
    } else {
      ElMessage.error('注销异常，请重试');
    }
  });
};

// 处理退出登录
const handleExit = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning', // 建议使用 warning 类型
    }
  ).then(() => {
    // 1. 清除登录状态
    removeSessionStorage('account');
    
    // 2. 跳转到登录页（确保路径与路由配置一致）
    router.push('/Login'); // 推荐使用命名路由
    
    // 3. 提示用户（使用 ElMessage 而非 ElMessageBox）
    ElMessage.success('退出登录成功');
    
  }).catch((action) => {
    // 区分用户取消和操作失败
    if (action === 'cancel') {
      ElMessage.info('已取消退出');
    } else {
      ElMessage.error('退出登录失败，请重试');
      console.error('退出登录错误:', action);
    }
  });
};
</script>

<style scoped>
.wrapper {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 14vw; /* 给底部导航栏留空间，与 Footer 高度适配 */
  box-sizing: border-box;
}

/* 顶部标题栏 */
.wrapper header {
  width: 100%;
  height: 12vw;
  background: linear-gradient(to right, #fff1eb, #ace0f9);
  color: #596164;
  font-size: 5vw;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.wrapper header p {
  letter-spacing: 2vw;
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-top: 12vw; /* 避开顶部固定标题栏 */
  border-bottom: 1px solid #f5f5f5;
  /* 新增：用户信息卡片阴影 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 10px;
}
.user-text {
  display: flex;
  flex-direction: column;
}
.username {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.user-detail {
  font-size: 14px;
  color: #999;
}

/* 功能列表 */
.function-list {
  list-style: none;
  padding: 0;
  margin: 10px 15px;
}
.function-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  /* 新增：功能列表项阴影，hover 时加深阴影（可选交互） */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease; 
}
.function-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); 
}
.function-item i {
  font-size: 18px;
  margin-right: 8px;
  color: #999; 
}
.icon-arrow {
  margin-left: auto;
}

/* 底部操作按钮 */
.bottom-btns {
  display: flex;
  justify-content: space-around;
  padding: 10px 15px;
}
.btn {
  width: 45%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  /* 新增：按钮阴影 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease; 
}
.btn:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); 
}
.logout {
  background-color: #ccc;
  color: #333;
}
.exit {
  background-color: #ffb900;
  color: #fff;
}
</style>