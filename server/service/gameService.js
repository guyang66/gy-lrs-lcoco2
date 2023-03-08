const BaseClass = require('../base/BaseClass')
class gameService extends BaseClass{

  /**
   * 创建一个新游戏
   * @param roomInstance
   * @param setting
   * @returns {Promise<*>}
   */
  async createNewGame (roomInstance, setting) {
    const { service, app } = this
    const { $model, $constants} = app
    const { game} = $model
    let gameConfig = $constants.MODE[roomInstance.mode]
    let stack = [].concat(gameConfig.STAGE).reverse()
    if(!roomInstance){
      throw new Error('roomInstance为空！')
    }
    const getGameSettingValue = (v1, v2) => {
      if(!v1 && !v2){
        return null
      }
      return v1 || v2
    }
    let newGame = {
      roomId: roomInstance._id,
      owner: roomInstance.owner,
      stageStack: stack,
      v1: roomInstance.v1,
      v2: roomInstance.v2,
      v3: roomInstance.v3,
      v4: roomInstance.v4,
      v5: roomInstance.v5,
      v6: roomInstance.v6,
      v7: roomInstance.v7,
      v8: roomInstance.v8,
      v9: roomInstance.v9,
      v10: roomInstance.v10,
      v11: roomInstance.v11,
      v12: roomInstance.v12,
      playerCount: roomInstance.count,
      predictorActionTime: getGameSettingValue(setting.predictorActionTime, gameConfig.CONFIG_DEFAULT.predictorActionTime),
      wolfActionTime: getGameSettingValue(setting.wolfActionTime, gameConfig.CONFIG_DEFAULT.wolfActionTime),
      witchActionTime: getGameSettingValue(setting.witchActionTime, gameConfig.CONFIG_DEFAULT.witchActionTime),
      guardActionTime: getGameSettingValue(setting.guardActionTime, gameConfig.CONFIG_DEFAULT.guardActionTime),
      witchSaveSelf: getGameSettingValue(setting.witchSaveSelf, gameConfig.CONFIG_DEFAULT.witchSaveSelf),
      winCondition:getGameSettingValue(setting.winCondition, gameConfig.CONFIG_DEFAULT.winCondition),
      flatTicket: getGameSettingValue(setting.flatTicket, gameConfig.CONFIG_DEFAULT.flatTicket),
      mode: roomInstance.mode
    }
    return await service.baseService.save(game, newGame)
  }
  /**
   * 获取可见的玩家信息
   * @returns {Promise<{result}>}
   */
  async getPlayerInfoInGame (gameId) {
    const { service, app } = this
    const { $model, $constants, $support, $enums } = app
    const { game, player, user, vision, room, action } = $model
    const { PLAYER_ROLE_MAP } = $constants
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)
    let playerCount = gameInstance.playerCount
    let playerInfo = []
    let pkPlayer = await service.tagService.getTodayPkPlayer(gameInstance)
    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    let defendAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day - 1, stage: $enums.GAME_STAGE.GUARD_STAGE, action: $enums.SKILL_ACTION_KEY.DEFEND})

    const getTarget = (name) => {
      // 判断守卫连续两晚守卫的是否是同一个人
      if(gameInstance.stage === $enums.GAME_STAGE.GUARD_STAGE && defendAction && defendAction.to === name && currentPlayer.role === $enums.GAME_ROLE.GUARD){
        return false
      }
      // 判断是否进入平票pk环节，该阶段处于非pk中玩家，不能被投票
      if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
        return pkPlayer.includes(name)
      }
      return true
    }

    for(let i = 0; i < playerCount; i++) {
      let un = gameInstance['v' + (i + 1)]
      // 查询其他玩家信息
      let otherPlayer = await service.baseService.queryOne(player, {username: un, gameId: gameId, roomId: gameInstance.roomId})
      if(gameInstance.status === $enums.GAME_STATUS.FINISHED || gameInstance.status === $enums.GAME_STATUS.EXCEPTION || isOb){
        // 如果游戏已经结束，则获取完全视野（复盘）
        playerInfo.push({
          name: otherPlayer.name,
          username: otherPlayer.username,
          isSelf: un === currentUser.username, // 是否是自己
          camp: otherPlayer.camp, // 是否知晓阵营
          campName: $support.getCampByRole(otherPlayer.role, true),
          status: otherPlayer.status, // 是否死亡
          role: otherPlayer.role, // 是否知晓角色
          roleName: PLAYER_ROLE_MAP[otherPlayer.role] ? PLAYER_ROLE_MAP[otherPlayer.role].name : '', // 是否知晓角色
          position: otherPlayer.position,
          isTarget: getTarget(otherPlayer.username) // 是否可以被触发动作（比如投票不是pk台上的玩家不能被投票，比如守卫第二晚不能守护同一个人）
        })
        continue
      }
      // 查询玩家信息
      let otherUser = await service.baseService.queryOne(user, {username: otherPlayer.username})
      // 查询自己对该玩家的视野
      let visionInstance = await service.baseService.queryOne(vision, {gameId: gameInstance._id, roomId: gameInstance.roomId, from: currentUser.username, to: un})
      playerInfo.push({
        name: otherUser.name,
        username: otherUser.username,
        isSelf: un === currentUser.username, // 是否是自己
        camp: visionInstance.status === $enums.VISION_STATUS.UNKNOWN ? null : otherPlayer.camp, // 是否知晓阵营
        campName: visionInstance.status === $enums.VISION_STATUS.UNKNOWN ? null : $support.getCampByRole(otherPlayer.role, true),
        status: otherPlayer.status, // 是否死亡
        role: visionInstance.status === $enums.VISION_STATUS.KNOWN_ROLE ? otherPlayer.role : null, // 是否知晓角色
        roleName: visionInstance.status === $enums.VISION_STATUS.KNOWN_ROLE ? (PLAYER_ROLE_MAP[otherPlayer.role] ? PLAYER_ROLE_MAP[otherPlayer.role].name : '') : null,
        position: otherPlayer.position,
        isTarget: getTarget(otherPlayer.username) // 是否可以被触发动作（比如投票不是pk台上的玩家不能被投票，比如守卫第二晚不能守护同一个人）
      })
    }
    return playerInfo
  }

  /**
   * 获取当前玩家在游戏中的技能状态
   * @returns {Promise<{result}>}
   */
  async getSkillStatusInGame (gameId) {
    const { service, app } = this
    const { $support, $model, $enums } = app
    const { game, player, action, room } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)

    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    if(isOb || !currentPlayer.skill || currentPlayer.skill.length < 1){
      return []
    }
    let skillList = currentPlayer.skill
    // 查询一下当天有没有救人或者毒人，只要有2之一，女巫当晚不能再使用技能
    let checkAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.PREDICTOR_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.CHECK})
    let defendAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.GUARD_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.DEFEND})
    let assaultAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.ASSAULT})
    let saveAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.ANTIDOTE})
    let poisonAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.POISON})
    let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, action: $enums.SKILL_ACTION_KEY.KILL})
    let isPlayerAlive = currentPlayer.status === $enums.PLAYER_STATUS.ALIVE
    const getSkillUseStatus = (skill, targetStage, targetAction) => {
      if(targetAction){
        // 使用之后，不能再使用，得到下一轮才能使用
        return  false
      }
      return gameInstance.stage === targetStage && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE && skill.status === $enums.SKILL_STATUS.AVAILABLE
    }
    const getWitchAntidoteByGameSettings = () => {
      // 狼人空刀，不能使用解药
      if(!killAction){
        return false
      }
      // 不能自救且死的是自己，不能使用解药
      if(gameInstance.witchSaveSelf ===  $enums.GAME_WITCH_SAVE_SELF.NO_SAVE_SELF && killAction.to === currentUser.username){
        return false
      }
      // 仅首页能自救
      if(gameInstance.witchSaveSelf === $enums.GAME_WITCH_SAVE_SELF.SAVE_ONLY_FIRST_NIGHT && killAction.to === currentUser.username){
        return gameInstance.day === 1
      }
      return true
    }
    const computeHunterSkill = (skill,stage) => {
      if(skill.status === $enums.SKILL_STATUS.UNAVAILABLE){
        return false
      }
      if(stage === $enums.GAME_STAGE.AFTER_NIGHT && currentPlayer.status === $enums.PLAYER_STATUS.DEAD){
        // 经过了晚上的洗礼，如果死亡
        return currentPlayer.outReason !== $enums.GAME_OUT_REASON.POISON
      }
      return stage !== $enums.GAME_STAGE.EXILE_FINISH_STAGE;
    }

    let skillInfoList = []
    skillList.forEach(skill=>{
      let isSkillAvailable = skill.status === $enums.SKILL_STATUS.AVAILABLE
      let skillMap = {
        key: skill.key,
        name: skill.name,
      }
      switch (skill.key) {
        case $enums.SKILL_ACTION_KEY.BOOM:
          skillMap.canUse = gameInstance.stage === $enums.GAME_STAGE.SPEAK_STAGE && isPlayerAlive // 是否可用
          skillMap.show = gameInstance.stage === $enums.GAME_STAGE.SPEAK_STAGE && isPlayerAlive
          skillInfoList.push(skillMap)
          break;
        case $enums.SKILL_ACTION_KEY.ASSAULT:
          skillMap.canUse = getSkillUseStatus(skill, $enums.GAME_STAGE.WOLF_STAGE, assaultAction) // 是否可用
          skillMap.show = gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE && isPlayerAlive && isSkillAvailable
          skillInfoList.push(skillMap)
          break;
        case $enums.SKILL_ACTION_KEY.CHECK:
          skillMap.canUse = getSkillUseStatus(skill,$enums.GAME_STAGE.PREDICTOR_STAGE, checkAction) // 是否可用
          skillMap.show = gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE && isPlayerAlive && isSkillAvailable
          skillInfoList.push(skillMap)
          break;
        case $enums.SKILL_ACTION_KEY.DEFEND:
          skillMap.canUse = getSkillUseStatus(skill,$enums.GAME_STAGE.GUARD_STAGE, defendAction) // 是否可用
          skillMap.show = gameInstance.stage === $enums.GAME_STAGE.GUARD_STAGE && isPlayerAlive && isSkillAvailable
          skillInfoList.push(skillMap)
          break;
        case $enums.SKILL_ACTION_KEY.ANTIDOTE:
          skillMap.canUse = getSkillUseStatus(skill,$enums.GAME_STAGE.WITCH_STAGE, (saveAction || poisonAction)) && getWitchAntidoteByGameSettings() // 是否可用
          skillMap.show = gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE && isPlayerAlive && isSkillAvailable
          skillInfoList.push(skillMap)
          break;
        case $enums.SKILL_ACTION_KEY.POISON:
          skillMap.canUse = getSkillUseStatus(skill, $enums.GAME_STAGE.WITCH_STAGE, (saveAction || poisonAction))
          skillMap.show = gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE && isPlayerAlive && isSkillAvailable
          skillInfoList.push(skillMap)
          break;
        case $enums.SKILL_ACTION_KEY.SHOOT:
          skillMap.canUse = computeHunterSkill(skill, gameInstance.stage)
          skillMap.show = (gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT || gameInstance.stage === $enums.GAME_STAGE.EXILE_FINISH_STAGE) && isSkillAvailable
          skillInfoList.push(skillMap)
          break;
        default:
      }
    })
    return skillInfoList
  }

  /**
   * 获取游戏公告信息
   * @returns {Promise<{result}>}
   */
  async getBroadcastInfo(gameId) {
    const { service, app } = this
    const { $model, $constants, $enums } = app
    const { game, gameTag } = $model
    const { BROADCAST_MAP } = $constants
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    if(gameInstance.status === $enums.GAME_STATUS.FINISHED){
      let info = []
      info.push({text: '游戏结束！', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: gameInstance.winnerstring, level: gameInstance.winner === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN})
      info.push({text: '胜利！', level: $enums.TEXT_COLOR.BLACK})
      return info
    }
    if(gameInstance.status === $enums.GAME_STATUS.EXCEPTION){
      let info = []
      info.push({text: '房主结束了该场游戏，游戏已', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '结束！', level: $enums.TEXT_COLOR.RED})
      return info
    }
    if(gameInstance.stage === $enums.GAME_STAGE.READY && gameInstance.day === $enums.GAME_DAY_ORDER.FIRST_DAY) {
      return BROADCAST_MAP['ready']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.READY) {
      return BROADCAST_MAP['night_begin']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE) {
      return BROADCAST_MAP['predictor_action']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE){
      return BROADCAST_MAP['wolf_action']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.GUARD_STAGE){
      return BROADCAST_MAP['guard_action']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE){
      return BROADCAST_MAP['witch_action']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT){
      let diePlayer = await service.baseService.query(gameTag, {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        mode: $enums.GAME_TAG_MODE.DIE
      }, {}, { sort: { position: 1}})

      if(!diePlayer || diePlayer.length < 1){
        let info = []
        info.push({text: '昨天晚上是', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '平安夜', level: $enums.TEXT_COLOR.GREEN})
        return info
      } else {
        let dieString = ''
        let dieMap = {} // 去重，去掉狼人和女巫杀同一个人
        diePlayer.forEach((item,index)=>{
          if(dieMap[item.target]){
            return
          }
          dieMap[item.target] = item
          if(index !== 0){
            dieString = dieString + '和'
          }
          dieString = dieString + item.position + '号玩家（' + item.name + '）'
        })
        let info = []
        info.push({text: '昨天晚上死亡的是：', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: dieString, level: $enums.TEXT_COLOR.RED})
        info.push({text: '，等待死亡玩家发动技能', level: $enums.TEXT_COLOR.BLACK})
        if(gameInstance.day === $enums.GAME_DAY_ORDER.FIRST_DAY){
          // 第一天死亡有遗言
          info.push({text: '，且第一晚死亡有', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '遗言', level: $enums.TEXT_COLOR.RED})
        } else {
          info.push({text: '，没有', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '遗言', level: $enums.TEXT_COLOR.RED})
        }
        return info
      }
    }

    if(gameInstance.stage === $enums.GAME_STAGE.SPEAK_STAGE){
      let pkOrder = await service.baseService.queryOne(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, desc: 'pkOrder', mode: $enums.GAME_TAG_MODE.VOTE_PK})
      if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && pkOrder){
        let info = []
        info.push({text:'进入', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:'pk', level: $enums.TEXT_COLOR.RED})
        info.push({text:'环节，由', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '' + pkOrder.position + '号玩家（' + pkOrder.name + '）', level:$enums.TEXT_COLOR.RED})
        info.push({text:'先开始发言，顺序为：', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:pkOrder.value === 'asc' ? '正向' : '逆向', level: $enums.TEXT_COLOR.RED})
        return info
      }
      let order = await service.baseService.queryOne(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, desc: 'speakOrder', mode: $enums.GAME_TAG_MODE.SPEAK_ORDER})
      let info = []
      info.push({text:'进入发言环节，从', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '' + order.position + '号玩家（' + order.name + '）', level:$enums.TEXT_COLOR.RED})
      info.push({text:'开始发言，顺序为：', level: $enums.TEXT_COLOR.BLACK})
      info.push({text:order.value === 'asc' ? '正向' : '逆向', level: $enums.TEXT_COLOR.RED})
      return info
    }

    if(gameInstance.stage === $enums.GAME_STAGE.VOTE_STAGE){
      return BROADCAST_MAP['vote']
    }
    if(gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
      return BROADCAST_MAP['vote_pk']
    }

    if(gameInstance.stage === $enums.GAME_STAGE.EXILE_FINISH_STAGE){
      let stage = $enums.GAME_STAGE.VOTE_STAGE
      let pkPlayers = await service.tagService.getTodayPkPlayer(gameInstance)
      if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && pkPlayers && pkPlayers.length > 0){
        // 有pk阶段
        stage = $enums.GAME_STAGE.VOTE_PK_STAGE
      }
      let voteDieTag = await service.baseService.queryOne(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage: stage, mode: $enums.GAME_TAG_MODE.DIE})
      if(!voteDieTag){
        let info = []
        info.push({text:'平票，今天没有玩家出局，没有遗言', level: $enums.TEXT_COLOR.BLACK})
        return info
      } else {
        let info = []
        info.push({text:'' + voteDieTag.position + '号玩家（' + voteDieTag.name + '）', level: $enums.TEXT_COLOR.RED})
        info.push({text:'被投票', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:'出局', level: $enums.TEXT_COLOR.RED})
        info.push({text:'，等待玩家发动技能', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:'，等待玩家发表遗言。', level: $enums.TEXT_COLOR.BLACK})
        return info
      }
    }
    return []
  }

  /**
   * 获取每个玩家独有的系统提示(小贴士)
   * @returns {Promise<{result}>}
   */
  async getSystemTips  (gameId) {
    const { service, app } = this
    const { $model, $support, $enums } = app
    const { game, player, action, room } = $model

    const isBeforeVoteStage = (stage) => {
      return stage === $enums.GAME_STAGE.PREDICTOR_STAGE
        || stage === $enums.GAME_STAGE.WOLF_STAGE
        || stage === $enums.GAME_STAGE.WITCH_STAGE
        || stage === $enums.GAME_STAGE.AFTER_NIGHT
    }
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)
    if(isOb){
      return []
    }

    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    if(gameInstance.status === $enums.GAME_STATUS.FINISHED){
      let info = []
      info.push({text: '游戏结束！', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: gameInstance.winnerString, level: gameInstance.winner === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN})
      info.push({text: '胜利！', level: $enums.TEXT_COLOR.BLACK})
      return info
    }
    if(currentPlayer.role === 'predictor' && isBeforeVoteStage(gameInstance.stage)){
      // 允许在投票前显示预言家当晚的查验信息
      let checkAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.PREDICTOR_STAGE, action: $enums.SKILL_ACTION_KEY.CHECK})
      if(!checkAction){
        if(gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE){
          return []
        }
        let info = []
        info.push({text: '你', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '预言家', level: $enums.TEXT_COLOR.GREEN})
        info.push({text: '今晚没有查验玩家', level: $enums.TEXT_COLOR.BLACK})
        return info
      }
      let checkUsername = checkAction.to
      let checkPlayer = await service.baseService.queryOne(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, username: checkUsername})
      let info = []
      info.push({text: '你', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '预言家', level: $enums.TEXT_COLOR.GREEN})
      info.push({text: '今晚查验的玩家为', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: $support.getPlayerFullName(checkPlayer), level: $enums.TEXT_COLOR.RED})
      info.push({text: '他的身份为', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: $support.getCampByRole(checkPlayer.role, true), level: checkPlayer.camp === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN})
      return info
    } else if (gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE && currentPlayer.role === 'wolf'){
      let assaultAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.ASSAULT})
      if(assaultAction && assaultAction.to){
        let assaultPlayer = await service.baseService.queryOne(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, username: assaultAction.to})
        let info = []
        info.push({text: '你今晚袭击了', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(assaultPlayer), level: $enums.TEXT_COLOR.RED})
        return info
      } else {
        let info = []
        info.push({text: '请确认您的同伴，并讨论要袭击的玩家', level: $enums.TEXT_COLOR.GREEN})
        return info
      }
    } else if ((gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE || gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT) && currentPlayer.role === 'wolf') {
      let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, action: $enums.SKILL_ACTION_KEY.KILL})
      if(!killAction){
        let info = []
        info.push({text: '你们', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '狼人团队', level: $enums.TEXT_COLOR.RED})
        info.push({text: '晚上没有袭击玩家', level: $enums.TEXT_COLOR.BLACK})
        return info
      }
      let killUsername = killAction.to
      let killPlayer = await service.baseService.queryOne(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, username: killUsername})
      let info = []
      info.push({text: '你们', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '狼人团队', level: $enums.TEXT_COLOR.RED})
      info.push({text: '晚上袭击了', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: $support.getPlayerFullName(killPlayer), level: $enums.TEXT_COLOR.GREEN})
      return info
    } else if ((gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE) && currentPlayer.role === 'witch') {

      let currentSkills = currentPlayer.skill
      let antidoteSkill = $support.getSkillByKey($enums.SKILL_ACTION_KEY.ANTIDOTE, currentSkills)
      let poisonSkill = $support.getSkillByKey($enums.SKILL_ACTION_KEY.POISON, currentSkills)

      let info = []

      let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, action: $enums.SKILL_ACTION_KEY.KILL})
      if(!killAction && antidoteSkill && antidoteSkill.status === $enums.SKILL_STATUS.AVAILABLE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE){
        info.push({text: '今晚没有玩家', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '被袭击', level: $enums.TEXT_COLOR.RED})
        return info
      }
      if(killAction && antidoteSkill && antidoteSkill.status === $enums.SKILL_STATUS.AVAILABLE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE){
        let dieUsername = killAction.to
        let diePlayer = await service.baseService.queryOne(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, username: dieUsername})
        info.push({text: '昨晚死亡的是', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(diePlayer), level: $enums.TEXT_COLOR.RED,})
        if(killAction.to === currentPlayer.username && gameInstance.day !== $enums.GAME_DAY_ORDER.FIRST_DAY && gameInstance.witchSaveSelf === $enums.GAME_WITCH_SAVE_SELF.SAVE_ONLY_FIRST_NIGHT){
          info.push({text: '，女巫非首页不能自救，', level: $enums.TEXT_COLOR.RED,})
          info.push({text: '请选择是否', level: $enums.TEXT_COLOR.BLACK})
        } else if (gameInstance.witchSaveSelf === $enums.GAME_WITCH_SAVE_SELF.NO_SAVE_SELF) {
          info.push({text: '，女巫不能自救，', level: $enums.TEXT_COLOR.RED})
          info.push({text: '请选择是否', level: $enums.TEXT_COLOR.BLACK})
        } else {
          info.push({text: '，', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '请选择使用', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '解药', level: $enums.TEXT_COLOR.GREEN})
          info.push({text: '或者', level: $enums.TEXT_COLOR.BLACK})
        }
      }

      if(poisonSkill && poisonSkill.status === $enums.SKILL_STATUS.AVAILABLE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE){
        info.push({text: '现在可以使用', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '毒药', level: $enums.TEXT_COLOR.RED})
        info.push({text: '毒杀别的玩家', level: $enums.TEXT_COLOR.BLACK})
      }

      let saveAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, action: $enums.SKILL_ACTION_KEY.ANTIDOTE})
      if(saveAction){
        let savePlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: saveAction.to})
        info = []
        info.push({text: '昨晚死亡的是', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(savePlayer), level: $enums.TEXT_COLOR.RED})
        info.push({text: '，你使用了', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '解药', level: $enums.TEXT_COLOR.GREEN})
        info.push({text: '救了', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(savePlayer) , level: $enums.TEXT_COLOR.GREEN})
      }
      let poisonAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, action: $enums.SKILL_ACTION_KEY.POISON})
      if(poisonAction){
        let poisonPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: poisonAction.to})
        info = []
        info.push({text: '你使用了毒药毒死了', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(poisonPlayer) , level: $enums.TEXT_COLOR.RED})
      }
      return info
    } else if (gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT && currentPlayer.role === 'hunter') {
      if(currentPlayer.status === $enums.PLAYER_STATUS.DEAD){
        let info = []
        info.push({text: '你已', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '出局', level: $enums.TEXT_COLOR.RED})
        let skills = currentPlayer.skill
        let skill
        skills.forEach(item=>{
          if(item.key === $enums.SKILL_ACTION_KEY.SHOOT){
            skill = item
          }
        })
        if(currentPlayer.outReason !== $enums.GAME_OUT_REASON.POISON){
          info.push({text: '，你现在可以发动', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '技能', level: $enums.TEXT_COLOR.GREEN})
        } else {
          info.push({text: '，你被', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '毒药毒死', level: $enums.TEXT_COLOR.RED})
          info.push({text: '无法发动技能', level: $enums.TEXT_COLOR.BLACK})
        }
        return info
      }
    } else if (gameInstance.stage === $enums.GAME_STAGE.VOTE_STAGE){
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.VOTE})
      if(voteAction && voteAction.to){
        let votePlayer = await service.baseService.queryOne(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, username: voteAction.to})
        let info = []
        info.push({text: '你今天投票给', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(votePlayer), level: $enums.TEXT_COLOR.RED})
        return info
      }
      return []
    }
    else if (gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_PK_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.VOTE})
      if(voteAction && voteAction.to){
        let votePlayer = await service.baseService.queryOne(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, username: voteAction.to})
        let info = []
        info.push({text: '你今天投票给', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(votePlayer), level: $enums.TEXT_COLOR.RED})
        return info
      }
      return []
    }
    return []
  }

  /**
   * 获取玩家在游戏中的动作状态
   * @returns {Promise<{result}>}
   */
  async getActionStatusInGame (gameId) {
    const { service, app } = this
    const { $support, $model, $enums } = app
    const { game, player, action, room } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)
    if(isOb){
      return []
    }

    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})

    let actions = []
    if(gameInstance.stage === $enums.GAME_STAGE.VOTE_STAGE) {
      let useStatus = currentPlayer.status === $enums.PLAYER_STATUS.ALIVE
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.VOTE})
      if(voteAction){
        // 您已经投过票了
        useStatus = false
      }
      actions = [
        {
          key: $enums.SKILL_ACTION_KEY.VOTE,
          name: '投票',
          canUse: useStatus,
          show: currentPlayer.status === $enums.PLAYER_STATUS.ALIVE,
        }
      ]
    } else if (gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE) {
      let useStatus = currentPlayer.status === $enums.PLAYER_STATUS.ALIVE
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_PK_STAGE, from: currentPlayer.username, action: $enums.SKILL_ACTION_KEY.VOTE})
      let pkPlayer = await service.tagService.getTodayPkPlayer(gameInstance)
      if(voteAction){
        // 您已经投过票了
        useStatus = false
      }

      if(pkPlayer && pkPlayer.length > 0 && pkPlayer.includes(currentPlayer.username)){
        // 你是pk中的玩家，不允许投票
        useStatus = false
      }
      actions = [
        {
          key: $enums.SKILL_ACTION_KEY.VOTE,
          name: '投票',
          canUse: useStatus,
          show: currentPlayer.status === $enums.PLAYER_STATUS.ALIVE,
        }
      ]
    }
    return actions
  }

  /**
   * 获取游戏是否结束 优先判断好人阵营死亡情况，在夜晚狼人先刀，所以好人和狼人都死完情况下，优先狼人团队胜利
   * @returns {Promise<{result}>}
   */
  async settleGameOver (gameId) {
    const { service, app } = this
    const { $model, $enums } = app

    const { game, player } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)

    let goodAlive = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, camp: $enums.GAME_CAMP.CLERIC_AND_VILLAGER, status: $enums.PLAYER_STATUS.ALIVE})
    if(!goodAlive || goodAlive.length < 1){
      // 好人全死
      await service.gameService.setGameWin(gameInstance._id, $enums.GAME_CAMP.WOLF)
      return true
    }

    let villagerAlive = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, role: $enums.GAME_ROLE.VILLAGER, status: $enums.PLAYER_STATUS.ALIVE})
    if((!villagerAlive || villagerAlive.length < 1) && gameInstance.winCondition === $enums.GAME_WIN_CONDITION.KILL_HALF_ROLE){
      // 屠边 - 村民 => 游戏结束，狼人胜利
      await service.gameService.setGameWin(gameInstance._id, $enums.GAME_CAMP.WOLF)
      return true
    }

    let clericAlive = await service.baseService.query(player,{
      gameId: gameInstance._id,
      roomId: gameInstance.roomId,
      role: { $in: [$enums.GAME_ROLE.PREDICTOR, $enums.GAME_ROLE.WITCH, $enums.GAME_ROLE.HUNTER,$enums.GAME_ROLE.GUARD]},
      status: $enums.PLAYER_STATUS.ALIVE
    })

    if((!clericAlive || clericAlive.length < 1) && gameInstance.winCondition === $enums.GAME_WIN_CONDITION.KILL_HALF_ROLE){
      // 屠边 - 屠神 => 游戏结束，狼人胜利
      await service.gameService.setGameWin(gameInstance._id, $enums.GAME_CAMP.WOLF)
      return true
    }

    let wolfAlive = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, role:  $enums.GAME_ROLE.WOLF, status: $enums.PLAYER_STATUS.ALIVE})
    if(!wolfAlive || wolfAlive.length < 1){
      // 狼人死完 => 游戏结束，好人胜利
      await service.gameService.setGameWin(gameInstance._id, $enums.GAME_CAMP.CLERIC_AND_VILLAGER)
      return true
    }
    // 游戏未结束
    return false
  }

  /**
   * 游戏赢家
   * @param gameId
   * @param camp
   * @returns {Promise<{result}>}
   */
  async setGameWin (gameId, camp) {
    const { service, app } = this
    const { $helper, $model, $ws, $enums, $constants, $log4 } = app
    const { game } = $model
    const { CAMP_MAP } = $constants
    const { errorLogger } = $log4

    if(!gameId){
      throw new Error('gameId为空！')
    }
    if($helper.isEmpty(camp)){
      throw new Error('胜利阵营为空！')
    }

    let campList = $helper.mapToArray(CAMP_MAP)
    let targetCamp = campList.find(item=>{return item.value === camp})
    if(!targetCamp){
      errorLogger.error('【gameService】 - setGameWin: 未识别的阵营参数！')
      return false
    }

    let gameInstance = await service.baseService.queryById(game, gameId)
    await service.baseService.updateById(game, gameInstance._id,{status: $enums.GAME_STATUS.FINISHED, winner: camp, winnerString: targetCamp.name})
    await service.recordService.gameWinRecord(gameInstance, camp)
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + gameInstance.roomId
      if(conn.path === url){
        conn.sendText('gameOver')
      }
    })
    return true
  }

  /**
   * 进入下一个阶段
   * @param gameId
   * @returns {Promise<void>}
   */
  async moveToNextStage (gameId) {
    const { service, app } = this
    const { $model, $ws, $nodeCache, $enums } = app

    const { game } = $model

    if(!gameId || gameId === ''){
      throw new Error('gameId为空！')
    }

    let gameInstance = await service.baseService.queryById(game, gameId)
    let stage = gameInstance.stage

    switch (stage) {
      case $enums.GAME_STAGE.PREDICTOR_STAGE:
        await service.stageService.predictorStage(gameInstance._id)
        break
      case $enums.GAME_STAGE.GUARD_STAGE:
        await service.stageService.guardStage(gameInstance._id)
        break
      case $enums.GAME_STAGE.WOLF_STAGE:
        await service.stageService.wolfStage(gameInstance._id)
        if(gameInstance.mode === $enums.GAME_MODE.STANDARD_6){
          // 6人局在狼人阶段之后需要结算一次
          await service.gameService.settleGameOver(gameInstance._id)
        }
        break
      case $enums.GAME_STAGE.WITCH_STAGE:
        await service.stageService.witchStage(gameInstance._id)
        if(gameInstance.mode === $enums.GAME_MODE.STANDARD_9){
          // 9人局在女巫阶段之后需要结算一次
          await service.gameService.settleGameOver(gameInstance._id)
        }
        break
      case $enums.GAME_STAGE.AFTER_NIGHT:
        await service.stageService.preSpeakStage(gameInstance._id)
        break
      case $enums.GAME_STAGE.VOTE_STAGE:
        await service.stageService.voteStage(gameInstance._id, $enums.GAME_STAGE.VOTE_STAGE)
        break
      case $enums.GAME_STAGE.VOTE_PK_STAGE:
        await service.stageService.voteStage(gameInstance._id, $enums.GAME_STAGE.VOTE_PK_STAGE)
        break
      case $enums.GAME_STAGE.EXILE_FINISH_STAGE:
        await service.stageService.newRound(gameInstance._id)
        break
      default:
    }

    // 刷新一下（上面可能有更新game的操作，比如push一个stage）
    let nextStage = await service.gameService.updateStackToNext(gameInstance._id)

    if(nextStage === $enums.GAME_STAGE.READY){
      await service.recordService.nightBeginRecord(gameInstance, gameInstance.day + 1)
    }

    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + gameInstance.roomId
      if(conn.path === url){
        conn.sendText('stageChange')
      }
    })

    // 倒计时 timer
    let updateGame = await service.baseService.queryById(game, gameId)

    let t = -1
    switch (updateGame.stage) {
      case $enums.GAME_STAGE.PREDICTOR_STAGE:
        t = gameInstance.predictorActionTime
        break
      case $enums.GAME_STAGE.WOLF_STAGE:
        t = gameInstance.wolfActionTime
        break
      case $enums.GAME_STAGE.WITCH_STAGE:
        t = gameInstance.witchActionTime
        break
      case $enums.GAME_STAGE.GUARD_STAGE:
        t = gameInstance.guardActionTime
        break
      default:
    }

    if(t < 0){
      let data = {
        'refreshGame': false,
        time: 0,
      }
      $ws.connections.forEach(function (conn) {
        let url = '/lrs/' + gameInstance.roomId
        if(conn.path === url){
          conn.sendText(JSON.stringify(data))
        }
      })
      return
    }

    $nodeCache.set('game-time-' + gameInstance._id, t)
    app.$timer[gameInstance._id] = setInterval(function (){
      let time =  $nodeCache.get('game-time-' + gameInstance._id)
      if(time < 0){
        // 清掉定时器
        clearInterval(app.$timer[gameInstance._id])
        service.gameService.moveToNextStage(gameInstance._id)
      } else {
        $nodeCache.set('game-time-' + gameInstance._id, time - 1)
        let data = {
          'refreshGame': false,
          time: time,
        }
        $ws.connections.forEach(function (conn) {
          let url = '/lrs/' + gameInstance.roomId
          if(conn.path === url){
            conn.sendText(JSON.stringify(data))
          }
        })
      }
    },1000)
  }

  /**
   * 更新game阶段栈
   * @param gameId
   * @param update
   * @returns {Promise<*>}
   */
  async updateStackToNext (gameId, update = {}) {
    const { service, app } = this
    const { $model, $support } = app
    const { game } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let gameStack = $support.getStageStack(gameInstance)
    // 弹出下一阶段
    let nextStage = gameStack.pop()
    // 更新状态
    let needUpdate = {stage: nextStage, stageStack: gameStack.getItems(), ...update}
    await service.baseService.updateById(game, gameInstance._id, needUpdate)
    // 返回下一阶段
    return nextStage
  }
}
module.exports = gameService;
