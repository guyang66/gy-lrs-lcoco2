const BaseClass = require('../base/BaseClass')

class roomService extends BaseClass{
  /**
   * 查询在座位上的玩家
   * @returns {Promise<boolean>}
   */
  async findInSeatPlayer (roomId, username = '') {
    const { service, app } = this
    const { $model } = app
    const { room } = $model
    if(!roomId){
      throw new Error('房间id不存在！')
    }
    let q = {
      "$and":
        [
          {_id: roomId},
          {
            "$or": [
              {"v1": username},
              {"v2": username},
              {"v3": username},
              {"v4": username},
              {"v5": username},
              {"v6": username},
              {"v7": username},
              {"v8": username},
              {"v9": username}
            ]
          }
        ]
    }
    let r = await service.baseService.queryOne(room, q)
    return !!r
  }

  /**
   * 获取座位上的玩家信息
   * @param roomId
   * @param showPlayerInfo
   * @returns {Promise<{statusString: (string), isFull: boolean, content: []}>}
   */
  async getRoomSeatPlayer (roomId, showPlayerInfo = false) {
    const { service, app} = this
    const { $model } = app
    const { user, room } = $model
    if(!roomId){
      throw new Error('房间id不存在！')
    }
    let roomInstance = await service.baseService.queryById(room, roomId)
    let count = roomInstance.count
    let list = []
    for(let i = 0; i < count; i++){
      let columnKey = 'v' + (i + 1)
      let username = roomInstance[columnKey]
      if(!username){
        list.push({player: null, position: i + 1, name: (i + 1) + '号'})
        continue
      }
      let userInfo = await service.baseService.queryOne(user, {username: username})
      let currentUser = await service.baseService.userInfo()
      userInfo = {
        name: userInfo.name,
        _id: userInfo._id,
        username: userInfo.username,
        isSelf: currentUser.username === userInfo.username, // 是否是自己
      }
      if(userInfo){
        list.push({player: userInfo, position: i + 1, name: (i + 1) + '号'})
      } else {
        list.push({player: null, position: i + 1, name: (i + 1) + '号'})
      }
    }

    let isFull = true
    list.forEach(item=>{
      if(!item.player){
        isFull = false
      }
    })

    return {
      content: list,
      isFull: isFull,
      statusString: isFull ? '未坐满' : '已坐满'
    }
  }

  /**
   * 根据玩家姓名清空座位
   * @returns {Promise<void>}
   */
  async clearSeat (roomId, username) {
    const { service, app } = this
    const { $model } = app
    const { room } = $model
    if(!roomId || roomId === ''){
      throw new Error('房间id不存在！')
    }
    if(!username || username === ''){
      throw new Error('username不存在！')
    }

    let roomInstance = await service.baseService.queryById(room, roomId)
    for(let i = 0; i < roomInstance.count ;i ++){
      let key = 'v' + (i + 1)
      if(roomInstance[key] === username){
        let update = {}
        update[key] = null // 清空操作-对应位置重置为null
        await service.baseService.updateById(room, roomInstance._id, update)
      }
    }
  }

  /**
   * 获取房间等待区玩家列表
   * @param roomInstance
   * @returns {Promise<{result}|[]>}
   */
  async getWaitPlayerList (roomInstance) {
    const { service, app} = this
    const { $model } = app
    const { user } = $model
    if(!roomInstance){
      throw new Error('roomInstance为空！')
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
    return waitPlayerArray
  }

}
module.exports = roomService;
