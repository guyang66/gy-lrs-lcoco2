import {observable, action} from 'mobx'

class SettingStore {
  @observable menuCollapsed = false
  @observable logoutDialog = false
  @observable selectMenus = ['/index']

  @action changeMenuCollapsed = ()=> {
    this.menuCollapsed = !this.menuCollapsed
  }

  @action setLogoutDialog = (value) =>{
    this.logoutDialog = value
  }

  @action setSelectMenus = (menu) => {
    this.selectMenus = menu
  }
}

export default new SettingStore()
