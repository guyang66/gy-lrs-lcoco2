import React from "react";
import logo from "@assets/images/logo-white-m.svg";
import logoSmall from "@assets/images/logo-white-s.svg";

import "./index.styl";
import {inject, observer} from "mobx-react";

const Logo = (props) => {

  const {menuCollapsed} = props.settingStore

  return (
    <div className="sidebar-logo-container">
      {
        menuCollapsed ? (
          <img src={logoSmall} className="sidebar-logo-small" alt="logo" />
        ) : (
          <img src={logo} className="sidebar-logo" alt="logo" />
        )
      }
    </div>
  );
};

export default inject('settingStore')(observer(Logo))
