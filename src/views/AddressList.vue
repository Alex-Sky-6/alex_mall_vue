<template>
    <div class="wrapper">
  
      <header class="custom-header">
  <!-- 箭头容器，加类名方便定位 -->
  <div class="back-arrow" @click="toback()">
    <el-icon><ArrowLeftBold /></el-icon>
  </div>
  <p>地址管理</p>
  </header>
  
     <!-- 地址列表部分 -->
<ul class="addresslist">
  <!-- 过滤出statu=1的地址 -->
  <template v-if="addresslist.filter(item => item.statu === 1).length > 0">
    <li 
      v-for="item in addresslist.filter(item => item.statu === 1)" 
      :key="item.daId" 
    >
      <div class="addresslist-left">
        <h3>
          <em>{{item.contactName}}</em> 
          {{$fmtSex(item.contactSex)}} 
          <i>{{item.contactTel}}</i>
        </h3>
        <p>{{item.address}}</p>
      </div>
      <div class="addresslist-right">
        <el-icon @click.stop="editAddress(item.daId)"><Edit /></el-icon>
        <el-icon @click.stop="deleteAddress(item.daId)"><Delete /></el-icon>
      </div>
    </li>
  </template>
  <template v-else>
    <p class="none">还没有添加配送地址</p>
  </template>
</ul>
  
    <!-- 修改原地址管理页面的新增按钮部分 -->
<div class="addbtn" @click="addAddress">
  <el-icon><Select /></el-icon>
  <p>新增收货地址</p>
</div>
  
      <!-- 底部菜单部分 -->
      <Footer></Footer>
    </div>
  </template>
  
  <script setup>
    import Footer from '../components/Footer.vue'
    // eslint-disable-next-line no-unused-vars
     import {ref,reactive,computed} from "vue"
import { useRoute,useRouter } from "vue-router"
// eslint-disable-next-line no-unused-vars
import { get,post,del} from "@/api";
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSessionStorage,setLocalStorage } from '@/utils/storage'; 
const router = useRouter();
const route = useRoute();

// 从路由中获取商家的编号
const businessId = route.query.businessId;
const account = getSessionStorage('account');

const addresslist = ref([]);
const editAddress = (daId) => {
  router.push({
    path: '/editAddress',
    query: {
      daId: daId,
      businessId: businessId // 传递当前商家ID
    }
  });
};
const deleteAddress = async (daId) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 修改为使用 delete 方法，并将 daId 放在 URL 路径中
    const res = await del(`/deliveryaddress/delete/${daId}`)
    
    if (res.data.code === 20000) {
      ElMessage.success('删除成功')
      init() // 刷新列表
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error) {
    // 只有当不是用户取消操作时才显示错误
    if (error !== 'cancel') {
      console.error('删除地址错误:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}
 //设置默认配送地址的方法
const setDefaultAddress = (da) =>{

    setLocalStorage(account.accountId,da);
    //默认配送地址设置成功，返回上一页(确认订单)
    ElMessage({
        message: '配送信息设置成功',
        type: 'success',
    })
    router.push({path:'/orderConfirm',query:{businessId:businessId}});
 }
 const addAddress = () => {
  router.push({ 
    path: '/addAddress',
    query: { businessId: businessId } // 传递当前商家ID
  });
};

// 初始化获取配送地址列表
const init = () => {
  let url = `/deliveryaddress/list/${account.accountId}`;
  get(url).then(res => {
    if (res.data.code == 20000) {
      addresslist.value = res.data.resultdata;
    }
  })
}

// 执行初始化
init();

const toback=()=>{
  router.push('/center');
}

  </script>
  
  <style scoped>
    /*************** 总容器 ***************/
    .wrapper {
      width: 100%;
      height: 100%;
      
      padding: 2vw;
      box-sizing: border-box;
    }
  
    /*************** header ***************/
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
  
    /*************** addresslist ***************/
    .wrapper .addresslist {
      width: 100%;
      margin-top: 12vw;
    }
    
    .wrapper .addresslist .none{
      text-align: center; color:#c9c9c9;
    }
    .wrapper .addresslist li {
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0.5vw 0.5vw 3vw rgba(0, 0, 0, 0.1);
      padding: 3vw;
      display: flex;
      background-color: #fff;
      border-radius: 1.6vw;
      margin:3vw auto;
    }
  
    .wrapper .addresslist li .addresslist-left {
      flex: 5;
      /*左边这块区域是可以点击的*/
      user-select: none;
      cursor: pointer;
    }
  
    .wrapper .addresslist li .addresslist-left h3 {
      font-size: 3.8vw;
      font-weight: 300;
      color: #79859E;
      margin:0.5vw;
    }

    .wrapper .addresslist li .addresslist-left h3 em{
      color:#3cba92;
      font-style: normal;
      font-weight: 400;
    }
  
    .wrapper .addresslist li .addresslist-left p {
      font-size: 3.4vw;
      color: #35624a;
      margin:0.5vw;
    }
  
    .wrapper .addresslist li .addresslist-right {
      flex: 1;
      font-size: 4.6vw;
      color: #79859E;
      cursor: pointer;
      padding-left: 4vw;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .wrapper .addresslist li .addresslist-right i{
      display: block;
      width: 6.4vw;
      height: 6.4vw;
      background-position: center;
      background-size: cover;
      user-select: none;
      cursor: pointer;
      margin-left:1.5vw;
      
    }


    .wrapper .addresslist li .addresslist-right .edit_icon{
      background-image: url(../assets/edit.png); 
    }

    
    .wrapper .addresslist li .addresslist-right .remove_icon{
      background-image: url(../assets/remove.png);
    }

    .wrapper .addresslist li .addresslist-right .el-icon-delete {
      color: #ff0066;
    }
  
    /*************** 新增地址部分 ***************/
    .wrapper .addbtn {
      width: 100%;
      height: 14vw;
      border-top: solid 1px #fff;
      margin-top: 4vw;
  
      display: flex;
      justify-content: center;
      align-items: center;
  
      font-size: 4vw;

      user-select: none;
      cursor: pointer;

      background-color: #fdfcfb;
      border:0.3vw solid #e2d1c3;
      border-radius: 1.5vw;
      color:#5f72bd;
    }
  
    .wrapper .addbtn p {
      margin-left: 2vw;
    }
    .wrapper .addbtn .fa-plus-circle {
      color: #2c3035;
    }
  </style>
  