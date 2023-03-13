import React, {useState, useEffect} from "react";
import "./index.styl";
import Websocket from 'react-websocket';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";

import apiGame from '@api/game'
import apiRoom from '@api/room'

import {Button, Modal, message} from "antd";
import GameHeaderView from "@components/game/gameHeader";
import GameFooterView from "@components/game/gameFooter";
import GameReadyView from "@components/game/gameReady";
import GameContentView from "@components/game/gameContent";
import GameBtnView from "@components/game/gameButton";
import RecordView from "@components/game/gameRecord";

import vote from "@assets/images/role/skill/vote.svg"
import loser from "@assets/images/shibai.svg"

import constants from "@common/constants";
import utils from '@utils'
import cls from "classnames";

const { confirm, info } = Modal;
const { modalDescMap, roleCardMap, roleMap } = constants

const Index = (props) => {
  const {appStore, history} = props;
  const {user} = appStore

  let roomId =  history.location.state && history.location.state.id

  const [roomDetail, setRoomDetail] = useState({})
  const [seatInfo, setSeatInfo] = useState([])
  const [gameDetail, setGameDetail] = useState({})
  const [playerInfo, setPlayerInfo] = useState([])
  const [currentRole, setCurrentRole] = useState({})
  const [skillInfo, setSkillInfo] = useState([])
  const [actionInfo, setActionInfo] = useState([])

  const [errorPage, setErrorPage] = useState(null)

  const [recordModal, setRecordModal] = useState(false)
  const [gameRecord, setGameRecord] = useState([])

  const [currentAction, setCurrentAction] = useState('')
  const [actionModal, setActionModal] = useState(false)
  const [actionPlayer, setActionPlayer] = useState([])
  const [actionResult, setActionResult] = useState(null)

  const [socketOn,setSocketOn] = useState(true)
  const [roleCard, setRoleCard] = useState(null)
  const [winCard, setWinCard] = useState(null)

  const [timerTime, setTimerTime] = useState(null)

  const fetchMap = {
    'check': { api: apiGame.checkPlayer, role: 'predictor' },
    'assault': { api: apiGame.assaultPlayer, role: 'wolf' },
    'poison': { api: apiGame.poisonPlayer, role: 'witch' },
    'vote': { api: apiGame.votePlayer, role: null },
    'shoot': { api: apiGame.shootPlayer, role: 'hunter' },
    'boom': { api:  apiGame.boomPlayer, role: 'wolf' },
    'antidote': {api: apiGame.antidotePlayer, role: 'witch' },
    'defend': {api: apiGame.defendPlayer, role: 'guard' }
  }

  useEffect(()=>{
    if(roomId){
      getRoomDetail()
    } else {
      // 如果直接url进入的，就直接安排到最近的一场。
      getRentRoomInfo()
    }
  },[])

  const getRentRoomInfo = () => {
    apiRoom.getRecentRoom().then(data=>{
      if(data){
        roomId = data
        getRoomDetail()
      }
    })
  }

  const getRoomDetail = (isBegin) => {
    apiRoom.getRoomInfo({id: roomId}).then(data=>{
      setRoomDetail(data)
      if(data.status === 0){
        initSeat(data)
      } else if (data.status === 1) {
        initGame(data.gameId, data._id, isBegin)
      }
    }).catch(error=>{
      console.log('获取房间信息失败！',error)
      setErrorPage(error.errorMessage)
    })
  }

  const initGame = (gameId, roomId, isBegin) => {
    if(!gameId){
      console.log('initGame失败：gameId不存在')
      message.warn('游戏id不存在！')
      return
    }
    apiGame.getGameInfo({id: gameId, roomId: roomId}).then(data=>{
      setGameDetail(data)
      setCurrentRole(data.roleInfo || {})
      setPlayerInfo(data.playerInfo || [])
      setSkillInfo(data.skill || [])
      setActionInfo(data.action || [])
      if(isBegin){
        openRoleCard(data.roleInfo)
      }
    }).catch(error=>{
      console.log('发生了错误！',error)
      setErrorPage(error.errorMessage)
    })
  }

  const initSeat = (detail) => {
    if(!detail.seat){
      let p = []
      for(let i = 0; i < roomDetail.playerCount || 9; i++){
        p.push({
          index: i,
          key: i + 1,
          name: (i + 1) + '号',
          player: null
        })
      }
      setSeatInfo(p)
    } else {
      let p = []
      for(let i = 0; i < detail.seat.length; i++){
        let item = detail.seat[i]
        p.push({
          index: i,
          key: item.position,
          name: item.name,
          player: item.player ? item.player : null
        })
      }
      // 排序
      p.sort(function (a,b){
        return a.key - b.key
      })
      setSeatInfo(p)
    }
  }

  const initRecordList = (data) => {
    let tmp = []
    for(let key in data){
      tmp.push(data[key])
    }
    setGameRecord(tmp)
    setRecordModal(true)
  }

  const quitRoom = () => {
    if(!roomId){
      history.push({pathname: '/index'})
      return
    }
    setSocketOn(false)
    apiRoom.quitRoom({id: roomId, username: user.username}).then(()=>{
      history.push({pathname: '/index'})
    }).catch(()=>{
      setSocketOn(true)
    })
  }

  const lookRecord = () => {
    apiGame.gameRecord({roomId: gameDetail.roomId, gameId: gameDetail._id}).then(data=>{
      initRecordList(data)
    })
  }

  const useSkill = (key) => {
    setCurrentAction(key)
    if(key === 'antidote' || key === 'boom'){
      playerAction(null, key, true)
      return
    }
    if(key === 'check'){
      // 预言家查验, 计算查验数组
      let tmp = []
      playerInfo.forEach(item=>{
        let canCheck = true
        if(item.status === 0){
          // 死人不能查
          canCheck = false
        } else if (item.isSelf){
          // 不能查验自己
          canCheck = false
        } else if (item.camp !== null && item.camp !== undefined){
          // 知晓身份的也不用查
          canCheck = false
        }
        tmp.push({...item, check: canCheck, isTarget: false})
      })
      setActionPlayer(tmp)
      setActionModal(true)
      return
    }

    if(key === 'assault' || key === 'shoot' || key === 'poison' || key === 'vote' || key === 'defend'){
      // 预言家查验, 计算查验数组
      let tmp = []
      playerInfo.forEach(item=>{
        let canCheck = true
        if(item.status === 0){
          // 不能对死人发动技能
          canCheck = false
        }
        if(!item.isTarget){
          canCheck = false
        }
        tmp.push({...item, check: canCheck, isTarget: false})
      })
      setActionPlayer(tmp)
      setActionModal(true)
      return;
    }
    message.error('未识别的动作！')
  }

  const playerAction = (player, action, needConfirm) => {
    let params = {roomId: gameDetail.roomId, gameId: gameDetail._id}
    if(player){
      params.username = player.username
    }
    if(needConfirm){
      confirm(
        {
          title: modalDescMap[action] ? modalDescMap[action].confirm : '',
          okText: '确定',
          cancelText: '取消',
          onOk() {
            actionFetch(fetchMap[action] ? fetchMap[action].api : null, params, fetchMap[action] ? fetchMap[action].role : null)
          }
        }
      )
      return
    }
    actionFetch(fetchMap[action] ? fetchMap[action].api : null, params, fetchMap[action] ? fetchMap[action].role : null)
  }

  const actionFetch = (fetch, params, role) => {
    if(!fetch){
      message.error('未识别的动作！')
      return;
    }

    if(role && currentRole.role !== role){
      message.warn('你不是' + roleMap[role] + '，不能进行此操作！')
      return
    }
    fetch(params).then(data=>{
      message.success('操作成功！')
      actionFinish(data)
    })
  }

  const actionFinish= (data) => {
    setActionResult(data)
    let newCheckPlayer = JSON.parse(JSON.stringify(actionPlayer))
    let tmp = []
    newCheckPlayer.forEach(item=>{
      if(item.username === data.username){
        let obj = {...item, camp: data.camp, campName: data.campName, isTarget: true}
        tmp.push(obj)
      } else {
        tmp.push(item)
      }
    })
    setActionPlayer(tmp)
    // 刷新game
    initGame(gameDetail._id, gameDetail.roomId)
  }

  const openRoleCard = (roleInfo) => {
    let src = roleCardMap[currentRole.role]
    if(roleInfo){
      src = roleCardMap[roleInfo.role]
    }
    const config = {
      title: '您的身份是' + (gameDetail.isOb ? '观战者' : ''),
      icon: null,
      okText: '确认',
      content: (
        <div className="role-card-wrap FBV FBAC">
          <img className="card-img" src={src} />
        </div>
      )
    }
    let roleCardView = info(config)
    setRoleCard(roleCardView)
  }

  const clearGame = () => {
    setGameDetail({})
  }

  const resetRoomDetail = () => {
    if(socketOn){
      getRoomDetail()
    }
  }

  const showGameWinner = () => {
    apiGame.gameResult({id: gameDetail._id}).then(data=>{
      // 关闭所有的弹窗
      closeAllModel()
      showWinner(data)
    })
  }

  const stageChange = () => {
    setActionPlayer([])
    setCurrentAction('')
    setActionResult(null)
    closeAllModel()
    initGame(gameDetail._id, roomDetail._id)
  }

  const restartGame = () => {
    closeAllModel()
    setActionPlayer([])
    setCurrentAction('')
    setActionResult(null)
    setPlayerInfo([])
    setCurrentRole({})
    resetRoomDetail()
  }

  const handleTimerMsg = (msg) => {
    if(msg === null || msg === undefined || msg === ''){
      return
    }
    let msgData = JSON.parse(msg)
    if(msgData.time !== null ){
      setTimerTime(msgData.time)
    }
  }

  const showWinner = (data) => {
    const config = {
      okText: '确定',
      icon: null,
      title: (
        <div className="color-red winner-title FBH FBJC">
          <div className={cls({
            'color-red': data.winner === 0,
            'color-orange': data.winner === 1
          })}>{data.winnerString}</div>
          <div className="mar-l5 color-green">胜利!</div>
        </div>
      ),
      content: (
        <div className="winner-wrap">
          <div className="img-card-wrap FBV FBAC FBJC">
            <img src={roleCardMap[currentRole.role]} />
            {
              currentRole.camp === data.winner ? null : (
                <>
                  <div className="winner-mask" />
                  <div className="winner-mask-text-wrap FBV FBAC FBJC">
                    <img src={loser} />
                    <div className="txt mar-t10">很遗憾，你输了~</div>
                  </div>
                </>
              )
            }
          </div>
        </div>
      )
    }
    let winCardView = info(config)
    setWinCard(winCardView)
  }

  const wsMessage = (msg) => {
    switch (msg) {
      case 'refreshRoom':
        resetRoomDetail()
        break
      case 'refreshGame':
        initGame(gameDetail._id, roomDetail._id)
        break
      case 'gameStart':
        getRoomDetail(true)
        break
      case 'stageChange':
        stageChange()
        break
      case 'gameOver':
        showGameWinner()
        break
      case 'reStart':
        restartGame()
        break
      default:
        // 默认都是更新定时器计数
        handleTimerMsg(msg)
    }
  }

  const closeAllModel = () => {
    setActionModal(false)
    setRecordModal(false)
    if(winCard){
      winCard.destroy()
    }
    if(roleCard){
      roleCard.destroy()
    }
  }

  if(errorPage){
    return (
      <div className="error-view FBV FBAC">
        <div className="desc mar-b20 mar-t40">游戏已发生变化，请退出房间重新进入（{errorPage}）</div>
        <Button className="btn-primary" onClick={quitRoom}>
          返回首页
        </Button>
      </div>
    )
  }

  return (
    <div className="room-container">
      <div className="room-wrap FBV">

        {/*websocket*/}
        <Websocket url={'ws://' + utils.getWsUrl() + ':6103/lrs/' + roomId} onMessage={wsMessage} />

        {/*header*/}
        <GameHeaderView roomDetail={roomDetail} gameDetail={gameDetail} />

        {/*游戏准备*/}
        { roomDetail.status === 0 ? <GameReadyView seat={seatInfo} roomDetail={roomDetail} /> : null }

        {/*游戏进行*/}
        { roomDetail.status === 1 ? (
          <GameContentView
            gameDetail={gameDetail}
            currentRole={currentRole}
            skillInfo={skillInfo}
            openRoleCard={openRoleCard}
            timerTime={timerTime}
            actionInfo={actionInfo}
            playerInfo={playerInfo}
            useSkill={useSkill}
          />
        ) : null }

        {/*footer*/}
        <GameFooterView quitRoom={quitRoom} />

        {/*悬浮游戏按钮*/}
        <GameBtnView gameDetail={gameDetail} lookRecord={lookRecord} getRoomDetail={getRoomDetail} clearGame={clearGame} />
      </div>

      <Modal
        title="游戏事件记录"
        centered
        closable={false}
        className="modal-view-wrap game-record-modal"
        maskClosable={false}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={recordModal}
        footer={[
          <Button className="btn-primary" onClick={()=>{
            setGameRecord([])
            setRecordModal(false)
          }}>
            关闭
          </Button>
        ]}
      >
        <RecordView gameRecord={gameRecord} />
      </Modal>

      <Modal
        title={modalDescMap[currentAction] ? modalDescMap[currentAction].title : ''}
        centered
        closable={false}
        className="modal-view-wrap player-click-modal"
        maskClosable={false}
        maskStyle={{
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
        visible={actionModal}
        footer={[
          <Button className="btn-primary" onClick={()=>{
            setActionPlayer([])
            setActionModal(false)
            setActionResult(null)
            setCurrentAction('')
          }}>
            关闭
          </Button>
        ]}
      >
        <div className="content-wrap">
          <div className="content-view">
            {
              actionPlayer.map(item=>{
                return (
                  <div
                    className={cls({
                      'player-cell FBV FBAC FBJC': true,
                      'check-item': item.check && !item.isTarget,
                      'normal-item': !item.check && !item.isTarget,
                      'target-item': item.isTarget
                    })}
                    key={item.position}>
                    <div  className={cls({
                      'txt': true,
                      'check-text': item.check,
                      'normal-text': !item.check,
                      'mar-t20': !item.check || item.isTarget
                    })}>
                      {item.position + '号'}
                    </div>
                    <div className={cls({
                      'txt': true,
                      'check-text': item.check,
                      'normal-text': !item.check,
                      'color-red': item.isSelf
                    })}>
                      {item.name + (item.isSelf ? '(我)' : '')}
                    </div>
                    {
                      item.check && !item.isTarget ?
                        <Button size="small"
                                onClick={()=>{playerAction(item, currentAction, true)}}
                                className={modalDescMap[currentAction] ? modalDescMap[currentAction].className : ''}>
                          {modalDescMap[currentAction] ? modalDescMap[currentAction].buttonText : ''}
                        </Button> : null
                    }
                    {
                      item.roleName !== null && item.roleName !== undefined && item.roleName !== '' ? (
                        <div className={cls({
                          'camp-tag': true,
                          'bg-green': item.camp === 1,
                          'bg-red': item.camp !== 1
                        })}>
                          {item.roleName}
                        </div>
                      ) : null
                    }
                    {
                      item.camp !== null && item.camp !== undefined && currentAction === 'check' ? (
                        <div className={cls({
                          'camp-tag': true,
                          'bg-green': item.camp === 1,
                          'bg-red': item.camp !== 1
                        })}>
                          {item.camp === 1 ? '好人阵营' : '狼人阵营'}
                        </div>
                      ) : null
                    }
                    {
                      item.status === 0 ? (
                        <div className="dead-view">
                          <div className="dead-mask"></div>
                          <div className="dead-text">出局</div>
                        </div>
                      ) : null
                    }
                  </div>
                )
              })
            }
          </div>
          {
            actionResult ? (
              <div className="result-view mar-t10 mar-l20 mar-r20">
                <div className="tit">{modalDescMap[currentAction] ? modalDescMap[currentAction].resultTitle : ''}</div>
                <div className="content FBH FBAC FBJC">
                  <div>
                    {
                      currentAction === 'check' ?  (
                        <>
                          <span className="color-green bolder">{actionResult.position + '号玩家（' + actionResult.name + ')'}</span>
                          <span>的身份是：</span>
                          <span className={cls({
                            'bolder': true,
                            'color-green': actionResult.camp === 1,
                            'color-red': actionResult.camp !== 1
                          })}>{actionResult.campName}</span>
                        </>
                      ) : (
                        <>
                          <span>{modalDescMap[currentAction] ? modalDescMap[currentAction].resultDesc : ''}</span>
                          <span className="color-red bolder">{actionResult.position + '号玩家（' + actionResult.name + ')'}</span>
                        </>
                      )
                    }
                  </div>
                </div>
              </div>
            ) : null
          }
        </div>
      </Modal>

    </div>
  )
}
export default withRouter(inject('appStore')(observer(Index)))

