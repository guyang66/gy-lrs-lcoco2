import axios from 'axios'
import helper from '@helper'
import {message, notification, Button} from 'antd'
import settingStore from "../store/setting-store";
const service = axios.create({
  baseURL: '', // api的base_url
  timeout: 15000, // 请求超时时间
  headers: {
    authorization: helper.getToken(),
  },
})

// 服务端返回格式
// {
//   success: true,
//   data: content,
//   errorCode: '',
//   errorMessage: ''
// }

service.interceptors.request.use(config=>{
  config.headers.authorization = helper.getToken()
  return config
},error =>{
  return Promise.reject(error)
})

service.interceptors.response.use(
  (response) => {
    /**
     * response.data.success是false抛错
     */
    if (response.data.success === false) {

      if(response.data.errorCode === 4005 || response.data.errorCode === '4005'){
        // 登录异常的处理
        const {logoutDialog , setLogoutDialog} = settingStore
        if(logoutDialog){
          // 因为一个页面可能有多个接口调用，如果有多个就会导致显示多个notification
          // 所以加一个tag，如果显示过未登录notification后就遇到同样的错误就不要显示了
          return;
        }
        // 用户未登录，或者服务端重启过，jwt key 已经重置过，身份已经失效。
        const key = `open${Date.now()}`;
        const btn = (
          <Button type="primary" size="small" onClick={() => notification.close(key)}>
            确定
          </Button>
        );
        setLogoutDialog(true)
        message.error('登录信息已失效，请重新登录!')
        notification.open({
          message: '温馨提示：',
          description:
            '登录信息已失效，请重新登录!',
          btn,
          key,
          duration: null,
          onClick: ()=>{
            setLogoutDialog(false)
            window.location.reload()
          },
          onClose: ()=>{
            setLogoutDialog(false)
            window.location.reload()
          },
        })
        helper.removeToken()
      }
      // 约定：需要特殊处理的就在config中加参数比如初始化fetch的时候加一个overHandle = true ，额外处理error
      if(!response.config.overHandle){
        message.error(response.data.errorMessage)
      }
      // eslint-disable-next-line consistent-return
      return Promise.reject(response.data.errorMessage)
    }
    // eslint-disable-next-line consistent-return
    return response.data.data
  },
  error => {
    console.log(error)
    message.error(error.message)
    return Promise.reject(error.message)
  }
)

export default service
