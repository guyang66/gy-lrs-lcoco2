import React from "react";
import "./index.styl";
import {withRouter} from "react-router-dom";
import {inject, observer} from "mobx-react";
import helper from '@helper'
import apiGame from '@api/game'

import {message, Modal} from "antd";
const { confirm } = Modal;

const Btn = (props) => {
  const { appStore, gameDetail, lookRecord, getRoomDetail, clearGame } = props
  const nextStage = () => {
    confirm(
      {
        title: '确定进入下一阶段吗？',
        okText: '确定',
        cancelText: '取消',
        onOk() {
          apiGame.nextStage({roomId: gameDetail.roomId, gameId: gameDetail._id}).then(data=>{
            message.success('操作成功！')
          })
        }
      }
    )
  }
  const gameAgain = () => {
    confirm(
      {
        title: '确定要再开一局游戏吗？',
        okText: '确定',
        cancelText: '取消',
        onOk() {
          apiGame.gameAgain({roomId: gameDetail.roomId}).then(()=>{
            message.success('创建成功！')
            clearGame()
          })
        }
      }
    )
  }
  return (
    <>
      {
        gameDetail._id ? (
          <div
            onClick={()=>{lookRecord()}}
            className="btn-primary btn-record">
            {gameDetail.status === 2 ? '复盘' : '查看记录'}
          </div>
        ) : null
      }
      {
        <div
          onClick={()=>{getRoomDetail()}}
          className="btn-tag btn-refresh">
          刷新页面
        </div>
      }
      {
        helper.hasCPermission('system.host', appStore) && gameDetail._id? (
          <>
            {
              gameDetail.status === 1 ? (
                <div
                  onClick={()=>{nextStage()}}
                  className="btn-warning btn-next-stage">
                  下一阶段
                </div>
              ) : (
                <div
                  onClick={()=>{gameAgain()}}
                  className="btn-success btn-next-stage">
                  再来一局
                </div>
              )
            }
          </>
        ) : null
      }
    </>
  )
}

export default withRouter(inject('appStore')(observer(Btn)))
