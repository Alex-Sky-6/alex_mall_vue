<template>
    <div class="wrapper">
      <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>修改昵称</p>
  </header>
      <el-form ref="nameFormref" :model="nameForm" label-width="80px" class="form-box" :rules="rules" @submit.prevent>
        <el-form-item label="新昵称" prop="newNickname">
          <el-input v-model="nameForm.newNickname"  placeholder="请输入要修改的昵称"/>
        </el-form-item>
        <div class="button-login">
          <!-- 点击保存修改，调用 handleSave 方法 -->
          <button @click="handleSave()">保存修改</button>
        </div>
      </el-form>
      <Footer></Footer>
    </div>
  </template>
  
  <script setup>
  import Footer from '@/components/Footer.vue';
  import { ref, reactive } from "vue";
  import { useRouter } from "vue-router";
  import { get, post } from '@/api/index.js';
  import { ElMessage } from 'element-plus';
  import { getSessionStorage, setSessionStorage } from '@/common'; 
  
  const router = useRouter();
  
  // 表单校验规则，针对新昵称做非空等校验
  const rules = reactive({
    newNickname: [
      { required: true, message: '请输入要修改的昵称', trigger: ['blur','change'] }
    ]
  });
  
  // 管理表单数据的对象，存储新昵称
  const nameForm = reactive({
    newNickname: '' 
  });
  
  const account = getSessionStorage('account'); 

  // 用于显示当前昵称
  const currentName = ref('');
  
  // 获取表单实例
  const nameFormref = ref(null); 

  // 保存修改的逻辑
  const handleSave = () => {
  // 【新增】先校验表单，通过再发请求
  nameFormref.value.validate((v) => {
    if (v) {
      let url = "/account/updatename";
      let requestData = {
        nickname: nameForm.newNickname,
        accountId: account.accountId
      };
      post(url, requestData, false).then(res => {
        if (res.data.code === 20000) {
          // 更新缓存中的昵称
          account.accountName = nameForm.newNickname;
          setSessionStorage('account', account); 
          // 更新当前显示的昵称
          currentName.value = nameForm.newNickname; 
          ElMessage.success('昵称修改成功');
          // 可根据需求跳转，比如跳个人中心
          router.push('/center'); 
        } else {
          ElMessage.error(res.data.message || '修改失败，请重试');
        }
      }).catch(err => {
        ElMessage.error('网络异常，请稍后再试');
      });
    } else {
      ElMessage.warning('请按要求填写表单');
    }
  });
}
const toback=()=>{
  router.back();
}
  </script>
  
  <style scoped>
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
  .wrapper .form-box {
    width: 100%; margin-top: 20vw;
    padding: 5vw;
    box-sizing: border-box;
  }
  .wrapper .form-box .el-input {
    width: 90%;
  }
  .wrapper .button-login {
    width: 100%;
    box-sizing: border-box;
    padding: 4vw 4vw 0 4vw;
  }
  .wrapper .button-login button {
    width: 100%;
    height: 10vw;
    font-size: 3.8vw;
    background-color: #3cba92;
    border: none;
    border-radius: 1.5vw;
    color: #efefef;
    outline: none;
    letter-spacing: 2vw;
  }
  </style>