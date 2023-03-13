import React, {useState, useEffect} from "react";
import "./index.styl";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";
import apiUser from '@api/user'
import apiRoom from '@api/room'
import apiGame from '@api/game'
import {Button, Modal, Input, Radio, message} from "antd";
const { confirm } = Modal;
import helper from '@helper'

const Index = (props) => {
  const {appStore, history} = props;
  const {user, logout} = appStore

  const [createUserModal, setCreateUserModal] = useState(false)
  const [newPlayer, setNewPlayer] = useState({})

  const [createRoomModal, setCreateRoomModal] = useState(false)
  const [newRoom, setNewRoom] = useState(null)

  const [joinRoomModal, setJoinRoomModal] = useState(false)
  const [joinRoomMode, setJoinRoomMode] = useState('join')
  const [roomKey, setRoomKey] = useState(null)

  const playerType = [
    {
      label: '房主',
      value: 'host',
    },
    {
      label: '普通玩家',
      value: 'player'
    }
  ]

  useEffect(()=>{
    // url首次访问监测一次是否在游戏中
    checkInGame()
  },[])

  const checkInGame = () => {
    let has = sessionStorage.getItem('prop-tag')
    if(has){
      return
    }
    const getTitleView = (data) => {
      return (
        <div className="FBV">
          <div className="color-orange" style={{fontSize: '16px'}}>
            系统检测到你在最近的一场游戏中
          </div>
          <div className="FBH mar-t5">
            <div>房间名字：</div>
            <div className="color-green">{data.roomName}</div>
          </div>
          <div className="FBH mar-t5">
            <div>房间密码：</div>
            <div className="color-green">{data.password}</div>
          </div>
          <div className="FBH mar-t5">
            <div>房间板子：</div>
            <div className="color-green">{data.modeName}</div>
          </div>
          <div className="mar-t5 color-red">
            是否立即进入该场游戏？
          </div>
        </div>
      )
    }
    apiGame.getRecentGame().then(data=>{
      if(data){
        confirm(
          {
            title: getTitleView(data),
            okText: '立即进入',
            cancelText: '取消',
            onOk() {
              history.push({pathname: '/room', state: {id: data.roomId}})
            }
          }
        )
      }
    })
    sessionStorage.setItem('prop-tag', 'ture')
  }

  const createUser = () => {
    if(!newPlayer.username || newPlayer.username === ''){
      message.warning('账号不能为空！')
      return
    }
    if(!newPlayer.name || newPlayer.name === ''){
      message.warning('昵称不能为空！')
      return
    }
    if(!newPlayer.password || newPlayer.password === ''){
      message.warning('密码不能为空！')
      return
    }
    if(!newPlayer.role || newPlayer.role === ''){
      message.warning('玩家类型不能为空！')
      return
    }
    apiUser.createUser(newPlayer).then(data=>{
      setNewPlayer({})
      setCreateUserModal(false)
      message.success('创建成功！')
    })
  }

  const createRoom = () => {
    if(!newRoom || newRoom === ''){
      message.warning('房间名字不能为空！')
      return
    }
    apiRoom.createRoom({roomName: newRoom}).then(data=>{
      message.success('创建房间成功！')
      setCreateRoomModal(false)
      setNewRoom(null)
      history.push({pathname: '/room', state: {id: data._id}})
    })
  }

  const joinRoom = () => {
    if(!roomKey || roomKey === ''){
      message.warning('房间密码不能为空！')
      return
    }
    if(joinRoomMode === 'ob'){
      obGame()
      return
    }
    apiRoom.joinRoom({key: roomKey}).then(data=>{
      message.success('加入房间成功！')
      setJoinRoomModal(false)
      setRoomKey(null)
      setJoinRoomMode(null)
      history.push({pathname: '/room', state: {id: data}})
    })
  }

  const obGame = () => {
    apiGame.obGame({key: roomKey}).then(data=>{
      message.success('加入房间成功！')
      setJoinRoomModal(false)
      setRoomKey(null)
      setJoinRoomMode(null)
      history.push({pathname: '/room', state: {id: data}})
    })
  }

  const logoutAction = () => {
    logout()
  }

  return (
    <div className="welcome-container">
      <div className="welcome-wrap FBV">
        <div className="FBH FBAC FBJC">
          <span className="welcome-title">欢迎你~</span>
          <span className="welcome-title welcome-user color-orange">{user.name}</span>
        </div>

        <div className="welcome-content">
          {
            helper.hasCPermission('system.admin', appStore) ? <Button
              className="btn-success mar-t10 mar-b10 create-user-btn"
              size="large"
              onClick={
                ()=>{
                  setNewPlayer({
                    username: '',
                    name: '玩家',
                    password: '1',
                    role:'player'
                  })
                  setCreateUserModal(true)
                }
              }
            >
              创建新玩家
            </Button> : null
          }
          {
            helper.hasCPermission('system.host', appStore) ? <Button
              className="btn-primary mar-t10 mar-b10 create-user-btn"
              size="large"
              onClick={
                ()=>{
                  setCreateRoomModal(true)
                }
              }
            >
              创建房间
            </Button> : null
          }
          <Button
            className="btn-primary mar-t10 mar-b10 create-user-btn"
            size="large"
            onClick={
              ()=>{
                setJoinRoomMode('join')
                setJoinRoomModal(true)
              }
            }
          >
            加入房间
          </Button>
          {
            helper.hasCPermission('system.admin', appStore) ? null : <Button
              className="btn-primary mar-t10 mar-b10 create-user-btn"
              size="large"
              onClick={
                ()=>{
                  setJoinRoomMode('ob')
                  setJoinRoomModal(true)
                }
              }
            >
              观战
            </Button>
          }
        </div>

        <div className="footer">
          <Button
            className="logout-btn btn-delete"
            size="large"
            onClick={
              ()=>{
                logoutAction()
              }
            }
          >
            退出登录
          </Button>
        </div>
      </div>

      <Modal
        title="新增玩家账号"
        centered
        className="modal-view-wrap"
        maskClosable={false}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={createUserModal}
        onOk={createUser}
        okText="保存"
        cancelText="取消"
        onCancel={() => {
          setCreateUserModal(false)
        }}
      >
        <div>
          <div className="item-cell FBH FBAC mar-b10">
            <div className="item-title">账号：</div>
            <Input
              className="item-cell-content"
              placeholder="请输入需要创建的账号名字"
              value={newPlayer.username}
              onChange={e =>{
                setNewPlayer({...newPlayer, username: e.target.value})
              }}
            />
          </div>
          <div className="item-cell FBH FBAC mar-b10">
            <div className="item-title">游戏昵称：</div>
            <Input
              className="item-cell-content"
              placeholder="请输入游戏昵称"
              value={newPlayer.name}
              onChange={e =>{
                setNewPlayer({...newPlayer, name: e.target.value})
              }}
            />
          </div>
          <div className="item-cell FBH FBAC mar-b10">
            <div className="item-title">密码：</div>
            <Input
              className="item-cell-content"
              placeholder="请输入账号密码"
              value={newPlayer.password}
              onChange={e =>{
                setNewPlayer({...newPlayer, password: e.target.value})
              }}
            />
          </div>
          <div className="item-cell FBH FBAC">
            <div className="item-title">玩家类型：</div>
            <Radio.Group
              className="item-cell-content"
              options={playerType}
              onChange={(e)=>{
                setNewPlayer({...newPlayer, role: e.target.value})
              }}
              value={newPlayer.role}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="创建房间"
        centered
        className="modal-view-wrap"
        maskClosable={false}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        width="300px"
        visible={createRoomModal}
        onOk={createRoom}
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setCreateRoomModal(false)
          setNewRoom(null)
        }}
      >
        <div>
          <div className="item-cell FBH FBAC mar-b10">
            <div className="item-title">房间名字：</div>
            <Input
              className="item-cell-content"
              placeholder="请输入房间名字"
              value={newRoom}
              onChange={e =>{
                setNewRoom(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="加入房间"
        centered
        className="modal-view-wrap"
        maskClosable={false}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={joinRoomModal}
        onOk={joinRoom}
        width="300px"
        okText="确认"
        cancelText="取消"
        onCancel={() => {
          setJoinRoomModal(false)
          setRoomKey(null)
        }}
      >
        <div>
          <div className="item-cell FBH FBAC mar-b10">
            <div className="item-title">房间密码：</div>
            <Input
              className="item-cell-content"
              placeholder="请输入房间密码"
              value={roomKey}
              onChange={e =>{
                setRoomKey(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>

    </div>
  )
}
export default withRouter(inject('appStore')(observer(Index)))

