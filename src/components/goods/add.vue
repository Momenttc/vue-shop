/* eslint-disable vue/no-parsing-error */
<template>
  <div class="add">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="添加商品" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabTableClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="(item,i) in manyTableData" :key="i" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item" v-for="(item,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="(item,i) in onlyTableData" :key="i" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://47.115.124.102:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="header"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class='btn' @click="add">添加内容</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 预览图片弹框 -->
      <el-dialog title="图片预览" :visible.sync="PicDialogVisible" width="50%">
        <img :src="picUrl" class="dialogImg">
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 富文本编辑器数据双向绑定对象
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品分类数据
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品参数数据(动态参数)
      manyTableData: [],
      // 商品属性数据(静态属性)
      onlyTableData: [],
      // 上传图片要手动增加一个Authorization
      header: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 是否预览图片
      PicDialogVisible: false,
      // 图片的路径
      picUrl: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.axios.get('/categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 当级联选择框选项发生变化时，就会触发这个函数
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 允许标签页切换的条件
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      } else {
        return true
      }
    },
    // 切换标签页
    async tabTableClick () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.axios.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.axios.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 上传图片中图片展示操作
    handlePreview (file) {
      this.PicDialogVisible = true
      this.picUrl = file.response.data.url
    },
    // 删除图片操作
    handleRemove (file) {
      // 先获取图片的tem_path
      const picTmpPath = file.response.data.tmp_path
      // 再获取图片再addForm.pics中的索引
      const i = this.addForm.pics.findIndex(item => item.tmp_path === picTmpPath)
      // 根据索引删除图片
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功
    uploadSuccess (response) {
      const picTmpPath = { tmp_path: response.data.tmp_path }
      this.addForm.pics.push(picTmpPath)
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写表单的必要项')
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 获取动态参数
        this.manyTableData.forEach(item => {
          const manyAttrs = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.addForm.attrs.push(manyAttrs)
        })
        // 获取静态属性
        this.onlyTableData.forEach(item => {
          const onlyAttrs = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(onlyAttrs)
        })
        form.attrs = this.addForm.attrs
        // 发起请求，添加商品
        const { data: res } = await this.axios.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加成功')
        this.$routergit.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        const value = this.addForm.goods_cat[2]
        return value
      }
      return null
    }
  }
}
</script>
<style lang="less">
.add {
  .el-steps {
    margin: 15px 0;
  }
  .el-step__title {
    font-size: 14px;
  }
  .el-checkbox.is-bordered.is-checked {
    margin: 0 10px 0 0;
  }
  .dialogImg{
    width: 100%;
  }
  .ql-editor.ql-blank{
    min-height: 300px;
  }
  .btn{
    margin-top: 15px;
  }
}
</style>
