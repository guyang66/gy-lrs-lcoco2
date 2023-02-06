import React from "react";
import "./index.styl";
import helper from '@helper'
import apiGame from '@api/game'

import {Button, message, Modal} from "antd";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";
const { confirm } = Modal;

const Head = (props) => {
  const { appStore, roomDetail, gameDetail } = props
  const gameDestroy = () => {
    confirm(
      {
        title: '确定要结束游戏吗？',
        okText: '确定',
        cancelText: '取消',
        onOk() {
          apiGame.gameDestroy({roomId: gameDetail.roomId, gameId: gameDetail._id}).then(data=>{
            message.success('操作成功')
          })
        }
      }
    )
  }
  return (
    <div className="game-header-wrap">
      <div className="FBH FBAC FBJC">
        <span className="room-title">房间名：</span>
        <span className="room-title welcome-user color-orange">{roomDetail.name}（{roomDetail.password}）</span>
      </div>
      {
        helper.hasCPermission('system.host', appStore) && gameDetail.status === 1 ? (
          <Button
            onClick={gameDestroy}
            className="btn-danger game-over">
            结束游戏
          </Button>
        ) : null
      }
    </div>
  )
}

export default withRouter(inject('appStore')(observer(Head)))
