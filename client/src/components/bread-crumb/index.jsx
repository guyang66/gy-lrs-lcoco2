import {withRouter} from "react-router-dom";
import {Breadcrumb} from "antd";
import "./index.styl"
import {inject, observer} from "mobx-react";

const getPath = (menuList, pathname) => {

  let target = []

  /**
   * 递归搜索当前面包屑路径
   * @param path
   */
  const getTargetNode = (list) => {
    for(let i = 0; i< list.length; i ++){
      const item = list[i]
      if(pathname.indexOf(item.path) > -1){
        target.push(item)
        if(item.children && item.children.length > 0){
          getTargetNode(item.children)
        }
      }
    }
  }
  getTargetNode(menuList)

  if(target[0] && target[0].path !== '/index'){
    target = [{
      key: 'index',
      path: '/index',
      title: '首页',
    }].concat(target)
  }
  return target
}
const BreadCrumb = (props) => {
  const {location, appStore} = props;
  const {pathname} = location;
  const path = getPath(appStore.menus, pathname);

  return (
    <div className="breadcrumb-container">
      <Breadcrumb>

        {path &&
        path.map((item) =>
          item.path === "/index" ? (
            <Breadcrumb.Item key={item.path}>
              <a href={`${item.path}`}>{item.title}</a>
            </Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={item.path}>{item.title}</Breadcrumb.Item>
          )
        )}

      </Breadcrumb>
    </div>
  )
}
export default withRouter(inject('appStore')(observer(BreadCrumb)))

