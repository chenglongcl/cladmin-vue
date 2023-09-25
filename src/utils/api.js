import httpRequest from '@/utils/httpRequest'

const api = {
  createUrl: (url = "") => {
    return httpRequest.adornUrl(url)
  },
  getAliyunOssSignature: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/oss/generatesignature'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  getAliyunAssumeRole: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/sts/assumeRole'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //user
  getPersonalUserInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/users/personal'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  putPersonalUserInfo: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/users/updatePersonal`),
    method: "put",
    data: httpRequest.adornData(data)
  })),
  getUserInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/users/get'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postOrPutUser: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/users/${data.userId ? "update" : "create"}`),
    method: `${data.userId ? "put" : "post"}`,
    data: httpRequest.adornData(data)
  })),
  postDelUser: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/users/delete'),
    method: 'post',
    data: httpRequest.adornData(data)
  })),
  postLogoutLoginUser: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/users/logoutLogin'),
    method: 'post',
    data: httpRequest.adornData(data)
  })),
  getUserList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/users/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //menu
  getMenuNav: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/menus/nav'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  getMenuSelect: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/menus/select'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  getMenuInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/menus/get'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postOrPutMenu: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/menus/${data.menuId ? "update" : "create"}`),
    method: `${data.menuId ? "put" : "post"}`,
    data: httpRequest.adornData(data)
  })),
  deleteMenu: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/menus/delete'),
    method: 'delete',
    params: httpRequest.adornParams(params)
  }),
  getMenuList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/menus/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //role
  getRoleSelect: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/roles/select'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  getRoleInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/roles/get'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postOrPutRole: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/roles/${data.roleId ? "update" : "create"}`),
    method: `${data.roleId ? "put" : "post"}`,
    data: httpRequest.adornData(data)
  })),
  postDelRole: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/roles/delete'),
    method: 'post',
    data: httpRequest.adornData(data)
  })),
  getRoleList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/roles/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //category
  getCategoryInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/categories/get'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postOrPutCategory: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/categories/${data.categoryId ? "update" : "create"}`),
    method: `${data.categoryId ? "put" : "post"}`,
    data: httpRequest.adornData(data)
  })),
  deleteCategory: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/categories/delete'),
    method: 'delete',
    params: httpRequest.adornParams(params)
  }),
  getCategoryList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/categories/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //oss
  postUploadFileToOSS: ((url, data = {}, progressCallback) => httpRequest({
    headers: {
      "Content-Type": "multipart/form-data; boundary={boundary}"
    },
    url: url,
    method: 'post',
    data: data,
    onUploadProgress(progressEvent) {
      let complete = (progressEvent.loaded / progressEvent.total * 100 | 0)
      progressCallback(complete)
    }
  })),
  postUploadFileToLocal: ((url, data = {}, progressCallback) => httpRequest({
    headers: {
      "Content-Type": "multipart/form-data; boundary={boundary}"
    },
    url: url,
    method: 'post',
    data: data,
    onUploadProgress(progressEvent) {
      let complete = (progressEvent.loaded / progressEvent.total * 100 | 0)
      progressCallback(complete)
    }
  })),
  getOssList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/sys/oss/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //article
  getArticleList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/articles/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  getArticleInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/articles/get'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postOrPutArticle: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/articles/${data.articleId ? "update" : "create"}`),
    method: `${data.articleId ? "put" : "post"}`,
    data: httpRequest.adornData(data)
  })),
  postDelArticle: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/articles/delete'),
    method: 'post',
    data: httpRequest.adornData(data)
  })),
  //config
  getConfigInfo: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/config/get'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postOrPutConfig: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl(`/v1/config/create`),
    method: 'post',
    data: httpRequest.adornData(data)
  })),
  //login
  getRefreshToken: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/refresh'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  postLogin: ((data = {}) => httpRequest({
    url: httpRequest.adornUrl('/login'),
    method: 'post',
    data: httpRequest.adornData(data)
  })),
  getLogout: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/logout'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
  //bulletin
  getPublicNoticeList: (params = {}) => httpRequest({
    url: httpRequest.adornUrl('/v1/bulletin/list'),
    method: 'get',
    params: httpRequest.adornParams(params)
  }),
}

// export default api
export default { //作为组件库(install)
  install: function (Vue, name = "$http") { //自定义名字(vue-resource也使用$http)
    Object.defineProperty(Vue.prototype, name, {
      value: api
    }); //将组件库挂载在原型对象上
    Vue.http = api;
  }
}
