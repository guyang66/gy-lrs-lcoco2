const BaseClass = require('../base/BaseClass')
class recordService extends BaseClass{


  /**
   * 游戏开始事件
   * @param gameInstance
   * @returns {Promise<{result}>}
   */
  async gameStartRecord(gameInstance){
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      content: {
        text: '游戏开始！',
        type: 'text',
        level: $enums.TEXT_COLOR.RED,
      },
      isCommon: 1,
      isTitle: 0
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 游戏结束事件
   * @param gameInstance
   * @returns {Promise<{result}>}
   */
  async gameOverRecord (gameInstance) {
    const { service, app } = this
    const { $helper, $model } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      content: '房主结束了该场游戏，游戏已结束！',
      isCommon: 1,
      isTitle: 0
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 进入夜晚事件
   * @param gameInstance
   * @param day
   * @param stage
   * @returns {Promise<{result}>}
   */
  async nightBeginRecord(gameInstance, day, stage){
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      content: {
        text: '天黑请闭眼',
        type: 'text',
        level: $enums.TEXT_COLOR.BLACK,
      },
      isCommon: 1,
    }
    if(day){
      saveRecord.day = day
    }
    if(stage){
      saveRecord.stage = stage
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 玩家动作事件
   * @returns {Promise<void>}
   */
  async actionRecord (gameInstance, targetPlayer, content) {
    const { service, app } = this
    const { $helper, $model, $enums, $constants } = app
    const { record, player } = $model
    const { SKILL_MAP } = $constants
    let {isCommon = 0, isTitle = 0, actionKey, level = $enums.TEXT_COLOR.BLACK, actionName, text, from, to} = content
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let currentUser = await service.baseService.userInfo()
    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    if(!actionName){
      actionName = SKILL_MAP[currentPlayer.role].find(item=>{
        return item.key === actionKey
      }).name
    }

    let targetText = text
    if(!targetText || targetText === ''){
      targetText = `${currentPlayer.roleName}：${currentPlayer.position}号玩家（${currentPlayer.name}）${actionName}了${targetPlayer.position}号玩家（${targetPlayer.name}）`
      if(actionKey === $enums.SKILL_ACTION_KEY.CHECK){
        targetText = targetText + `的身份为：${targetPlayer.campName}`
      }
    }

    let saverRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: isCommon,
      isTitle: isTitle,
      content: {
        type: 'action',
        text: targetText,
        key: actionKey,
        actionName: actionName,
        level: level,
        from: from ? from : {
          username: currentPlayer.username,
          name: currentPlayer.name,
          position: currentPlayer.position,
          role: currentPlayer.role,
          camp: currentPlayer.camp
        },
        to: to ? to : {
          username: targetPlayer.username,
          name: targetPlayer.name,
          position: targetPlayer.position,
          role: targetPlayer.role,
          camp: targetPlayer.camp
        }
      }
    }

    await service.baseService.save(record, saverRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 玩家死亡事件
   * @param gameInstance
   * @param targetPlayer
   * @returns {Promise<{result}>}
   */
  async deadRecord (gameInstance, targetPlayer) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record, player } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let currentUser = await service.baseService.userInfo()
    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'action',
        action: $enums.SKILL_ACTION_KEY.DIE,
        actionName: '死亡',
        level: $enums.TEXT_COLOR.RED,
        from: {
          username: targetPlayer ? targetPlayer.username : currentPlayer.username,
          name: targetPlayer ? targetPlayer.name : currentPlayer.name,
          position: targetPlayer ? targetPlayer.position : currentPlayer.position,
          role: targetPlayer ? targetPlayer.role : currentPlayer.role,
          camp: targetPlayer ? targetPlayer.camp : currentPlayer.camp
        },
        to: {
          role: 'out',
          name: '出局'
        }
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 游戏胜利事件
   * @returns {Promise<void>}
   */
  async gameWinRecord (gameInstance, camp) {
    const { service, app } = this
    const { $helper, $model, $enums, $constants } = app
    const { record } = $model
    const {CAMP_MAP} = $constants
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }

    let campList = $helper.mapToArray(CAMP_MAP)
    let target = campList.find(item=>{return item.value === camp})

    let color
    switch (target.value) {
      case $enums.GAME_CAMP.WOLF:
        color = $enums.TEXT_COLOR.RED
        break;
      case $enums.GAME_CAMP.CLERIC_AND_VILLAGER:
        color = $enums.TEXT_COLOR.GREEN
        break;
      case $enums.GAME_CAMP.THIRD_CAMP:
        color = $enums.TEXT_COLOR.PINK
        break;
      default:
    }

    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'rich-text',
        content: [
          {
            text: '游戏结束！',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: target.name,
            level: color
          },
          {
            text: '赢得',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: '胜利！',
            level: $enums.TEXT_COLOR.GREEN,
          },
        ]
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 空过事件
   * @param gameInstance
   * @param targetPlayer
   * @returns {Promise<{result}>}
   */
  async emptyActionRecord (gameInstance, targetPlayer, content = {}) {
    const { service, app } = this
    const { $helper, $model, $enums, $constants, $support } = app
    const { record } = $model
    const {JUMP_MAP} = $constants
    let { actionName, status} = content
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    if(!targetPlayer){
      return $helper.wrapResult(false, 'targetPlayer为空！', -1)
    }

    let roleName = $support.getRoleName(targetPlayer.role)
    if(!actionName){
      actionName = JUMP_MAP[targetPlayer.role] || '空过'
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 0,
      isTitle: 0,
      content: {
        type: 'action',
        key: $enums.SKILL_ACTION_KEY.JUMP,
        text: $support.getPlayerFullName(targetPlayer) + `${roleName}${actionName}`,
        actionName: actionName,
        level: $enums.TEXT_COLOR.ORANGE,
        from: {
          username: targetPlayer.username,
          name: targetPlayer.name,
          position: targetPlayer.position,
          role: targetPlayer.role,
          camp: targetPlayer.camp,
          status: (status !== null && status !== undefined) ? status : targetPlayer.status
        },
        to: {
          username: null,
          name: null,
        }
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 发言顺序事件
   * @param gameInstance
   * @param targetPlayer
   * @param randomOrder
   * @returns {Promise<{result}>}
   */
  async speakRecord (gameInstance, targetPlayer, randomOrder) {
    const { service, app } = this
    const { $helper, $model, $enums, $support } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'rich-text',
        content: [
          {
            text: '进入投票环节，由',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: $support.getPlayerFullName(targetPlayer),
            level: $enums.TEXT_COLOR.BLUE,
          },
          {
            text: '开始发言。顺序为：',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: randomOrder === 1 ? '正向' : '逆向',
            level: randomOrder === 1 ? $enums.TEXT_COLOR.GREEN : $enums.TEXT_COLOR.RED,
          }
        ]
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 天亮事件
   * @param gameInstance
   * @returns {Promise<{result}>}
   */
  async dayBeginRecord (gameInstance) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      stage: gameInstance.stage,
      day: gameInstance.day,
      content: {
        text: '天亮了！',
        type: 'text',
        level: $enums.TEXT_COLOR.BLUE,
      },
      isCommon: 1,
      isTitle: 0
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 平安夜事件
   * @param gameInstance
   * @returns {Promise<{result}>}
   */
  async peaceRecord (gameInstance) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'text',
        text: '昨天晚上是平安夜!',
        level: $enums.TEXT_COLOR.GREEN,
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 弃票事件
   * @param gameInstance
   * @param abstainedPlayer
   * @returns {Promise<{result}>}
   */
  async abstainedRecord (gameInstance, abstainedPlayer = null) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    if(!abstainedPlayer){
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 1,
        isTitle: 0,
        content: {
          text: '所有人弃票，没有玩家出局',
          type: 'text',
          level: $enums.TEXT_COLOR.RED,
        }
      }
      await service.baseService.save(record, recordObject)
      return $helper.wrapResult(true, 'ok')
    }
    let abstainedString = ''
    for(let i =0; i < abstainedPlayer.length; i++){
      if(i !== 0){
        abstainedString = abstainedString + '、'
      }
      abstainedString = abstainedString + abstainedPlayer[i].position + '号'
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'action',
        actionName: '弃票',
        text: abstainedString + '弃票',
        action: 'abstained',
        level: $enums.TEXT_COLOR.PINK,
        from: {name: abstainedString},
        to: {
          name: '弃票',
          username: null
        }
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 投票结果事件
   * @param gameInstance
   * @param map
   * @param key
   * @returns {Promise<{result}>}
   */
  async voteRecord (gameInstance, map, key) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record, player } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    // 排序
    let content = map[key]
    content = content.sort(function (a,b){
      return a.position - b.position
    })
    let votePlayerString = ''
    let toPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: key})
    for(let i = 0; i < content.length; i++){
      let fromPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: content[i].username})
      if(i !== 0){
        votePlayerString = votePlayerString + '、'
      }
      votePlayerString = votePlayerString + fromPlayer.position + '号'
    }
    let voteResultString = votePlayerString + '投票给了' + toPlayer.position + '号玩家（' + toPlayer.name + ')'
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'action',
        actionName: '投票',
        text: voteResultString,
        action: $enums.SKILL_ACTION_KEY.VOTE,
        level: $enums.TEXT_COLOR.BLUE,
        from: {
          username: null,
          name: votePlayerString,
          position: null,
          role: null,
          camp: null
        },
        to: {
          username: toPlayer.username,
          name: '共' + content.length + '票',
          position: toPlayer.position,
          role: null,
          camp: null
        }
      }
    }

    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }
  /**
   * 放逐事件
   * @param gameInstance
   * @param targetPlayer
   * @returns {Promise<{result}>}
   */
  async exileRecord (gameInstance, targetPlayer) {
    const { service, app } = this
    const { $helper, $model, $enums, $support } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'action',
        actionName: '放逐',
        action: 'exile',
        text: $support.getPlayerFullName(targetPlayer) + '获得最高票数，被放逐出局！',
        level: $enums.TEXT_COLOR.RED,
        from: {
          name: targetPlayer.name,
          username: targetPlayer.username,
          position: targetPlayer.position,
          role: targetPlayer.role,
          camp: targetPlayer.camp
        },
        to: {
          role: 'exile',
          name: '放逐出局'
        }
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 平票事件
   * @param gameInstance
   * @returns {Promise<{result}>}
   */
  async flatTicketRecord (gameInstance) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'rich-text',
        content: [
          {
            text: '平票',
            level: $enums.TEXT_COLOR.RED,
          },
          {
            text: '，没有玩家出局',
            level: $enums.TEXT_COLOR.BLACK,
          }
        ]
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

  /**
   * 投票pk事件
   * @param gameInstance
   * @param targetPlayer
   * @param maxCount
   * @param randomOrder
   * @returns {Promise<{result}>}
   */
  async votePkRecord (gameInstance, targetPlayer, maxCount, randomOrder) {
    const { service, app } = this
    const { $helper, $model, $enums, $support } = app
    const { record, player } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }

    let pkPlayerString = ''
    for(let i = 0; i < maxCount.length; i ++ ){
      let pkPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: maxCount[i]})
      pkPlayerString = pkPlayerString + $support.getPlayerFullName(pkPlayer)
      if(i < maxCount.length - 1){
        pkPlayerString = pkPlayerString + '、'
      }
    }
    let saveRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 1,
      isTitle: 0,
      content: {
        type: 'rich-text',
        content: [
          {
            text: '进入',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: '加赛pk',
            level: $enums.TEXT_COLOR.RED,
          },
          {
            text: '环节，',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: pkPlayerString,
            level: $enums.TEXT_COLOR.GREEN,
          },
          {
            text: '进行pk',
            level: $enums.TEXT_COLOR.RED,
          },
          {
            text: '，由',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: $support.getPlayerFullName(targetPlayer),
            level: $enums.TEXT_COLOR.BLUE,
          },
          {
            text: '先开始发言。顺序为：',
            level: $enums.TEXT_COLOR.BLACK,
          },
          {
            text: randomOrder === 1 ? '正向' : '逆向',
            level: randomOrder === 1 ? $enums.TEXT_COLOR.GREEN : $enums.TEXT_COLOR.RED,
          }
        ]
      }
    }
    await service.baseService.save(record, saveRecord)
    return $helper.wrapResult(true, 'ok')
  }

}
module.exports = recordService;
