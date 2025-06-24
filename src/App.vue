<template>
  <!-- 路由出口 -->
  <router-view>
  </router-view>
  <!-- <nav>
    <router-link to="/">首页</router-link> |
    <router-link to="/login">登录</router-link>|
    <router-link to="/register">注册</router-link>
  </nav> -->
</template>

<style>
    /* 主组件：所有组件都使用的样式。 */
    /* CSS重置 */
    body,div,ul,ol,li,p,h1,h2,h3,h4,h5,h6,span,a,img,form{
        margin: 0;
        padding: 0;
    }
    html,body{
        width: 100%;
        font-family: Arial,'microsoft yahei';
        height:100%;
    }
    ul{
        list-style: none; /* none 设置列表不显示列表符号 */
    }
    a{ text-decoration: none; } /* 去掉页面上所有超链接下划线 */
</style>