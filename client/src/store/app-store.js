import {observable, action} from 'mobx'
import helper from '@helper'
import apiUser from '@api/user'
import apiConfig from '@api/config'

import privateRoutes from "@router/private-routes";

class AppStore {
  // 页面级loading
  @observable loading = true

  @observable token = helper.getToken()
  @observable user = {}
  @observable currentRole = null
  @observable routeMap = []

  @observable cPermission = []

  @action setLoading = (loading) => {
    this.loading = loading
  }

  @action setUser = (user) => {
    this.user = user
  }

  @action setCurrentRole = (role) => {
    this.currentRole = role
  }


  @action setRouteMap = (map)=>{
    this.routeMap = map
  }

  @action initToken = () => {
    this.token = helper.getToken()
  }

  @action setToken = (token) => {
    helper.setToken(token)
    this.initToken()
  }

  @action setCPermission = (p) => {
    this.cPermission = p
  }

  @action logout = () => {
    helper.removeToken()
    this.user = null
    this.token = null
  }

  @action getUserInfo = async () => {
    const r = await apiUser.getUserInfo()
    this.loading = false
    this.user = r
  }

  @action getRouteMap = async () => {
    const r = await apiConfig.getRoute()
    this.routeMap = r
  }

  @action getPageConfig = async () => {
    if(this.routeMap.length > 0){
      return
    }
    const p1 = apiConfig.getRoute()
    const p2 = apiUser.getUserInfo()
    const p3 = apiConfig.getUiPermission()
    const initRouteMap = (current) => {
      if(!current || current.length < 1){
        return []
      }
      const finalRoute = []
      current.forEach( route=> {
        const target = privateRoutes.find(value=>{
          return value.key === route.key
        })
        if(target){
          finalRoute.push({...target,...route})
        }
      })
      return finalRoute
    }

    Promise.all([p1,p2, p3,]).then((r)=>{
      // 拥有的权限路由
      this.routeMap = initRouteMap(r[0]) || []
      // 用户配置初始化
      this.user = r[1] || {}
      this.currentRole = r[1].defaultRole || ''
      // ui权限
      this.cPermission = r[2] || []
      this.loading = false
    }).catch(()=>{
      this.loading = false
    })
  }
}

export default new AppStore()
