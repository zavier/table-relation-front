<script setup>
import { ref } from 'vue'
import DatabaseQuery from './components/DatabaseQuery.vue'
import DataSourceManage from './components/DataSourceManage.vue'

const activeComponent = ref('database-query')
</script>

<template>
  <el-container class="app-container">
    <el-aside width="200px" class="aside">
      <el-menu
        mode="vertical"
        class="menu"
        :default-active="'1'"
      >
        <el-menu-item index="1" @click="activeComponent = 'database-query'">
          <el-icon><Search /></el-icon>
          <span>数据库查询</span>
        </el-menu-item>
        <el-menu-item index="2" @click="activeComponent = 'datasource-manage'">
          <el-icon><Setting /></el-icon>
          <span>数据源管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-main class="main">
      <component :is="activeComponent === 'database-query' ? DatabaseQuery : DataSourceManage" />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  height: 100vh;
}

.menu {
  border-right: none;
  background-color: transparent;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item.is-active) {
  color: #409EFF;
  background-color: #263445;
}

:deep(.el-menu-item:hover) {
  background-color: #263445;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
}
</style>
