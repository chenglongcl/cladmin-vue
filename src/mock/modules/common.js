import Mock from 'mockjs'

// 生成数据列表
const dataList = []
for (let i = 0; i < 8; i++) {
  dataList.push(
    Mock.mock({
      title: '@ctitle(5, 16)',
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
      tag: '公告'
    })
  )
}

// 登录
export function login() {
  return {
    isOpen: false,
    url: '/login',
    type: 'post',
    data: {
      msg: 'success',
      code: 0,
      expire: Mock.Random.natural(60 * 60 * 1, 60 * 60 * 12),
      token: Mock.Random.string('abcdefghijklmnopqrstuvwxyz0123456789', 32)
    }
  }
}

// 退出
export function logout() {
  return {
    isOpen: false,
    url: '/logout',
    type: 'post',
    data: {
      msg: 'success',
      code: 0
    }
  }
}

export function transactionTableList() {
  return {
    isOpen: false,
    url: '/v1/temp/transactionTableList',
    type: 'get',
    data: {
      msg: 'success',
      code: 0,
      data: dataList
    }
  }
}
