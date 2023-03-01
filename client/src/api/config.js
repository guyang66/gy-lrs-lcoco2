import fetch from '@common/fetch'
const urlPrefix = '/api/'
export default {

  getRoute(params) {
    return fetch({
      url: urlPrefix + 'route/auth',
      method: 'get',
      params,
    })
  },

  getUiPermission(params) {
    return fetch({
      url: urlPrefix + 'permission/ui/auth',
      method: 'get',
      params,
    })
  },
}
