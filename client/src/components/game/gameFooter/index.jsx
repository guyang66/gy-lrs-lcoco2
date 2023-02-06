import React from "react";
import "./index.styl";
import {Button} from "antd";

const Footer = (props) => {
  const { quitRoom } = props
  return (
    <div className="footer-wrap">
      <Button
        className="logout-btn btn-delete"
        size="large"
        onClick={
          ()=>{
            quitRoom()
          }
        }
      >
        退出房间
      </Button>
    </div>
  )
}

export default Footer
