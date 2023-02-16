const BaseClass = require('../base/BaseClass')
class roomController extends BaseClass {
  /**
   * 创建房间
   * @returns {Promise<void>}
   */
  async createRoom () {
    const { service, ctx, app } = this
    const { $helper, $model, $enums } = app
    const { room } = $model
    const { roomName } = ctx.query
    if(!roomName || roomName === ''){
      ctx.body = $helper.Result.fail(-1,'房间名字不能为空！')
      return
    }
    let currentUser = await service.baseService.userInfo()
    let password = $helper.getRandomCode()
    let obj = {
      name: roomName,
      status: $enums.ROOM_STATUS.READY,
      password: password,
      owner: currentUser.username,
      wait: [currentUser.username] // 创建房间后，房主自动加入等待区
    }
    let r = await service.baseService.save(room, obj)
    if(r){
      ctx.body = $helper.Result.success(r)
    } else {
      ctx.body = $helper.Result.fail(-1, '创建房间失败！')
    }
  }

  /**
   * 获取房间信息
   * @returns {Promise<void>}
   */
  async getRoomInfo () {
    const { service, ctx, app } = this
    const { $helper, $model, $support, $constants } = app
    const { room, user } = $model
    const { id } = ctx.query
    if(!id || id === ''){
      ctx.body = $helper.Result.fail(-1,'房间id不能为空！')
      return
    }
    let roomInstance = await service.baseService.queryById(room, id)
    if(!roomInstance){
      ctx.body = $helper.Result.fail(-1, '房间不存在！')
      return
    }
    let currentUser = await service.baseService.userInfo()
    let username = currentUser.username

    let isOb = $support.isOb(roomInstance, currentUser.username)
    let waitPlayer = roomInstance.wait

    // 判断当前用户是否已经入座
    let isSeat = await service.roomService.findInSeatPlayer(id, username)
    if(!isOb && !isSeat.result){
      // 如果不在座位上，则查询是否在等待区
      let exist = waitPlayer.find(p=>{
        return p === username
      })
      if(!exist){
        // 不在座位上，也不在等待区，可能是通过url直接访问的，
        ctx.body = $helper.Result.fail(-1, '你不在该房间内，请先返回首页，重新加入房间！')
        return
      }
    }

    let waitPlayerArray = []
    for(let i = 0; i < roomInstance.wait.length; i++){
      let item = roomInstance.wait[i]
      let player = await service.baseService.queryOne(user, {username: item})
      if(player){
        waitPlayerArray.push({
          username: player.username,
          name: player.name
        })
      }
    }

    let r = await service.roomService.getRoomSeatPlayer(id)
    if(!r.result){
      ctx.body = $helper.Result.fail(r.errorCode, r.errorMessage)
      return
    }
    let seatInfo = r.data
    let seatStatus = 1
    seatInfo.forEach(item=>{
      if(!item.player){
        seatStatus = 0 // 座位未坐满人
      }
    })

    let info = {
      waitPlayer: waitPlayerArray,
      wait: roomInstance.wait,
      _id: roomInstance._id,
      name: roomInstance.name,
      password: roomInstance.password,
      status: roomInstance.status, // 游戏状态
      seat: seatInfo, // 座位信息
      seatStatus: seatStatus, // 是否已做满  0：未坐满（不能开始游戏）1：已坐满（可开始游戏）
      seatStatusString: seatStatus === 0 ? '未坐满' : '已坐满',
      gameId: roomInstance.gameId,
      mode: roomInstance.mode,
      modeName: $constants.MODE[roomInstance.mode] ? $constants.MODE[roomInstance.mode].name : '未知板子',
      playerCount: roomInstance.count
    }
    ctx.body = $helper.Result.success(info)
  }

  /**
   * 加入房间
   * @returns {Promise<void>}
   */
  async joinRoom () {
    const { service, ctx, app } = this
    const { $helper, $model, $ws, $enums } = app
    const { room} = $model
    const { key } = ctx.query
    if(!key || key === ''){
      ctx.body = $helper.Result.fail(-1,'房间密码不能为空！')
      return
    }
    // 人少的话可以查询最近的一条带密码的记录即可，在线人多（小项目暂不考虑这个情况，并发不会高的），密码可能会重复，所以需要在大厅加入一个房间列表，以及定时器每天清理超时房间（因为服务器是无状态的，无法获知用户的上下线状态）
    let roomInstance = await service.baseService.queryOne(room,{password: key}, {} ,{sort: { createTime: -1 }})
    if(!roomInstance){
      ctx.body = $helper.Result.fail(-1,'房间不存在或密码不对！')
      return
    }
    let currentUser = await service.baseService.userInfo()
    let username = currentUser.username

    // 查看当前用户是否在座位上
    let isSeat = await service.roomService.findInSeatPlayer(roomInstance._id, username)
    if(isSeat.result) {
      // 在座位上且游戏在进行中，则回复游戏状态即可。
      ctx.body = $helper.Result.success(roomInstance._id)
      return
    }

    let waitPlayer = roomInstance.wait
    let exist = waitPlayer.find(p=>{
      return p === username
    })
    if(!exist){
      let newWait = [...waitPlayer]
      newWait.push(currentUser.username)
      await service.baseService.updateById(room, roomInstance._id, {wait: newWait})
    }

    if(roomInstance.status === $enums.ROOM_STATUS.GOING){
      // 正在游戏中
      let string = '游戏已开始，请尝试进入观战模式！'
      ctx.body = $helper.Result.fail(-1, string)
      return
    }

    $ws.connections.forEach(function (conn) {
      // 前端刷新房间状态
      let url = '/lrs/' + roomInstance._id
      if(conn.path === url){
        conn.sendText('refreshRoom')
      }
    })

    ctx.body = $helper.Result.success(roomInstance._id)
  }

