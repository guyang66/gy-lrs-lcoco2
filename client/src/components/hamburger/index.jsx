import React from "react";
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons'
import "./index.styl";
import {inject, observer} from "mobx-react";

const Hamburger = (props) => {

  const {changeMenuCollapsed, menuCollapsed} = props.settingStore

  return (
    <div className="hamburger-container">
      {
        menuCollapsed ? (
          <MenuUnfoldOutlined
            className="icon"
            onClick={changeMenuCollapsed}
          />
        ) : (
          <MenuFoldOutlined
            className="icon"
            onClick={changeMenuCollapsed}
          />
        )
      }
    </div>
  )
}
export default inject('settingStore')(observer(Hamburger))
