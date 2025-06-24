<template>
  <div class="wrapper">
    <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>修改密码</p>
  </header>
    <!-- 表单：绑定form、校验规则、阻止默认提交 -->
    <el-form 
      ref="passwordFormRef" 
      :model="account" 
      label-width="80px" 
      class="form-box" 
      :rules="rules" 
      @submit.prevent
    >
      <!-- 原密码 -->
      <el-form-item label="原密码" prop="password0">
        <el-input 
          v-model="account.password0" 
          placeholder="请输入原密码" 
          type="password"
          show-password
          @blur="checkOldPassword()"
        />
      </el-form-item>
      <!-- 新密码 -->
      <el-form-item label="新密码" prop="password">
        <el-input 
          v-model="account.password" 
          type="password" 
          show-password
          placeholder="请输入更改密码"
        />
      </el-form-item>
      <!-- 确认新密码 -->
      <el-form-item label="确认密码" prop="password2">
        <el-input 
          v-model="account.password2" 
          type="password" 
          placeholder="请再次输入更改密码"
          show-password
        />
      </el-form-item>
      <!-- 保存修改按钮 -->
      <div class="button-login">
        <button @click="handlesave">保存修改</button>
      </div>
    </el-form>
    <Footer></Footer>
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue';
import { reactive, ref } from "vue";
import { useRouter } from 'vue-router';
import { get, post } from '@/api/index.js';
import { ElMessage } from 'element-plus';
import { getSessionStorage } from '@/common.js';

const router = useRouter();
const Account = getSessionStorage('account')

const account = reactive({
  password0: '',   // 原密码
  password: '',    // 新密码
  password2: '',   // 确认新密码
});

// 表单校验规则：修正 prop 关联，补充原密码校验
const rules = reactive({
  password0: [ 
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' }
  ],
  password2: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value!== account.password) {
          callback(new Error('两次密码不一致'));
        } else {
          callback();
        }
      }
    }
  ],
});

// 表单引用
const passwordFormRef = ref(null);

// 校验原密码是否正确
const checkOldPassword = () => {
  let url = "/account/checkpassword"; 
  let requestData = {
    accountId: Account.accountId,
    password: account.password0
  };
  post(url, requestData, false).then(res => {
    if (res.data.code === 20010) {
      ElMessage({
        message: res.data.message,
        type: 'error',
      });
      account.password0 = ''; // 清空原密码输入框
    } 
  }).catch(err => {
    ElMessage.error('校验原密码失败，请稍后重试');
    console.error('校验原密码请求失败：', err);
  });
}

// 保存修改密码
const handlesave = () => {
  // 1. 先校验表单基本规则（非空、两次密码一致等）
  passwordFormRef.value.validate((v,f) => {
    if (v) {
      // 2. 可在这里再次校验原密码（比如 blur 时用户没触发校验的情况，可选）
      // 或者依赖 blur 时的校验结果，根据业务需求决定
      let url = "/account/updatepassword"; 
      let requestData = {
        oldPassword: account.password0,  
        newPassword: account.password,   
        accountId: Account.accountId
      };
      post(url, requestData, false).then(res => {
        if (res.data.code === 20000) {
          ElMessage({
            message: '密码修改成功',
            type: 'success',
          })
          router.push('/center'); 
        } else {
          ElMessage.error(res.data.message || '修改失败');
        }
      }).catch(err => {
        ElMessage.error('网络异常，请重试');
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
/* 保持原有样式即可，以下是原样式 */
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
.wrapper .form-box{
  width:100%; 
  margin-top:20vw;
  padding: 5vw;
  box-sizing: border-box;
}
.wrapper .form-box .el-input{
  width:90%;
}
.wrapper .button-login{
  width:100%;
  box-sizing: border-box;
  padding:4vw 4vw 0 4vw;
}
.wrapper .button-login button{
  width:100%;
  height:10vw;
  font-size: 3.8vw;
  background-color: #3cba92;
  border:none;
  border-radius: 1.5vw;
  color:#efefef;
  outline: none;
  letter-spacing: 2vw;
}
/* 以下样式与“修改密码”无关，可保留或删除 */
.wrapper .button-register{
  width:100%;
  box-sizing: border-box;
  padding:4vw;
}
.wrapper .button-register button{
  width:100%;
  height:10vw;
  font-size: 3.8vw;
  background-color: #fdfcfb;
  border:0.3vw solid #e2d1c3;
  border-radius: 1.5vw;
  color:#5f72bd;
  outline: none;
  letter-spacing: 2vw;
}
.upload{
  width:42vw;
  height:42vw;
  background-color: #efefef;
  border-radius: 4vw;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
  border-radius: 3vw;
}
</style>