  /**
   * 退出房间
   * @returns {Promise<void>}
   */
  async quitRoom () {
    const { ctx, service, app } = this
    const { $helper, $model, $ws, $enums, $constants } = app
    const { room } = $model
    const { id, username } = ctx.query
    if(!id || id === ''){
      ctx.body = $helper.Result.fail(-1,'roomId不能为空！')
      return
    }
    if(!username || username === ''){
      ctx.body = $helper.Result.fail(-1,'username不能为空！')
      return
    }
    let currentUser = await service.baseService.userInfo()
    console.log(currentUser.username, username)
    if(currentUser.username !== username){
      ctx.body = $helper.Result.fail(-1,'你不能操作别人账号退出房间！')
      return
    }

    let roomInstance = await service.baseService.queryById(room, id)
    if(roomInstance.status !== $enums.ROOM_STATUS.READY){
      // 游戏中或游戏结束，则可以随意退出，下次进来还是在游戏中
      ctx.body = $helper.Result.success(-1, '退出房间成功！')
      return
    }
    // 清除座位上的人
    const seatUpdate = (key) => {
      if(roomInstance[key] === username){
        // 需要被更新
        let obj = {}
        obj[key] = null
        return obj
      }
      return false
    }
    let seatCount = roomInstance.count
    for(let i = 0; i < seatCount ;i ++){
      let t = seatUpdate('v' + (i + 1))
      if(t){
        await service.baseService.updateById(room, roomInstance._id, t)
      }
    }

    // 清空等待区的人
    let waitPlayer = roomInstance.wait
    let newWaitPlayer = []
    for(let i = 0; i < waitPlayer.length; i++){
      if(waitPlayer[i] !== username){
        newWaitPlayer.push(waitPlayer[i])
      }
    }
    await service.baseService.updateById(room, id, { wait: newWaitPlayer})
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + roomInstance._id
      if(conn.path === url){
        conn.sendText('refreshRoom')
      }
    })
    ctx.body = $helper.Result.success('退出房间成功')
  }

  /**
   * 在房间内修改昵称（需要通知到别人）
   * @returns {Promise<void>}
   */
  async modifyPlayerNameInRoom () {
    const { service, ctx, app} = this
    const { $helper, $model, $ws } = app
    const { user, room } = $model
    const { id, roomId, name } = ctx.query
    if(!id || id === ''){
      ctx.body = $helper.Result.fail(-1,'userId不能为空！')
      return
    }
    if(!name || name === ''){
      ctx.body = $helper.Result.fail(-1,'新昵称不能为空！')
      return
    }
    let roomInstance = await service.baseService.queryById(room, roomId)
    let currentUser = await service.baseService.userInfo()
    let targetUser = await service.baseService.queryById(user, id)
    if(currentUser.username !== targetUser.username){
      ctx.body = $helper.Result.fail(-1,'你不能修改别人的信息')
      return
    }

    await service.baseService.updateById(user, id, {name: name})
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + roomInstance._id
      if(conn.path === url){
        conn.sendText('refreshRoom')
      }
    })
    ctx.body = $helper.Result.success('修改成功')
  }

  /**
   * 房主踢人
   * @returns {Promise<void>}
   */
  async kickPlayer () {
    const { service, ctx, app } = this
    const { $helper, $model, $ws } = app
    const { room } = $model
    const { id, position } = ctx.query
    if(!id || id === ''){
      ctx.body = $helper.Result.fail(-1,'roomId不能为空！')
      return
    }
    if(!position || position === ''){
      ctx.body = $helper.Result.fail(-1,'座位号不能为空！')
      return
    }
    let roomInstance = await service.baseService.queryById(room, id)
    let currentUser = await service.baseService.userInfo()
    if(roomInstance.owner !== currentUser.username){
      ctx.body = $helper.Result.fail(-1,'你不是该房间的房主，无法踢人！')
      return
    }
    let updateObj = {}
    updateObj['v' + position] = null
    await service.baseService.updateById(room, id, updateObj)
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + roomInstance._id
      if(conn.path === url){
        conn.sendText('refreshRoom')
      }
    })
    ctx.body = $helper.Result.success('踢人成功！')
  }

  /**
   * 玩家入座
   * @returns {Promise<void>}
   */
  async sitDown () {
    const { service,ctx, app } = this
    const { $helper, $model, $ws } = app
    const { room } = $model
    const { id, position } = ctx.query
    if(!id || id === ''){
      ctx.body = $helper.Result.fail(-1,'roomId不能为空！')
      return
    }
    if(!position || position === ''){
      ctx.body = $helper.Result.fail(-1,'座位号不能为空！')
      return
    }
    let roomInstance = await service.baseService.queryById(room, id)
    let currentUser = await service.baseService.userInfo()
    let username = currentUser.username
    let seatValue = roomInstance['v' + position]
    if(seatValue === username){
      // 当前位置坐的就是本人,不用处理
      ctx.body = $helper.Result.success('入座成功')
      return
    }
    if(seatValue) {
      ctx.body = $helper.Result.fail(-1,'当前座位已经有人，请选择别的座位入座！')
      return
    }

    // 判断是否已经入座
    let isSeat =  await service.roomService.findInSeatPlayer(id, username)
    let waitPlayer = roomInstance.wait
    if(!isSeat.result){
      let exist = waitPlayer.find(p=>{
        return p === username
      })
      // 未入座，但是等待区也没
      if(!exist){
        ctx.body = $helper.Result.fail(-1,'您不在等待区，请退出房间，重新加入该房间！')
        return
      }
    } else {
      // 已经入座了，入座前需要退出座位（即换座位）
      const seatUpdate = (key) => {
        if(roomInstance[key] === username){
          // 需要被更新
          let obj = {}
          obj[key] = null
          return obj
        }
        return false
      }
      for(let i =0; i < 9 ;i ++){
        let t = seatUpdate('v' + (i + 1))
        if(t){
          await service.baseService.updateById(room, roomInstance._id, t)
        }
      }
    }

    // 准备入座
    let updateObj = {}
    updateObj['v' + position] = username
    await service.baseService.updateById(room, id, updateObj)

    // 清掉等待区的当前user
    let newWaitPlayer = []
    for(let i = 0; i < waitPlayer.length; i++){
      if(waitPlayer[i] !== username){
        newWaitPlayer.push(waitPlayer[i])
      }
    }
    await service.baseService.updateById(room, id, { wait: newWaitPlayer})
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + roomInstance._id
      if(conn.path === url){
        conn.sendText('refreshRoom')
      }
    })
    ctx.body = $helper.Result.success('入座成功')
  }

  /**
   * 获取房间内可用板子
   * @returns {Promise<void>}
   */
  async getRoomMode () {
    const { ctx, app } = this
    const { $helper, $constants } = app
    const { MODE } = $constants
    let list = []
    for(let mode in MODE){
      list.push(MODE[mode])
    }
    ctx.body = $helper.Result.success(list)
  }

  /**
   * 修改板子
   * @returns {Promise<void>}
   */
  async changeRoomMode () {
    const { service, ctx, app } = this
    const { $helper, $model, $constants, $ws } = app
    const { room } = $model
    const { id, mode } = ctx.query
    if(!id || id === ''){
      ctx.body = $helper.Result.fail(-1,'房间id不能为空！')
      return
    }
    if(!mode || mode === ''){
      ctx.body = $helper.Result.fail(-1,'板子key不能为空！')
      return
    }
    const { MODE } = $constants
    let targetMode = MODE[mode]
    if(!targetMode){
      ctx.body = $helper.Result.fail(-1,'无效或不存在的板子！')
      return
    }
    let roomInstance = await service.baseService.queryById(room, id)
    if(!roomInstance){
      ctx.body = $helper.Result.fail(-1,'该房间不存在！')
      return
    }
    let currentUser = await service.baseService.userInfo()
    if(roomInstance.owner !== currentUser.username){
      ctx.body = $helper.Result.fail(-1,'你无权改变该房间的板子！')
      return
    }
    let update = {
      mode: targetMode.key,
      count: targetMode.count,
      v1: null,
      v2: null,
      v3: null,
      v4: null,
      v5: null,
      v6: null,
      v7: null,
      v8: null,
      v9: null,
      v10: null,
      v11: null,
      v12: null,
    }
    // 改变板子之后，座位清空全部进入等待区
    let newWaitPlayer = []
    for(let i = 0; i < 12; i ++) {
      if(roomInstance['v' + (i + 1)]){
        newWaitPlayer.push(roomInstance['v' + (i + 1)])
      }
    }
    update.wait = roomInstance.wait.concat(newWaitPlayer)

    await service.baseService.updateById(room, roomInstance._id, update)
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + roomInstance._id
      if(conn.path === url){
        conn.sendText('refreshRoom')
      }
    })
    ctx.body = $helper.Result.success('ok')
  }
}
module.exports = roomController
