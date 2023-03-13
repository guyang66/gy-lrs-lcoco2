import React, {useEffect} from "react";
import {Layout} from "antd";

import {inject, observer} from "mobx-react";
import {Route, Switch, Redirect} from 'react-router-dom';
import FullLoading from '@components/loading'

import commonRoutes from "@router/common-routes";

import AuthRoute from "@components/auth-route";


const Main = (props) => {

  const {appStore} = props
  const {routeMap, loading} = props.appStore
  const {logoutDialog} = props.settingStore

  useEffect(()=>{
    // 获取配置信息和用户信息。
    appStore.getPageConfig()
  },[])

  return (
    <Layout style={{minHeight: "100vh", width:'100%', maxWidth:'500px', position: 'relative'}}>
      <Layout>
        {
          loading ? (<FullLoading />) : (
            <Switch>
              <Route exact path="/" key='index' render={()=><Redirect to='/index' />} />
              {/* 权限组件 */}
              {routeMap.map(
                (route) => <AuthRoute key={route.key} {...route} />
              )}

              {commonRoutes.map(
                ({path, key, component, ...route}) =>
                  <Route
                    key={key}
                    path={path}
                    {...route}
                    exact
                    render={(routeProps) => {
                      const Component = component;
                      return (
                        <Component {...routeProps} />
                      )
                    }}
                  />
              )}
              {
                // logoutDialog 说明token存在，只是服务端清空了登录信息
                logoutDialog ? null : <Redirect to='/404' />
              }
            </Switch>
          )
        }
      </Layout>
    </Layout>
  )
}
export default inject('appStore', 'settingStore')(observer(Main))
