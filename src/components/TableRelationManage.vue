<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 表关系列表
const relationList = ref([])
const loading = ref(false)

// 表单数据和规则
const formData = ref({
  tableSchema: '',
  tableName: '',
  columnName: '',
  referencedTableSchema: '',
  referencedTableName: '',
  referencedColumnName: '',
  relationType: 1
})

const rules = {
  tableSchema: [{ required: true, message: '请输入主库名', trigger: 'blur' }],
  tableName: [{ required: true, message: '请输入主表名', trigger: 'blur' }],
  columnName: [{ required: true, message: '请输入主表字段', trigger: 'blur' }],
  referencedTableSchema: [{ required: true, message: '请输入关联库名', trigger: 'blur' }],
  referencedTableName: [{ required: true, message: '请输入关联表名', trigger: 'blur' }],
  referencedColumnName: [{ required: true, message: '请输入关联表字段', trigger: 'blur' }],
  relationType: [{ required: true, message: '请选择关联类型', trigger: 'change' }]
}

const formRef = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

// 获取表关系列表
const fetchRelations = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/table/relation/list')
    if (response.data.success) {
      relationList.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取表关系列表失败')
    }
  } catch (error) {
    ElMessage.error('获取表关系列表失败')
  } finally {
    loading.value = false
  }
}

// 打开添加/编辑对话框
const openDialog = (row) => {
  if (row) {
    isEdit.value = true
    currentId.value = row.id
    formData.value = { ...row }
  } else {
    isEdit.value = false
    currentId.value = null
    formRef.value?.resetFields()
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const url = isEdit.value ? `/api/table/relation/update` : '/api/table/relation/add'
    const method = 'post'
    const response = await axios[method](url, formData.value)
    
    if (response.data.success) {
      ElMessage.success(isEdit.value ? '表关系更新成功' : '表关系添加成功')
      dialogVisible.value = false
      fetchRelations()
    } else {
      ElMessage.error(response.data.message || (isEdit.value ? '更新失败' : '添加失败'))
    }
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || (isEdit.value ? '更新失败' : '添加失败'))
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
  }
}

// 删除表关系
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该表关系吗？', '提示', {
      type: 'warning'
    })
    
    const response = await axios.post(`/api/table/relation/delete/${id}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      fetchRelations()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchRelations()
})
</script>

<template>
  <div class="relation-manage">
    <div class="relation-header">
      <h2>表关系管理</h2>
      <el-button type="primary" @click="openDialog()">添加表关系</el-button>
    </div>
    
    <!-- 表关系列表 -->
    <el-table
      :data="relationList"
      v-loading="loading"
      style="width: 100%"
      border
    >
      <el-table-column prop="tableSchema" label="主库名" />
      <el-table-column prop="tableName" label="主表名" />
      <el-table-column prop="columnName" label="主表字段" />
      <el-table-column prop="referencedTableSchema" label="关联库名" />
      <el-table-column prop="referencedTableName" label="关联表名" />
      <el-table-column prop="referencedColumnName" label="关联表字段" />
      <el-table-column prop="relationType" label="关联类型" width="100">
        <template #default="{ row }">
          <span>{{ row.relationType === 1 ? '一对一' 
                        : row.relationType === 2 ? '一对多' 
                                : row.relationTsype === 3 ? '多对多' : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" @click="openDialog(row)" link>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete(row.id)" link>
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑表关系对话框 -->
    <el-dialog
      :title="isEdit ? '编辑表关系' : '添加表关系'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="relation-form"
      >
        <el-form-item label="主库名" prop="tableSchema">
          <el-input v-model="formData.tableSchema" placeholder="请输入主库名" />
        </el-form-item>
        
        <el-form-item label="主表名" prop="tableName">
          <el-input v-model="formData.tableName" placeholder="请输入主表名" />
        </el-form-item>
        
        <el-form-item label="主表字段" prop="columnName">
          <el-input v-model="formData.columnName" placeholder="请输入主表字段" />
        </el-form-item>
        
        <el-form-item label="关联库名" prop="referencedTableSchema">
          <el-input v-model="formData.referencedTableSchema" placeholder="请输入关联库名" />
        </el-form-item>
        
        <el-form-item label="关联表名" prop="referencedTableName">
          <el-input v-model="formData.referencedTableName" placeholder="请输入关联表名" />
        </el-form-item>
        
        <el-form-item label="关联表字段" prop="referencedColumnName">
          <el-input v-model="formData.referencedColumnName" placeholder="请输入关联表字段" />
        </el-form-item>
        
        <el-form-item label="关联类型" prop="relationType">
          <el-select v-model="formData.relationType" placeholder="请选择关联类型">
            <el-option label="一对一" :value="1" />
            <el-option label="一对多" :value="2" />
            <el-option label="多对多" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.relation-manage {
  padding: 20px;
}

.relation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.relation-header h2 {
  margin: 0;
}

.relation-form {
  margin-top: 20px;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>