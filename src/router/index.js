import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import BusinessList from '@/views/BusinessList.vue'
import BusinessInfo from '@/views/BusinessInfo.vue'
import OrderConfirm from '@/views/OrderConfirm.vue'
import Address from '@/views/Address.vue'
import Payment from '@/views/Payment.vue'
import Cart from '@/views/Cart.vue'
import Center from '@/views/Center.vue'
import UpdateName from '@/views/UpdateName.vue'
import UpdatePwd from '@/views/UpdatePwd.vue'
import UpdateSex from '@/views/UpdateSex.vue'
import AllCagetory from '@/views/AllCagetory.vue'
import MyFavorite from '@/views/MyFavorite.vue'
import OrderList from '@/views/OrderList.vue'
import AddressList from '@/views/AddressList.vue'
import MyComment from '@/views/MyComment.vue'
import BusinessComment from '@/views/BusinessComment.vue'
import OnlineComment from '@/views/onlineComment.vue'



//定义路由规则
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/businessList',
    name: 'businessList',
    component: BusinessList
  },
  {
    path: '/businessInfo',
    name: 'businessInfo',
    component: BusinessInfo
  },
  {
    path: '/orderConfirm',
    name: 'orderConfirm',
    component: OrderConfirm
  },
  {
    path: '/address',
    name: 'address',
    component: Address
  },
  {
    path: '/payment',
    name: 'payment',
    component: Payment
  },
  {
    path: '/cart',
    name: 'cart',
    component: Cart
  },
  {
    path: '/center',
    name: 'center',
    component: Center
  },
  {
    path: '/updateName',
    name: 'updateName',
    component: UpdateName
  },
  {
    path: '/updatePwd',
    name: 'updatePwd',
    component: UpdatePwd
  },
  {
    path: '/updateSex',
    name: 'updateSex',
    component: UpdateSex
  },
  {
    path: '/allCagetory',
    name: 'allCagetory',
    component: AllCagetory
  },
  {
    path: '/myFavorite',
    name: 'myFavorite',
    component: MyFavorite
  },
  {
  path: '/search',
  name: 'SearchResults',
  component: () => import('@/views/SearchResults.vue')
  },
  {
    path: '/addAddress',
    name: 'addAddress',
    component: () => import('@/views/addAddress.vue')
  },
  {
    path: '/editAddress',
    name: 'editAddress',
    component: () => import('@/views/editAddress.vue'),
  },
  {
    path: '/orderList',
    name: 'orderList',
    component: OrderList
  },
  {
    path: '/addressList',
    name: 'addressList',
    component: AddressList
  },
  {
    path: '/myComment',
    name: 'myComment',
    component: MyComment
  },
  {
    path: '/businessComment',
    name: 'businessComment',
    component: BusinessComment
  },
  {
    path: '/onlineComment',
    name: 'onlineComment',
    component: OnlineComment
  },

]

//创建路由对象
const router = createRouter({
  history: createWebHashHistory(),
  //路由规则 routes:值  routes:routes 如果属性名和属性值是同名，可以简写成routes
  routes
})

export default router
