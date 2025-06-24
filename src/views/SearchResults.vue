<template>
  <div class="wrapper">
    <!-- 搜索栏 -->
    <div class="search-header">
      <div class="search-box">
        <i class="search_icon" />
        <input 
          v-model="searchQuery" 
          placeholder="搜索商家名称、商品名称"
          @keyup.enter="doSearch"
        />
      </div>
      <el-button @click="router.back()">取消</el-button>
    </div>

    <!-- 搜索结果列表 -->
    <div class="search-results">
      <template v-if="results.length > 0">
        <div 
          v-for="business in results" 
          :key="business.businessId"
          class="business-item"
          @click="toBusinessInfo(business.businessId)"
        >
          <img :src="business.businessImg" />
          <div class="business-info">
            <h3>{{ business.businessName }}</h3>
            <p class="address">{{ business.businessAddress }}</p>
            <div class="delivery-info">
              <span>￥{{ business.starPrice }}起送</span>
              <span>￥{{ business.deliveryPrice }}配送</span>
            </div>
            <p class="tags">{{ business.businessExplain }}</p>
          </div>
        </div>
      </template>
      <div v-else class="empty-tip">
        <img src="@/assets/no_results.png" />
        <p>没有找到相关商家</p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted,watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get } from '@/api'
import Footer from '@/components/Footer.vue'

const route = useRoute()
const router = useRouter()
const searchQuery = ref(route.query.keyword || '')
const results = ref([])
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})
// 修改doSearch方法
const doSearch = async () => {
  try {
    const keyword = route.query.keyword || ''
     if (!keyword.trim()) {
      results.value = []
      return
    }

    // 必须将参数传递给API（关键修复点）
    const res = await get('/business/search', {
      params: {  // 添加params对象
        keyword: keyword.trim(),
        page: pagination.value.page,
        size: pagination.value.size
      }
    });
    
    // 处理MyBatis-Plus分页结构
    if (res.data?.code === 20000) {
      results.value = res.data.resultdata?.records || []
      pagination.value.total = res.data.resultdata?.total || 0
    }
  } catch (error) {
    console.error('搜索失败:', error);
    // 显示用户友好提示
    results.value = [];
  }
}
    // 跳转商家详情
    const toBusinessInfo=(id)=>{
    router.push({path:'/businessInfo',query:{businessId:id}});
    }
// SearchResults.vue 添加监听
watch(() => route.query.keyword, (newVal) => {
  if (newVal !== undefined) {
    searchQuery.value = newVal
    doSearch()
  }
}, { immediate: true })

// 初始化搜索
onMounted(() => {
  if (searchQuery.value) doSearch()
})
</script>

<style scoped>
.search-header {
  display: flex;
  padding: 2vw;
  background: #fff;
  align-items: center;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 1vw 3vw;
}
.search_icon {
  width: 4vw;
  height: 4vw;
  background: url('@/assets/search.png') no-repeat center;
  background-size: contain;
}
.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 1vw 2vw;
  font-size: 3.8vw;
}

.business-item {
  display: flex;
  padding: 3vw;
  border-bottom: 1px solid #eee;
}
.business-item img {
  width: 20vw;
  height: 20vw;
  border-radius: 2vw;
  margin-right: 3vw;
}
.business-info h3 {
  font-size: 4.2vw;
  margin-bottom: 1vw;
}
.address {
  color: #666;
  font-size: 3.2vw;
  margin: 1vw 0;
}
.delivery-info span {
  color: #666;
  font-size: 3vw;
  margin-right: 2vw;
}
.tags {
  color: #999;
  font-size: 3vw;
  margin-top: 1vw;
}
.empty-tip {
  text-align: center;
  padding: 10vw;
}
.highlight {
  color: #ff4d4f;
  font-weight: bold;
}
.empty-tip img {
  width: 30vw;
  opacity: 0.5;
}
</style>