import React from "react";
import {inject, observer} from "mobx-react";
import {Route, Redirect} from "react-router-dom";

const AuthRoute = (props) => {
  const {backUrl, path, key, component,appStore, roles, ...otherProps} = props
  const {user, currentRole} = appStore

  // 管理员跳过权限校验, 超级管理员和普通管理员的权限由url权限和UI权限来区分。
  if(currentRole === 'superAdmin' || currentRole === 'admin'){
    return (
      <Route
        key={key}
        path={path}
        {...otherProps}
        exact
        render={(routeProps) => {
          const Component = component;
          return (
            <Component {...routeProps} />
          )
        }}
      />
    )
  }

  if(user && roles.indexOf(currentRole) > -1) {
    return (
      <Route
        key={key}
        path={path}
        {...otherProps}
        exact
        render={(routeProps) => {
          const Component = component;
          return (
            <Component {...routeProps} />
          )
        }}
      />
    )
  }
  return backUrl ? <Redirect to={backUrl} /> : <Redirect to="/403" />
}
export default inject('appStore')(observer(AuthRoute))

