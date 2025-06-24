<template>
  <div class="wrapper">
    <header>
      <p>用 户 登 录</p>
    </header>

    <!-- 登录表单  ref="loginForm"相当于定义 id="xxx"  在js代码中可以使用loginForm名字获得该Form表单对象
         v-model 双向数据绑定，变量中值可以显示在 文本框，
                 文本框的值修改，也可以同步回变量 
    -->
    <el-form ref="loginForm" :model="account" label-width="80px" class="form-box" :rules="rules" @submit.prevent>
      <el-form-item label="账户" prop="accountId">
        <el-input v-model="account.accountId" placeholder="请输入登录账户" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="account.password" type="password" show-password placeholder="请输入密码" />
      </el-form-item>

      <div class="button-login">
        <button @click="login()">登录</button>
      </div>
      <div class="button-register">
        <button @click="toRegister()">去注册</button>
      </div>
    </el-form>
    <Footer></Footer>
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue';
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import {get,post} from "@/api/index.js";
import {ElMessage} from "element-plus";
import { setSessionStorage } from '@/common.js';
// ElementUI-Plus 验证规则
const rules = reactive({
  accountId: [
    { required: true, message: '请输入登录账户', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
});

const router = useRouter();

// 定义变量 登录用户
const account = reactive({
  accountId: '', // 登录手机号
  password: '' // 密码
});

// 获得登录表单对象
const loginForm = ref(null);

const login = () => {
    // 通过 loginForm 表单对象，调用该对象 validate() 验证方法，如果定义验证规则通过，v 是 true，否则是 false
    loginForm.value.validate((v, f) => {
        if (v) {
            post('/account/login', account, false).then(res => {
                // 响应处理代码  res.data
                if (res.data.code === 20000) {
                    setSessionStorage('account', res.data.resultdata);
                    // 跳转至 首页
                    router.push('/')

                    ElMessage({
                        message: '登录成功',
                        type:'success',
                    })
                } else {
                    ElMessage({
                        message: res.data.message,
                        type: 'error',
                    })
                }
            });
        } else {
            return false;
        }
    });
};

const toRegister = () => {
  router.push('/register');
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