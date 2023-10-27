<template>
  <div class="mod-home">
    <panel-group />
    <el-row :gutter="8">
      <el-col :xs="{ span: 24 }" :sm="{ span: 24 }" :md="{ span: 24 }" :lg="{ span: 18 }" :xl="{ span: 18 }" style="padding-right: 8px; margin-bottom: 30px">
        <transaction-table />
      </el-col>
      <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }" style="margin-bottom: 30px">
        <box-card />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/panel-group'
import TransactionTable from './components/transaction-table'
import BoxCard from './components/box-card'

export default {
  components: { PanelGroup, TransactionTable, BoxCard }
}
</script>
<style lang="scss"></style>
