import {inject, observer} from "mobx-react";
import "./index.styl"
import accessDeny from "@assets/images/error-page/403.png"
import {Button} from "antd";

const AccessDeny = () => {
  return (
    <div className="access-deny-container FBV FBAC">
      <img className="icon-img" src={accessDeny} alt="" />
      <a href="/">
        <Button className="back-btn mar-t20 mar-b40">返回首页</Button>
      </a>
    </div>
  )
}

export default inject('appStore')(observer(AccessDeny))
