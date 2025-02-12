import { createRouter, createWebHashHistory } from 'vue-router'
import DatabaseQuery from '../components/DatabaseQuery.vue'
import DataSourceManage from '../components/DataSourceManage.vue'
import TableRelationManage from '../components/TableRelationManage.vue'
import JsonFormatter from '../components/JsonFormatter.vue'
import MermaidERViewer from '../components/MermaidERViewer.vue'

const router = createRouter({
  history: createWebHashHistory(),
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
    },
    {
        path: '/er-diagram',
        name: 'ERDiagram',
        component: MermaidERViewer
    },
    {
      path: '/json-formatter',
      name: 'JsonFormatter',
      component: JsonFormatter
    }
  ]
})

export default router