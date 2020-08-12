<template>
  <div class="cate">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表单区域 -->
      <el-table :data="getCateList" row-key="cat_id" border :tree-props="{children: 'children'}" >
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="是否有效">
          <template v-slot="slotProps">
            <i
              class="el-icon-success"
              style="color:#409EFF"
              v-if="slotProps.row.cat_deleted === false"
            ></i>
            <i class="el-icon-error" style="color:#409EFF" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.cat_level===0">一级</el-tag>
            <el-tag type="success" v-else-if="slotProps.row.cat_level===1">二级</el-tag>
            <el-tag type="danger" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="selectCateById(slotProps.row.cat_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delCate(slotProps.row.cat_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="paramsCate.pagenum"
      :page-sizes="[3, 5, 7, 9]"
      :page-size="paramsCate.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form ref="editCateRef" :model="cateInfoById" :rules="editCateRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cateInfoById.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateSure">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCatDialogVisible" width="50%" @close='addCateClose'>
      <el-form ref="addCateRef" :model="addCateInfo" label-width="80px" :rules="addCateRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateInfo.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类名称">
          <el-cascader
            v-model="cascaderValue"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateSumit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类数据参数
      paramsCate: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 商品分类数据列表
      getCateList: [],
      // 是否显示编辑对话框
      editDialogVisible: false,
      // 根据ID查询分类商品信息
      cateInfoById: {},
      // 编辑分类商品表单验证规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加分类对话框显示与否
      addCatDialogVisible: false,
      // 添加分类信息
      addCateInfo: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 级联选择器
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      cascaderValue: []
    }
  },
  created () {
    this.getCate()
  },
  methods: {
    // 获取商品分类数据
    async getCate () {
      const { data: res } = await this.axios
        .get('/categories', {
          params: this.paramsCate
        })
        .catch(err => err)
      if (res.meta.status !== 200) {
        return this.$message.console.error(res.meta.msg)
      }
      this.getCateList = res.data.result
      this.total = res.data.total
    },
    // 根据 id 查询分类
    async selectCateById (id) {
      this.editDialogVisible = true
      const { data: res } = await this.axios.get(`/categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateInfoById = res.data
    },
    // 确认编辑分类商品表单
    editCateSure (id) {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.axios.put(
          `/categories/${this.cateInfoById.cat_id}`,
          {
            cat_name: this.cateInfoById.cat_name
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editDialogVisible = false
        this.$message.success('更新成功')
        this.getCate()
      })
    },
    // 关闭编辑分类商品表单
    editDialogClose () {
      this.$refs.editCateRef.resetFields()
    },
    // 删除商品分类
    async delCate (id) {
      const res = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (res !== 'confirm') {
        return this.$message.info('该操作已取消')
      }
      const { data: result } = await this.axios.delete(`categories/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success('删除成功')
      this.getCate()
    },
    // 获取当前页面显示的商品条数
    handleSizeChange (newSize) {
      this.paramsCate.pagesize = newSize
      this.getCate()
    },
    // 获取当前的页码数
    handleCurrentChange (newPage) {
      this.paramsCate.pagenum = newPage
      this.getCate()
    },
    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.axios.get('/categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
    },
    // 级联选择器
    handleChange () {
      if (this.cascaderValue.length > 0) {
        this.addCateInfo.cat_pid = this.cascaderValue[this.cascaderValue.length - 1]
        this.addCateInfo.cat_level = this.cascaderValue.length
      } else {
        this.addCateInfo.cat_pid = 0
        this.addCateInfo.cat_level = 0
      }
    },
    // 关闭添加分类对话框
    addCateClose () {
      this.$refs.addCateRef.resetFields()
      this.cascaderValue = []
      this.addCateInfo.cat_pid = 0
      this.addCateInfo.cat_level = 0
    },
    // 添加分类按钮
    addCate () {
      this.getParentCateList()
      this.addCatDialogVisible = true
    },
    // 添加分类并确认
    addCateSumit () {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post(
          '/categories',
          this.addCateInfo
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加分类成功')
        this.addCatDialogVisible = false
      })
    }

  }
}
</script>
<style lang="less">
.cate{
  .el-cascader{
  width: 100%;
}
}
.el-scrollbar.el-cascader-menu{
  height: 200px;
}
</style>
