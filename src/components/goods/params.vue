<template>
  <div class="params">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数!" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="cascaderValue"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="addDialogVisible = !addDialogVisible"
          >添加参数</el-button>
          <el-table :data="manyData" border stripe row-key="id">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 渲染标签 -->
                <el-tag
                  v-for="(item, i) in slotProps.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,slotProps.row)"
                >{{item}}</el-tag>
                <!-- 新添标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="mini"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delDialog(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="addDialogVisible = !addDialogVisible"
          >添加参数</el-button>
          <el-table :data="onlyData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 渲染标签 -->
                <el-tag
                  v-for="(item, i) in slotProps.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,slotProps.row)"
                >{{item}}</el-tag>
                <!-- 新添标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="mini"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delDialog(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 编辑参数对话框 -->
    <el-dialog title="编辑参数" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name "></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name "></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      cascaderValue: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyData: [],
      // 静态属性的数据
      onlyData: [],
      // 添加属性对话框显示与否
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      // 添加参数校验规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 编辑参数对话框显示与否
      editDialogVisible: false,
      // 编辑参数对话框数据
      editForm: {},
      // 编辑参数对话框校验规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 控制新添标签与文本框的切换
      inputVisible: false,
      // 文本框的输入
      inputValue: ''
    }
  },
  created () {
    this.getcateList()
  },
  methods: {
    // 获取商品列表数据
    async getcateList () {
      const { data: res } = await this.axios.get('/categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 当级联选择框发生变化时，就会促发下面的函数
    handleChange () {
      this.getParamsData()
      this.manyData = []
      this.onlyData = []
    },
    // 当tab标签发生变化时，就会促发下面的函数
    handleClick () {
      this.getParamsData()
    },
    // 获取参数列表的数据
    async getParamsData () {
      // 如果数组长度不等于3，证明选中的不是三级分类
      if (this.cascaderValue.length !== 3) {
        this.cascaderValue = []
        return 0
      }
      // 证明选中的是三级分类
      // 根据所选分类的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // 根据不同的参数面板，将不同的数据结果保存到不同对象上
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    // 关闭添加参数对话框
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮获取参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.getParamsData()
        this.$message.success('添加成功')
        this.addDialogVisible = false
      })
    },
    // 关闭编辑参数对话框
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑参数
    async editDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.axios.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
    },
    // 确认编辑并提交
    editParams () {
      this.editDialogVisible = false
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return 0
        console.log(this.cateId, this.editForm)
        const { data: res } = await this.axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('编辑成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除编辑对话框
    async delDialog (id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.axios.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 文本框失去焦点或者按下enter键都会促发该函数
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return 0
      }
      // 如果没有return，则证明输入的内容合法，需要做后续处理
      row.attr_vals.push(row.inputValue)
      row.inputVisible = false
      row.inputValue = ''
      this.saveAttrVals(row)
    },
    async saveAttrVals (row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) return this.$$message.error(res.meta.msg)
    },
    // 按钮的点击事件
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除新添标签
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 当级联选择框的长度为3时，才启用添加参数按钮
    isBtnDisable () {
      return this.cascaderValue.length !== 3
    },
    // 获取级联选择框选中项的id
    cateId () {
      if (this.cascaderValue.length === 3) {
        return this.cascaderValue[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态属性'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less">
.params {
  .el-tag {
    margin: 5px 10px;
  }
  .cat_opt {
    margin: 15px 0;
  }
  .input-new-tag {
    width: 150px;
  }
}
</style>
