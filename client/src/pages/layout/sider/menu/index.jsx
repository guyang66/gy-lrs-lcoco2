import React, {useEffect} from "react";
import {Menu} from "antd";
import {Link, withRouter} from "react-router-dom";
import './index.styl'
import utils from '@utils'
import {inject, observer} from "mobx-react";

const {SubMenu} = Menu
const {getMenuIconByKey} = utils

const MenuMain = props => {

  const {menus} = props.appStore
  const {selectMenus, setSelectMenus} = props.settingStore
  const {location} = props

  const openMenu = ()=>{
    let r = location.pathname.split('/')
    if(!r || r.length < 1){
      return []
    }
    r = r.map(item=>{
      return `/${  item}`
    })
    const joinStr = (pre, cur) => {
      return `${  pre  }${cur}`
    }
    const target = []
    for(let i = 0; i <= r.length; i++){
      if(i > 1){
        target.push(r.slice(1, i).reduce(joinStr, ''))
      }
    }
    return target
  }

  useEffect(()=>{
    setSelectMenus([location.pathname])
  },[location.pathname])

  const handleMenuSelect = (event) => {
    setSelectMenus(event.key)
  };

  const getMenuNodes = (menuList) => {
    return menuList.reduce((pre, item) => {
      if (!item.children || item.length < 1) {
        pre.push(
          <Menu.Item key={item.path} icon={item.hasIcon ? getMenuIconByKey(item.iconKey) : null}>
            <Link to={item.path}>
              <span>{item.title}</span>
            </Link>
          </Menu.Item>
        )
      } else {
        pre.push(
          <SubMenu key={item.path} icon={item.hasIcon ? getMenuIconByKey(item.iconKey) : null} title={item.title}>
            {
              getMenuNodes(item.children)
            }
          </SubMenu>
        )
      }
      return pre
    },[])
  }

  return (
    <div>
      <Menu
        selectedKeys={selectMenus}
        defaultOpenKeys={openMenu}
        onSelect={handleMenuSelect}
        mode="inline"
        theme="dark"
      >
        {
          getMenuNodes(menus)
        }
      </Menu>
    </div>
  )
}

export default withRouter(inject('appStore', 'settingStore')(observer(MenuMain)))
