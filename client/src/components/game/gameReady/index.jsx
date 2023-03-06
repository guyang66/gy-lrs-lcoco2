import React,  {useState, useEffect}  from "react";
import "./index.styl";

import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";

import apiRoom from '@api/room'
import apiGame from '@api/game'

import cls from "classnames";
import helper from '@helper'

import {Button, Input, message, Modal, Radio, Space} from "antd";
import {PlusCircleOutlined, MinusCircleOutlined} from '@ant-design/icons';

const Ready = (props) => {
  const { appStore, seat, roomDetail } = props
  const { user } = appStore

  const [modifyModal, setModifyModal] = useState(false)
  const [newName, setNewName] = useState(null)

  const [settingModal, setSettingModal]= useState(false)
  const [modeModal, setModeModal] = useState(false)
  const [modeList, setModeList] = useState([])
  const [currentMode, setCurrentMode] = useState('')

  const [gameSettingList, setGameSettingList] = useState([])
  const [gameConfigOptions, setGameConfigOptions] = useState(null)
  const [gameSetting, setGameSetting] = useState({})

  const [kick, setKick] = useState(false)

  useEffect(()=>{
    setCurrentMode(roomDetail.mode)
  },[])

  const modifyName = () => {
    if(!newName || newName === ''){
      message.warn('新昵称不能为空！')
      return
    }
    apiRoom.modifyNameInRoom({id: user._id, roomId: roomDetail._id, name: newName}).then(data=>{
      message.success('修改成功！')
      setModifyModal(false)
      setNewName(null)
    })
  }

  const seatIn = (index) => {
    apiRoom.seatIn({id: roomDetail._id, position: index}).then(data=>{
      message.success('入座成功！')
    })
  }

  const kickPlayer = (item) => {
    if(!item.player){
      message.warn('该位置没有坐人，请重新操作！')
      return
    }
    if(item.player.username === user.username){
      message.warn('你不能踢自己！')
      return
    }

    apiRoom.kickPlayer({id: roomDetail._id, position: item.key}).then(data=>{
      message.success('踢人成功！')
      setKick(false)
    })
  }

  const startGame = () => {
    apiGame.startGame({id: roomDetail._id, setting: gameSetting}).then(data=>{
      message.success('新游戏开始！')
    })
  }

  const chooseMode = () => {
    apiRoom.getRoomMode().then(data=>{
      setModeList(data)
      setCurrentMode(roomDetail.mode)
      setModeModal(true)
    })
  }

  const onModeChange = (e) => {
    setCurrentMode(e.target.value)
  }

  const confirmMode = () => {
    apiRoom.changeRoomMode({id: roomDetail._id, mode: currentMode}).then(data=>{
      setModeModal(false)
      message.success('修改成功！')
    })
  }

  const gameSettings = () => {
    apiGame.getGameSettings({mode: currentMode}).then(data=>{
      setGameSetting(data.config)
      setGameConfigOptions(data.options)
      setGameSettingList(data.settings)
      setSettingModal(true)
    })
  }

  const changeSettings = (key, type, value) => {
    let oldValue = gameSetting[key]
    let newValue
    switch (type) {
      case 'minus' :
        newValue = (oldValue - 15 < 15 ? 15 : oldValue - 15)
        break
      case 'add' :
        newValue = oldValue + 15
        break
      case 'radio-click' :
        newValue = value
    }
    let target = {}
    target[key] = newValue
    setGameSetting({...gameSetting, ...target})
  }

  const renderCounterView = (item) => {
    return (
      <div className="setting-cell FBH FBAC mar-b10" key={item.key}>
        <div className="item-title">{item.title}</div>
        <div className="FBH FBAC FBJC">
          <MinusCircleOutlined className="icon-font mar-r20" onClick={()=>{changeSettings(item.key, 'minus')}} />
          <div className="fake-input">{gameSetting[item.key]}</div>
        </div>
        <PlusCircleOutlined className="icon-font mar-l20" onClick={()=>{changeSettings(item.key, 'add')}} />
      </div>
    )
  }

  const renderRadioView = (item) => {
    const opt = gameConfigOptions? gameConfigOptions[item.key] : []
    opt.forEach(item=>{
      item.label = item.name
    })
    return (
      <div className="setting-cell FBH FBAC mar-b10" key={item.key}>
        <div className="item-title">{item.title}</div>
        <Radio.Group
          options={opt}
          onChange={(e)=>{changeSettings(item.key,'radio-click', e.target.value)}}
          value={gameSetting[item.key]}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
    )
  }

  return (
    <div className="room-content-wrap">
      <div className="normal-title">桌/座位（点击空座位即可入座）：</div>
      <div className="desk-view-wrap mar-t5">
        {
          seat.map(item=>{
            return (
              <div key={item.key} className="seat-cell mar-5 FBH FBAC FBJC">
                {
                  kick ? (
                    <div className="FBH FBAC FBJC" onClick={()=>{kickPlayer(item)}}>
                      <div className={cls({
                        'seat-in': item.player,
                        'empty-seat': !item.player
                      })}>
                        {item.name }
                      </div>
                      {
                        item.player ? <div className="cell-text seat-status mar-l5">
                          <Button className="color-red kick-btn">踢人</Button>
                        </div> : <div className="cell-text seat-status mar-l5">{' '}</div>
                      }
                    </div>
                  ) : (
                    <div className="FBH FBAC FBJC" onClick={()=>{seatIn(item.key)}} style={{cursor: 'pointer'}}>
                      <div className={cls({
                        'seat-in': item.player,
                        'empty-seat': !item.player
                      })}>
                        {item.name}
                      </div>
                      {
                        item.player ? <div className={cls({
                          'cell-text color-success seat-status mar-l5': true,
                          'color-blue': item.player.isSelf
                        })}>
                          {item.player.name}
                        </div> : <div className="cell-text color-red seat-status mar-l5">空缺</div>
                      }
                    </div>
                  )
                }
              </div>
            )
          })
        }
      </div>
      <div className="normal-title mar-t10">等待区（尚未入座的玩家）：</div>
      <div className="wait-content mar-t5 FBH">
        {
          (roomDetail.waitPlayer || []).map(item=>{
            return <div className="wait-cell mar-10" key={'wait-cell' + item}>{item.name}</div>
          })
        }
      </div>
      {
        helper.hasCPermission('system.host', appStore) ? <Button
          size="large"
          className={cls({
            'btn-primary': roomDetail.seatStatus,
            'btn-info': !roomDetail.seatStatus,
            'mar-t10 full-btn': true,
          })}
          disabled={!roomDetail.seatStatus}
          onClick={
            ()=>{
              startGame()
            }
          }
        >
          开始游戏
        </Button> : null
      }
      {
        helper.hasCPermission('system.host', appStore) ? <Button
          size="large"
          className={cls({
            'mar-t10 full-btn btn-folk': true,
          })}
          onClick={
            ()=>{
              chooseMode()
            }
          }
        >
          游戏板子
        </Button> : null
      }
      {
        helper.hasCPermission('system.host', appStore) ? <Button
          size="large"
          className={cls({
            'btn-success': roomDetail.seatStatus,
            'mar-t10 full-btn': true,
          })}
          onClick={
            ()=>{
              gameSettings()
            }
          }
        >
          游戏设置
        </Button> : null
      }
      {
        helper.hasCPermission('system.host', appStore) ? <Button
          className={cls({
            'btn-danger': !kick,
            'btn-info': kick,
            'mar-t10 full-btn': true,
          })}
          size="large"
          onClick={
            ()=>{
              setKick(!kick)
            }
          }
        >
          {kick ? '取消踢人' : '踢人'}
        </Button> : null
      }
      <Button
        className="btn-warning mar-t10 full-btn"
        size="large"
        onClick={
          ()=>{
            setNewName('')
            setModifyModal(true)
          }
        }
      >
        修改昵称
      </Button>

      <div style={{width: '100%', height: '100px'}}/>

      <Modal
        title="修改昵称"
        centered
        className="modal-view-wrap"
        maskClosable={false}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={modifyModal}
        onOk={modifyName}
        okText="确认"
        cancelText="取消"
        onCancel={() => {
          setModifyModal(false)
          setNewName(null)
        }}
      >
        <div>
          <div className="item-cell FBH FBAC mar-b10">
            <div className="item-title">新昵称：</div>
            <Input
              className="item-cell-content"
              placeholder="请输入新昵称"
              value={newName}
              onChange={e =>{
                setNewName(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div className="setting-modal-title color-green">
            游戏设置
          </div>
        }
        centered
        className="modal-view-wrap"
        maskClosable={false}
        closable={false}
        width={500}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={settingModal}
        footer={[
          <Button className="btn-primary" onClick={()=>{
            setSettingModal(false)
          }}>
            确定
          </Button>
        ]}
      >
        <div className="settings">
          {
            gameSettingList.map(item=>{
              switch (item.type) {
                case 'counter':
                  return renderCounterView(item);
                case 'radio':
                  return renderRadioView(item)
                default:
                  return null
              }
            })
          }
        </div>
      </Modal>

      <Modal
        title={
          <div className="setting-modal-title">
            选择游戏板子
          </div>
        }
        centered
        className="modal-view-wrap"
        maskClosable={false}
        closable={false}
        width={500}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={modeModal}
        onOk={()=>{
          confirmMode()
        }}
        okText="确定"
        cancelText="取消"
        onCancel={()=>{
          setModeModal(false)
        }}
      >
        <div className="mode-content">
          <Radio.Group value={currentMode} onChange={onModeChange}>
            <Space direction="vertical">
              {
                modeList.map(item=>{
                  return <Radio value={item.key} key={item.key}>{item.name}</Radio>
                })
              }
            </Space>
          </Radio.Group>
        </div>
      </Modal>

    </div>
  )
}
export default withRouter(inject('appStore')(observer(Ready)))
