<template>
  <div class="wrapper">
    <header>
      <p>用 户 注 册</p>
    </header>

    <!-- 登录表单  ref="loginForm"相当于定义 id="xxx"  在js代码中可以使用loginForm名字获得该Form表单对象
         v-model 双向数据绑定，变量中值可以显示在 文本框，
                 文本框的值修改，也可以同步回变量 
    -->
    <el-form ref="registerForm" :model="account" label-width="80px" class="form-box" :rules="rules" @submit.prevent>
      <el-form-item label="账户" prop="accountId">
        <el-input v-model="account.accountId" placeholder="请输入注册账户（手机号）" @blur="checkAccountId()"/>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="account.password" type="password" show-password placeholder="请输入注册密码" />
      </el-form-item>
      <!-- 修正确认密码的 v-model 绑定 -->
      <el-form-item label="确认密码" prop="password2">
        <el-input v-model="account.password2" type="password" show-password placeholder="请输入注册确认密码" />
      </el-form-item>
      <!-- 修正昵称的 v-model 绑定 -->
      <el-form-item label="昵称" prop="accountName">
        <el-input v-model="account.accountName" placeholder="请输入注册昵称" />
      </el-form-item>
      <el-form-item label="性别" prop="accountSex">
        <el-radio-group v-model="account.accountSex">
          <el-radio value="1">男</el-radio>
          <el-radio value="0">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="button-login">
        <button @click="register()">注册</button>
      </div>
      <div class="button-register">
        <button @click="toLogin()">去登录</button>
      </div>
    </el-form>
    <Footer></Footer>
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue';
import { ElMessage } from 'element-plus';
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { get, post } from "../api/index.js";

const router = useRouter();


const account = reactive({
  accountId: '',
  password: '',
  password2: '',
  accountName: '',
  accountSex: '',
  accountImg:'',
});

// ElementUI-Plus 验证规则
const rules = reactive({
  accountId: [
    { required: true, message: '请输入注册账户', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  accountName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  accountSex: [
    { required: true, message: '请选择性别', trigger: 'blur' }
  ],
  password2: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== account.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
});



// 获得注册表单对象
const registerForm = ref(null);

//验证手机号码
const checkAccountId=()=>{
  if(account.accountId !=""){
    let url =`/account/check/${account.accountId}`;
    get(url).then(res =>{
      if(res.data.code == 20005){
        ElMessage({
          message: res.data.message,
          type: 'error',
        });
        account.accountId='';
      }
    });
  }
}

const register = () => {
    // 通过 registerForm 表单对象，调用该对象 validate() 验证方法，如果定义验证规则通过，v 是 true，否则是 false
    registerForm.value.validate((v, f) => {
        if (v) {
            let url = "/account/register";
            post(url, account, true).then(res => {
                if (res.data.code === 20000) {
                    ElMessage({
                        message: '注册成功，请登录',
                        type:'success',
                    })
                    router.push('/login');
                }
            });
        } else {
            return false;
        }
    });
}

const toLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
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

/* APP标题部分样式 */

/* 登录部分样式代码 */
.wrapper .form-box {
  width: 100%;
  margin-top: 20vw;
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

.wrapper .button-register {
  width: 100%;
  box-sizing: border-box;
  padding: 4vw;
}

.wrapper .button-register button {
  width: 100%;
  height: 10vw;
  font-size: 3.8vw;
  background-color: #fdfcfb;
  border: 0.3vw solid #e2d1c3;
  border-radius: 1.5vw;
  color: #5f72bd;
  outline: none;
  letter-spacing: 2vw;
}
</style>