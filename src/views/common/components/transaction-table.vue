<template>
  <el-table
    :data="list"
    style="
			width: 100%;
			padding-top: 15px;
			box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
		"
  >
    <el-table-column label="消息" min-width="200">
      <template slot-scope="scope">
        {{ scope.row.title }}
      </template>
    </el-table-column>
    <el-table-column label="时间" width="195" align="center">
      <template slot-scope="scope">
        {{ scope.row.createTime }}
      </template>
    </el-table-column>
    <el-table-column label="标签" width="100" align="center">
      <template slot-scope="{ row }">
        <el-tag type="success">
          {{ $getDictLabel("notice_type", row.tag) }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { getBulletinList } from '@/api/bulletin'
export default {
  data() {
    return {
      list: null
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      const { data } = await getBulletinList()
      if (data.code === 0 && data.data) {
        this.list = data.data.list
      }
    }
  }
}
</script>
