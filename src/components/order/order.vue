<template>
  <div class="order">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索和按钮区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="orderList.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="slotProps">
            <el-tag type="danger" v-if="slotProps.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot="slotProps">{{slotProps.row.create_time|dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogVisible=!editDialogVisible"
            ></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderList.pagenum"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="orderList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="orderForm" :rules="orderFormRules" ref="orderFormRef" label-width="80px">
        <el-form-item label="省市区/县" prop="address1" label-width="85px">
          <el-cascader
            v-model="orderForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            style="width:100%"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="orderForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogSummit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流信息对话框 -->
    <el-dialog
      title="查看物流"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './city_data.js'
export default {
  data () {
    return {
      orderList: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 订单表格数据
      goodsList: [],
      editDialogVisible: false,
      orderForm: {
        address1: [],
        address2: ''
      },
      orderFormRules: {
        address1: [{ required: 'true', message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: 'true', message: '请输入详细地址', trigger: 'blur' }]
      },
      cityData,
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取商品订单列表
    async getOrderList () {
      const { data: res } = await this.axios.get('/orders', {
        params: this.orderList
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      console.log(this.goodsList)
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.orderList.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newNum) {
      this.orderList.pagenum = newNum
      this.getOrderList()
    },
    editDialogSummit () {
      this.editDialogVisible = false
    },
    editDialogClose () {
      this.$refs.orderFormRef.resetFields()
      this.orderForm.address1 = []
      this.orderForm.address2 = ''
    },
    async showProgress () {
      const { data: res } = await this.axios.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>
<style lang="less">
</style>
