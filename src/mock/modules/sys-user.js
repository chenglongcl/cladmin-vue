import Mock from 'mockjs'

// 生成数据列表
const dataList = []
for (let i = 0; i < Math.floor(Math.random() * 10 + 1); i++) {
  dataList.push(
    Mock.mock({
      userId: '@increment',
      username: '@name',
      email: '@email',
      mobile: /^1[0-9]{10}$/,
      status: 1,
      roleIdList: null,
      createUserId: 1,
      createTime: 'datetime'
    })
  )
}

// 获取用户列表
export function list() {
  return {
    isOpen: false,
    url: '/v1/users/list',
    type: 'get',
    data: {
      msg: 'success',
      code: 0,
      page: {
        totalCount: dataList.length,
        pageSize: 10,
        totalPage: 1,
        currPage: 1,
        list: dataList
      }
    }
  }
}

// 获取用户信息
export function info() {
  return {
    isOpen: false,
    url: '/v1/users/personal',
    type: 'get',
    data: {
      msg: 'success',
      code: 0,
      user: dataList[0]
    }
  }
}

// 修改密码
export function updatePassword() {
  return {
    // isOpen: false,
    url: '/sys/user/password',
    type: 'post',
    data: {
      msg: 'success',
      code: 0
    }
  }
}

// 添加用户
export function add() {
  return {
    isOpen: false,
    url: '/v1/users/create',
    type: 'post',
    data: {
      msg: 'success',
      code: 0
    }
  }
}

// 修改用户
export function update() {
  return {
    isOpen: false,
    url: '/v1/users/update',
    type: 'post',
    data: {
      msg: 'success',
      code: 0
    }
  }
}

// 删除用户
export function del() {
  return {
    isOpen: false,
    url: '/v1/users/del',
    type: 'post',
    data: {
      msg: 'success',
      code: 0
    }
  }
}
