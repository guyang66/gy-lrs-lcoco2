import Cookies from 'js-cookie'

const TokenKey = 'accessToken'

/**
 * token
 * @returns {*}
 */
const getToken = () => {
  return Cookies.get(TokenKey)
}

const setToken = (token) => {
  // cookie 30天 失效
  return Cookies.set(TokenKey, token, {expires: 30})
}

const removeToken = () => {
  return Cookies.remove(TokenKey)
}
/**
 * ui权限判断
 * @param key
 * @param appStore
 * @param reverse 为false为精确匹配。为true为弱匹配——表示permission列表中匹配不到该key，直接默认有权限。
 * @returns {boolean}
 */
const hasCPermission = (key, appStore, reverse) => {

  const {currentRole, cPermission} = appStore
  const targetPermission = cPermission.find(item=>{
    return item.key === key
  })

  if(!targetPermission){
    return !!reverse
  }
  const result = targetPermission.roles.find(item=>{
    return item === currentRole
  })
  return !!result
}

export default {
  getToken,
  removeToken,
  setToken,
  hasCPermission,
}
