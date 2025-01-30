<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const schemas = ref([])
const selectedSchema = ref('')
const tables = ref([])
const selectedTable = ref('')
const fields = ref([])
const queryConditions = ref([])
const queryResult = ref(null)
const mainTableData = ref(null)
const relatedTablesData = ref({})

// 获取数据库schema列表
const fetchSchemas = async () => {
  try {
    const response = await axios.get('/api/table/allSchema')
    // 将返回的字符串数组转换为对象数组格式，以适配现有的组件结构
    schemas.value = response.data.map((schemaName, index) => ({
      id: schemaName,
      name: schemaName
    }))
  } catch (error) {
    console.error('获取schema失败:', error)
  }
}

// 获取表列表
const fetchTables = async () => {
  if (!selectedSchema.value) return
  try {
    const response = await axios.get(`/api/table/schemaTables`, {
      params: {
        schema: selectedSchema.value
      }
    })
    // 将返回的字符串数组转换为对象数组格式，以适配现有的组件结构
    tables.value = response.data.map((tableName) => ({
      id: tableName,
      name: tableName
    }))
    selectedTable.value = ''
    fields.value = []
    queryConditions.value = []
  } catch (error) {
    console.error('获取表失败:', error)
  }
}

// 获取字段列表
const fetchFields = async () => {
  if (!selectedTable.value) return
  try {
    const response = await axios.get('/api/table/tableColumns', {
      params: {
        schema: selectedSchema.value,
        tableName: selectedTable.value
      }
    })
    // 将返回的字符串数组转换为对象数组格式，以适配现有的组件结构
    fields.value = response.data.map(fieldName => ({
      id: fieldName,
      name: fieldName
    }))
    queryConditions.value = []
  } catch (error) {
    console.error('获取字段失败:', error)
  }
}

// 添加查询条件
const addCondition = () => {
  queryConditions.value.push({
    field: '',
    operator: '=',
    value: ''
  })
}

// 移除查询条件
const removeCondition = (index) => {
  queryConditions.value.splice(index, 1)
}

// 执行查询
const executeQuery = async () => {
  try {
    const response = await axios.post('/api/table/sqlQuery', {
      schema: selectedSchema.value,
      table: selectedTable.value,
      conditions: queryConditions.value
    })
    queryResult.value = response.data
    // 分离主表数据和关联表数据
    mainTableData.value = response.data[selectedTable.value] || []
    relatedTablesData.value = Object.entries(response.data)
      .filter(([key]) => key !== selectedTable.value)
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})
  } catch (error) {
    console.error('查询执行失败:', error)
  }
}

onMounted(() => {
  fetchSchemas()
})
</script>

<template>
  <div class="database-query">
    <h2>数据库查询工具</h2>
    
    <!-- Schema选择 -->
    <el-select
      v-model="selectedSchema"
      placeholder="选择数据库Schema"
      class="query-select"
      @change="fetchTables"
    >
      <el-option
        v-for="schema in schemas"
        :key="schema.id"
        :label="schema.name"
        :value="schema.id"
      />
    </el-select>

    <!-- 表选择 -->
    <el-select
      v-model="selectedTable"
      placeholder="选择表"
      class="query-select"
      :disabled="!selectedSchema"
      @change="fetchFields"
    >
      <el-option
        v-for="table in tables"
        :key="table.id"
        :label="table.name"
        :value="table.id"
      />
    </el-select>

    <!-- 查询条件 -->
    <div class="query-conditions" v-if="selectedTable">
      
      <div v-for="(condition, index) in queryConditions" :key="index" class="condition-row">
        <el-select v-model="condition.field" placeholder="选择字段" class="condition-field">
          <el-option
            v-for="field in fields"
            :key="field.id"
            :label="field.name"
            :value="field.id"
          />
        </el-select>
        
        <el-select v-model="condition.operator" class="condition-operator">
          <el-option label="等于" value="=" />
          <el-option label="不等于" value="!=" />
          <el-option label="大于" value=">" />
          <el-option label="小于" value="<" />
          <el-option label="包含" value="LIKE" />
        </el-select>
        
        <el-input v-model="condition.value" placeholder="输入值" class="condition-value" />
        
        <el-button type="danger" @click="removeCondition(index)">删除</el-button>
      </div>

      <div class="query-actions">
        <el-button type="primary" @click="addCondition">添加条件</el-button>
        <el-button type="primary" @click="executeQuery" :disabled="!queryConditions.length">
          执行查询
        </el-button>
      </div>
    </div>

    <!-- 查询结果 -->
    <div v-if="queryResult" class="query-result">
      <h3>查询结果</h3>
      
      <!-- 主表数据 -->
      <div class="main-table-section">
        <h4>{{ selectedTable }} (主表)</h4>
        <el-card class="result-card">
          <vue-json-pretty
            :data="mainTableData"
            :deep="2"
            :show-double-quotes="true"
            :show-length="true"
            :show-line="true"
            class="json-viewer"
          />
        </el-card>
      </div>

      <!-- 关联表数据 -->
      <div v-if="Object.keys(relatedTablesData).length" class="related-tables-section">
        <h4>关联表数据</h4>
        <el-collapse>
          <el-collapse-item
            v-for="(data, tableName) in relatedTablesData"
            :key="tableName"
            :title="tableName"
          >
            <el-card class="result-card">
              <vue-json-pretty
                :data="data"
                :deep="2"
                :show-double-quotes="true"
                :show-length="true"
                :show-line="true"
                class="json-viewer"
              />
            </el-card>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<style scoped>
.database-query {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.query-select {
  width: 200px;
  margin-right: 20px;
  margin-bottom: 20px;
}

.query-conditions {
  margin-top: 10px;
}

.condition-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.condition-field {
  width: 200px;
}

.condition-operator {
  width: 100px;
}

.condition-value {
  width: 200px;
}

.query-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.query-result {
  margin-top: 20px;
}

.result-card {
  margin-top: 10px;
  background-color: #f8f9fa;
}

.result-card .json-viewer {
  margin: 0;
  background: transparent;
}

.vjs-tree {
  font-size: 14px !important;
}

.vjs-tree .vjs-value {
  color: #409EFF !important;
}

.vjs-tree .vjs-key {
  color: #67C23A !important;
}

.main-table-section {
  margin-bottom: 20px;
}

.main-table-section h4,
.related-tables-section h4 {
  margin-bottom: 10px;
  color: #606266;
}

.related-tables-section .el-collapse {
  border: none;
}

.related-tables-section .el-collapse-item__header {
  font-size: 16px;
  color: #409EFF;
}

.related-tables-section .el-collapse-item__content {
  padding: 10px;
}
</style>