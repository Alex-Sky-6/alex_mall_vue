<template>
  <div class="wrapper">
    <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>新增收货地址</p>
  </header>
    <!-- 表单部分 -->
    <div class="form-box">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.contactName" placeholder="请输入姓名" clearable />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input v-model="addressForm.contactTel" placeholder="请输入手机号" type="tel" clearable />
        </el-form-item>
        
        <el-form-item label="性别">
          <el-radio-group v-model="addressForm.contactSex">
            <el-radio label="1">男</el-radio>
            <el-radio label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="详细地址">
          <el-input 
            v-model="addressForm.address" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入详细地址" 
            clearable 
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitForm"
            :loading="loading"
          >
            保存地址
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { post } from '@/api';
import { ElMessage } from 'element-plus';
import { getSessionStorage } from '@/utils/storage';

const router = useRouter();
const route = useRoute();
const businessId = route.query.businessId;
const account = getSessionStorage('account');

const addressForm = ref({
  contactName: '',
  contactTel: '',
  contactSex: 1, // 1-男, 0-女
  address: '',
  accountId: account.accountId
});

const loading = ref(false);

const submitForm = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    // 构造符合后端要求的JSON数据
    const payload = {
    contactName: addressForm.value.contactName,
    contactTel: addressForm.value.contactTel,
    contactSex: Number(addressForm.value.contactSex), // 转为数字
    address: addressForm.value.address,
    accountId: addressForm.value.accountId,
    businessId: businessId // 确保传递该字段
  };

    const res = await post('/deliveryaddress/add', payload, {
    headers: {
      'Content-Type': 'application/json' // 明确指定JSON格式
    }
  });
    
    if (res.data.code === 20000) {
      ElMessage.success('地址添加成功');
      router.back();
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '添加失败');
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  const { contactName, contactTel, address } = addressForm.value;
  
  if (!contactName.trim()) {
    ElMessage.warning('请输入收货人姓名');
    return false;
  }
  
  if (!/^1[3-9]\d{9}$/.test(contactTel)) {
    ElMessage.warning('请输入正确的手机号');
    return false;
  }
  
  if (!address.trim()) {
    ElMessage.warning('请输入详细地址');
    return false;
  }
  
  return true;
};
const toback=()=>{
  router.back();
}

</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 2vw;
  box-sizing: border-box;
}

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

.form-box {
  padding: 4vw;
  background-color: #fff;
  border-radius: 2vw;
  box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.1);
  /* 新增，避开固定的header */
  margin-top: 14vw; 
}

.el-form-item {
  margin-bottom: 4vw;
}

.el-button {
  width: 100%;
  height: 10vw;
  font-size: 4vw;
}
</style>