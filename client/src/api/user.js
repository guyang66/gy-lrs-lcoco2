import fetch from '@common/fetch'

const urlPrefix = '/api/user/'

const Api = {
  getUserInfo(params) {
    return fetch({
      url: urlPrefix + 'getUserInfo/auth',
      method: 'get',
      params,
    })
  },

  createUser (params) {
    return fetch({
      url: urlPrefix + 'create/auth',
      method: 'post',
      data: params,
    })
  },

}

export default Api
