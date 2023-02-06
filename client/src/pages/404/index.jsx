import {inject, observer} from "mobx-react";
import "./index.styl"
import notFount from "@assets/images/error-page/404.png"
import {Button} from "antd";

const NotFount = () => {
  return (
    <div className="not-fount-container FBV FBAC">
      <img className="icon-img" src={notFount} alt="" />
      <a href="/">
        <Button className="back-btn mar-t20 mar-b40">返回首页</Button>
      </a>
    </div>
  )
}

export default inject('appStore')(observer(NotFount))
