import { createRouter, createWebHistory } from 'vue-router'
import DatabaseQuery from '../components/DatabaseQuery.vue'
import DataSourceManage from '../components/DataSourceManage.vue'
import TableRelationManage from '../components/TableRelationManage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/database-query'
    },
    {
      path: '/database-query',
      name: 'DatabaseQuery',
      component: DatabaseQuery
    },
    {
      path: '/datasource-manage',
      name: 'DataSourceManage',
      component: DataSourceManage
    },
    {
      path: '/table-relation-manage',
      name: 'TableRelationManage',
      component: TableRelationManage
    }
  ]
})

export default router