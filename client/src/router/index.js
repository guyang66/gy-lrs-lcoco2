import React from "react";
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import Layout from '@pages/layout'
import publicPageRoutes from '@router/page-routes';
import {inject, observer} from "mobx-react";

const Router = props => {
  const {token} = props.appStore

  return (
    <BrowserRouter>
      <Switch>
        {/* 公共路由 */}
        {publicPageRoutes.map(
          ({path, key, component, ...route}) =>
            <Route
              key={key}
              path={path}
              {...route}
              render={(routeProps) => {
                const Component = component;
                return (
                  <Component {...routeProps} />
                )
              }}
            />
        )}
        {/* 权限路由 */}
        <Route
          render={()=>{
            if(!token){
              return <Redirect to="/login" />
            }
            return <Layout />
          }}
        />
      </Switch>
    </BrowserRouter>
  )
}

// 如果手component组件就直接有修饰器
export default inject('appStore')(observer(Router))
