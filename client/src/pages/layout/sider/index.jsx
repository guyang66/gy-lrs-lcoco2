import React  from "react";
import {Layout} from "antd";
import {inject, observer} from "mobx-react";
import Menu from './menu';
import LogoView from './logo'

const {Sider} = Layout;

const LayoutSider = (props) => {

  const {menuCollapsed} = props.settingStore

  return (
    <Sider
      collapsible
      collapsed={menuCollapsed}
      trigger={null}
      style={{zIndex: "10"}}
    >
      <LogoView />
      <Menu />
    </Sider>
  )
}

export default inject('settingStore')(observer(LayoutSider))
