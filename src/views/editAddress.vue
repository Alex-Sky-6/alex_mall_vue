<template>
  <div class="wrapper">
    <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>编辑收货地址</p>
  </header>

    <!-- 表单部分 -->
    <div class="form-box">
      <el-form :model="form" label-width="80px">
        <el-form-item label="收货人">
          <el-input 
            v-model="form.contactName" 
            placeholder="请输入姓名" 
            clearable 
          />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input 
            v-model="form.contactTel" 
            placeholder="请输入手机号" 
            type="tel" 
            clearable 
          />
        </el-form-item>
        
        <el-form-item label="性别">
          <el-radio-group v-model="form.contactSex">
            <el-radio label="1">男</el-radio>
            <el-radio label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="详细地址">
          <el-input 
            v-model="form.address" 
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
            class="submit-btn"
          >
            保存地址
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部菜单部分 -->
    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post,put } from '@/api'
import { ElMessage } from 'element-plus'
import Footer from '../components/Footer.vue'

const router = useRouter()
const route = useRoute()
const businessId = route.query.businessId
const daId = route.query.daId

const form = ref({
  contactName: '',
  contactTel: '',
  contactSex: '1', // 1-男，0-女
  address: ''
})

const loading = ref(false)

// 初始化获取地址详情
const init = async () => {
  if (daId) {
    const res = await get(`/deliveryaddress/detail/${daId}`)
    if (res.data.code === 20000) {
      form.value = res.data.resultdata
      // 确保性别值为字符串类型
      form.value.contactSex = form.value.contactSex.toString()
    }
  }
}

// 表单提交
const submitForm = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    const payload = {
      ...form.value,
      daId: daId || undefined,
      businessId: businessId
    }
    
    const res = daId 
  ? await put('/deliveryaddress/update', payload)  // 更新用PUT
  : await post('/deliveryaddress/add', payload)   // 新增用POST

    if (res.data.code === 20000) {
      ElMessage.success(daId ? '地址修改成功' : '地址添加成功')
      router.back();
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

// 表单验证
const validateForm = () => {
  const { contactName, contactTel, address } = form.value
  
  if (!contactName?.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return false
  }
  
  if (!/^1[3-9]\d{9}$/.test(contactTel)) {
    ElMessage.warning('请输入正确的11位手机号')
    return false
  }
  
  if (!address?.trim()) {
    ElMessage.warning('请输入详细地址')
    return false
  }
  
  return true
}

// 初始化执行
onMounted(() => {
  init()
})

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

/* header样式与Address.vue保持一致 */
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

/* 表单容器 */
.form-box {
  margin-top: 15vw;
  padding: 4vw;
  background-color: #fff;
  border-radius: 2vw;
  box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.1);
}

/* 表单项间距 */
.el-form-item {
  margin-bottom: 4vw;
}

/* 提交按钮样式 */
.submit-btn {
  width: 100%;
  height: 10vw;
  font-size: 3.5vw;  /* 从4vw减小到3.5vw */
  background: linear-gradient(to right, #fff1eb, #ace0f9);
  border: none;
  color: #596164;
}

/* 适配Element Plus组件在小屏幕下的显示 */
:deep(.el-radio__label) {
  font-size: 3.5vw;  /* 从3.8vw减小到3.5vw */
}

:deep(.el-form-item__label) {
  font-size: 3.5vw;  /* 从4vw减小到3.5vw */
}
</style>