const BaseClass = require('../base/BaseClass')

class gameService extends BaseClass{
  /**
   * 获取可见的玩家信息
   * @returns {Promise<{result}>}
   */
  async getPlayerInfoInGame (id) {
    const { service, app } = this
    const { $helper, $model, $constants, $support, $enums } = app
    const { game, player, user, vision, gameTag, room } = $model
    const { playerRoleMap } = $constants
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)
    let playerCount = gameInstance.playerCount || 9
    let playerInfo = []

    let pkTag = await service.baseService.queryOne(gameTag, {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      mode: 3,
      desc: 'pkPlayer'
    })
    let pkPlayer = pkTag ? pkTag.value2 : []
    const getTarget = (name) => {
      // 判断是否进入平票pk环节，该阶段处于非pk中玩家，不能被投票
      if(gameInstance.flatTicket !== $enums.GAME_TICKET_FLAT.NEED_PK){
        return true
      }

      if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
        return pkPlayer.includes(name)
      }
      return true
    }
    for(let i = 0; i < playerCount; i++) {
      let un = gameInstance['v' + (i + 1)]
      // 查询其他玩家信息
      let otherPlayer = await service.baseService.queryOne(player, {username: un, gameId: id, roomId: gameInstance.roomId})
      if(gameInstance.status === $enums.GAME_STATUS.FINISHED || gameInstance.status === $enums.GAME_STATUS.EXCEPTION || isOb){
        // 如果游戏已经结束，则获取完全视野（复盘）
        playerInfo.push({
          name: otherPlayer.name,
          username: otherPlayer.username,
          isSelf: un === currentUser.username, // 是否是自己
          camp: otherPlayer.camp, // 是否知晓阵营
          campName: otherPlayer.camp === $enums.GAME_CAMP.CLERIC_AND_VILLAGER ? '好人阵营' : '狼人阵营', // 是否知晓阵营
          status: otherPlayer.status, // 是否死亡
          role: otherPlayer.role, // 是否知晓角色
          roleName: playerRoleMap[otherPlayer.role] ? playerRoleMap[otherPlayer.role].name : '', // 是否知晓角色
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
        campName: visionInstance.status === $enums.VISION_STATUS.UNKNOWN ? null : (otherPlayer.camp === $enums.GAME_CAMP.CLERIC_AND_VILLAGER ? '好人阵营' : '狼人阵营'),
        status: otherPlayer.status, // 是否死亡
        role: visionInstance.status === $enums.VISION_STATUS.KNOWN_ROLE ? otherPlayer.role : null, // 是否知晓角色
        roleName: visionInstance.status === $enums.VISION_STATUS.KNOWN_ROLE ? (playerRoleMap[otherPlayer.role] ? playerRoleMap[otherPlayer.role].name : '') : null,
        position: otherPlayer.position,
        isTarget: getTarget(otherPlayer.username) // 是否可以被触发动作（比如投票不是pk台上的玩家不能被投票，比如守卫第二晚不能守护同一个人）
      })
    }
    return $helper.wrapResult(true, playerInfo)
  }

  /**
   * 获取当前玩家在游戏中的技能状态
   * @returns {Promise<{result}>}
   */
  async getSkillStatusInGame (id) {
    const { service, app } = this
    const { $helper, $support, $model, $enums } = app
    const { game, player, action, room } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)

    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    if(isOb || !currentPlayer.skill || currentPlayer.skill.length < 1){
      return $helper.wrapResult(true, [])
    }
    let skill = currentPlayer.skill
    let tmp = []
    // 查询一下当天有没有救人或者毒人，只要有2之一，女巫当晚不能再使用技能
    let checkAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.PREDICTOR_STAGE, from: currentPlayer.username, action: 'check'})
    let assaultAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, from: currentPlayer.username, action: 'assault'})
    let saveAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, from: currentPlayer.username, action: 'antidote'})
    let poisonAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, from: currentPlayer.username, action: 'poison'})
    let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, action: 'kill'})
    skill.forEach(item=>{
      if(item.key === 'boom'){
        // 自爆只有在发言阶段可用，且存活状态才可以使用
        tmp.push({
          key: item.key,
          name: item.name,
          canUse: gameInstance.stage === $enums.GAME_STAGE.SPEAK_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE, // 是否可用
          show: gameInstance.stage === $enums.GAME_STAGE.SPEAK_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE, // 是否显示
        })
      } else if (item.key === 'assault') {
        // 袭击只有在夜晚狼人行动是可用，且存活状态，
        let useStatus = gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE && item.status === $enums.SKILL_STATUS.AVAILABLE
        if(assaultAction){
          // 使用之后，不能再使用
          useStatus = false
        }
        tmp.push({
          key: item.key,
          name: item.name,
          canUse: useStatus, // 狼人袭击，夜晚、存活且可用
          show: gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE && item.status === $enums.SKILL_STATUS.AVAILABLE, // (是否展示在前端)存活且轮到自己行动，所以预言家在狼人之前行动，避免刚好被刀（第一晚可报查验，之后用不用也无法开口了），导致当晚技能用不了
        })
      } else if (item.key === 'check') {
        let useStatus = gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE && item.status === $enums.SKILL_STATUS.AVAILABLE
        if(checkAction){
          useStatus = false
        }
        tmp.push({
          key: item.key,
          name: item.name,
          canUse: useStatus , // 预言家查验，只要存活可一直使用
          show: gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE && item.status === $enums.SKILL_STATUS.AVAILABLE, // (是否展示在前端)存活且轮到自己行动，所以预言家在狼人之前行动，避免刚好被刀（第一晚可报查验，之后用不用也无法开口了），导致当晚技能用不了
        })
      } else if (item.key === 'antidote') {
        let useStatus = gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE && currentPlayer.status === $enums.SKILL_STATUS.AVAILABLE && item.status === $enums.SKILL_STATUS.AVAILABLE
        if(saveAction){
          useStatus = false
        }
        if(poisonAction){
          useStatus = false
        }
        if(gameInstance.witchSaveSelf === $enums.GAME_WITCH_SAVE_SELF.NO_SAVE_SELF){
          useStatus = false
        }

        if(gameInstance.witchSaveSelf === $enums.GAME_WITCH_SAVE_SELF.SAVE_ONLY_FIRST_NIGHT && killAction && gameInstance.day !== 1){
          // 首页之后不能自救
          if(currentPlayer.username === killAction.to){
            useStatus = false
          }
        }
        if(!killAction){
          useStatus = false
        }
        tmp.push({
          key: item.key,
          name: item.name,
          canUse: useStatus,
          show: gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE, // (是否展示在前端)存活且轮到自己行动
        })
      } else if (item.key === 'poison') {
        let useStatus = gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE && item.status === $enums.SKILL_STATUS.AVAILABLE
        if(saveAction){
          useStatus = false
        }
        if(poisonAction){
          useStatus = false
        }
        tmp.push({
          key: item.key,
          name: item.name,
          canUse: useStatus,
          show: gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE, // (是否展示在前端)存活且轮到自己行动
        })
      } else if (item.key === 'shoot') {
        const computeHunterSkill = (stage) => {
          if(item.status === $enums.SKILL_STATUS.UNAVAILABLE){
            return false
          }
          if(stage === $enums.GAME_STAGE.AFTER_NIGHT && currentPlayer.status === $enums.PLAYER_STATUS.DEAD){
            // 经过了晚上的洗礼，如果死亡
            return currentPlayer.outReason !== 'poison'
          }
          return stage === $enums.PLAYER_STATUS.EXILE_FINISH_STAGE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE;
        }
        tmp.push({
          key: item.key,
          name: item.name,
          canUse: computeHunterSkill(gameInstance.stage), // 猎人晚上不死于毒药可开枪, 被投出去可开枪
          show: (gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT || gameInstance.stage === $enums.PLAYER_STATUS.EXILE_FINISH_STAGE) && item.status === $enums.SKILL_STATUS.AVAILABLE, // 是否展示在前端
        })
      }
    })
    return $helper.wrapResult(true, tmp)
  }

  /**
   * 获取游戏公告信息
   * @returns {Promise<{result}>}
   */
  async getBroadcastInfo(id) {
    const { service, app } = this
    const { $helper, $model, $constants, $enums } = app
    const { game, gameTag } = $model
    const { broadcastMap } = $constants
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    if(gameInstance.status === $enums.GAME_STATUS.FINISHED){
      let info = []
      info.push({text: '游戏结束！', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: gameInstance.winner === $enums.GAME_CAMP.WOLF ? '狼人阵营' : '好人阵营', level: gameInstance.winner === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN})
      info.push({text: '胜利！', level: $enums.TEXT_COLOR.BLACK})
      return $helper.wrapResult(true, info)
    }
    if(gameInstance.status === $enums.GAME_STATUS.EXCEPTION){
      let info = []
      info.push({text: '房主结束了该场游戏，游戏已', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '结束！', level: $enums.TEXT_COLOR.RED})
      return $helper.wrapResult(true, info)
    }
    if(gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE && gameInstance.day === $enums.GAME_DAY.FIRST_DAY) {
      return $helper.wrapResult(true, broadcastMap['1-0'])
    }

    if(gameInstance.stage === $enums.GAME_STAGE.READY) {
      return $helper.wrapResult(true, broadcastMap['*-0'])
    }

    if(gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE) {
      return $helper.wrapResult(true, broadcastMap['*-1'])
    }

    if(gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE){
      return $helper.wrapResult(true, broadcastMap['*-2'])
    }

    if(gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE){
      return $helper.wrapResult(true, broadcastMap['*-3'])
    }

    if(gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT){
      let diePlayer = await service.baseService.query(gameTag, {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: { $in: [$enums.GAME_STAGE.WITCH_STAGE, $enums.GAME_STAGE.AFTER_NIGHT]}, // 阶段
        mode: 1
      }, {}, { sort: { position: 1}})
      if(!diePlayer || diePlayer.length < 1){
        let info = []
        info.push({text: '昨天晚上是', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '平安夜', level: $enums.TEXT_COLOR.GREEN})
        return $helper.wrapResult(true, info)
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
        if(gameInstance.day === $enums.GAME_DAY.FIRST_DAY){
          // 第一天死亡有遗言
          info.push({text: '，且第一晚死亡有', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '遗言', level: $enums.TEXT_COLOR.RED})
        } else {
          info.push({text: '，没有', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '遗言', level: $enums.TEXT_COLOR.RED})
        }
        return $helper.wrapResult(true, info)
      }
    }

    if(gameInstance.stage === $enums.GAME_STAGE.SPEAK_STAGE){
      let pkOrder = await service.baseService.queryOne(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, desc: 'pkOrder', mode: 2})
      if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && pkOrder){
        let info = []
        info.push({text:'进入', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:'pk', level: $enums.TEXT_COLOR.RED})
        info.push({text:'环节，由', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '' + pkOrder.position + '号玩家（' + pkOrder.name + '）', level:$enums.TEXT_COLOR.RED})
        info.push({text:'先开始发言，顺序为：', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:order.value === 'asc' ? '正向' : '逆向', level: $enums.TEXT_COLOR.RED})
        return $helper.wrapResult(true, info)
      }
      let order = await service.baseService.queryOne(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, desc: 'speakOrder', mode: 2})
      let info = []
      info.push({text:'进入发言环节，从', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '' + order.position + '号玩家（' + order.name + '）', level:$enums.TEXT_COLOR.RED})
      info.push({text:'开始发言，顺序为：', level: $enums.TEXT_COLOR.BLACK})
      info.push({text:order.value === 'asc' ? '正向' : '逆向', level: $enums.TEXT_COLOR.RED})
      return $helper.wrapResult(true, info)
    }

    if(gameInstance.stage === $enums.GAME_STAGE.VOTE_STAGE){
      return $helper.wrapResult(true, broadcastMap['*-6'])
    }
    if(gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
      return $helper.wrapResult(true, broadcastMap['*-6.5'])
    }

    if(gameInstance.stage === $enums.GAME_STAGE.EXILE_FINISH_STAGE){
      let stage = $enums.GAME_STAGE.VOTE_STAGE
      let pkTag = await service.baseService.queryOne(gameTag, {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        mode: 3,
        desc: 'pkPlayer'
      })
      if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && pkTag){
        // 有pk阶段
        stage = $enums.GAME_STAGE.VOTE_PK_STAGE
      }

      let voteTag = await service.baseService.queryOne(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage: stage, mode: 1})
      if(!voteTag){
        let info = []
        info.push({text:'平票，今天没有玩家出局，没有遗言', level: $enums.TEXT_COLOR.BLACK})
        return $helper.wrapResult(true, info)
      } else {
        let info = []
        info.push({text:'' + voteTag.position + '号玩家（' + voteTag.name + '）', level: $enums.TEXT_COLOR.RED})
        info.push({text:'被投票', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:'出局', level: $enums.TEXT_COLOR.RED})
        info.push({text:'，等待玩家发动技能', level: $enums.TEXT_COLOR.BLACK})
        info.push({text:'，等待玩家发表遗言。', level: $enums.TEXT_COLOR.BLACK})
        return $helper.wrapResult(true, info)
      }
    }
    return $helper.wrapResult(true, [])
  }

  /**
   * 获取每个玩家独有的系统提示(小贴士)
   * @returns {Promise<{result}>}
   */
  async getSystemTips  (id) {
    const { service, app } = this
    const { $helper, $model, $support, $enums } = app
    const { game, player, action, room } = $model

    const isBeforeVoteStage = (stage) => {
      return stage === $enums.GAME_STAGE.PREDICTOR_STAGE
        || stage === $enums.GAME_STAGE.WOLF_STAGE
        || stage === $enums.GAME_STAGE.WITCH_STAGE
        || stage === $enums.GAME_STAGE.AFTER_NIGHT
    }

    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)
    if(isOb){
      return $helper.wrapResult(true, [])
    }

    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})
    if(gameInstance.status === $enums.GAME_STATUS.FINISHED){
      let info = []
      info.push({text: '游戏结束！', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: gameInstance.winner === $enums.GAME_CAMP.WOLF ? '狼人阵营' : '好人阵营', level: gameInstance.winner === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN})
      info.push({text: '胜利！', level: $enums.TEXT_COLOR.BLACK})
      return $helper.wrapResult(true, info)
    }
    if(currentPlayer.role === 'predictor' && isBeforeVoteStage(gameInstance.stage)){
      // 允许在投票前显示预言家当晚的查验信息
      let checkAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.PREDICTOR_STAGE, action: 'check'})
      if(!checkAction){
        if(gameInstance.stage === $enums.GAME_STAGE.PREDICTOR_STAGE){
          return $helper.wrapResult(true, [])
        }
        let info = []
        info.push({text: '你', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '预言家', level: $enums.TEXT_COLOR.GREEN})
        info.push({text: '今晚没有查验玩家', level: $enums.TEXT_COLOR.BLACK})
        return $helper.wrapResult(true, info)
      }
      let checkUsername = checkAction.to
      let checkPlayer = await service.baseService.queryOne(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, username: checkUsername})
      let info = []
      info.push({text: '你', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '预言家', level: $enums.TEXT_COLOR.GREEN})
      info.push({text: '今晚查验的玩家为', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: $support.getPlayerFullName(checkPlayer), level: $enums.TEXT_COLOR.RED})
      info.push({text: '他的身份为', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: checkPlayer.camp === $enums.GAME_CAMP.WOLF ? '狼人阵营' : '好人阵营', level: checkPlayer.camp === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN})
      return $helper.wrapResult(true, info)
    } else if (gameInstance.stage === $enums.GAME_STAGE.WOLF_STAGE && currentPlayer.role === 'wolf'){
      let assaultAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, from: currentPlayer.username, action: 'assault'})
      if(assaultAction && assaultAction.to){
        let assaultPlayer = await service.baseService.queryOne(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, username: assaultAction.to})
        let info = []
        info.push({text: '你今晚袭击了', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(assaultPlayer), level: $enums.TEXT_COLOR.RED})
        return $helper.wrapResult(true, info)
      } else {
        let info = []
        info.push({text: '请确认您的同伴，并讨论要袭击的玩家', level: $enums.TEXT_COLOR.GREEN})
        return $helper.wrapResult(true, info)
      }
      return $helper.wrapResult(true, [])
    } else if ((gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE || gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT) && currentPlayer.role === 'wolf') {
      let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, action: 'kill'})
      if(!killAction){
        let info = []
        info.push({text: '你们', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '狼人团队', level: $enums.TEXT_COLOR.RED})
        info.push({text: '晚上没有袭击玩家', level: $enums.TEXT_COLOR.BLACK})
        return $helper.wrapResult(true, info)
      }
      let killUsername = killAction.to
      let killPlayer = await service.baseService.queryOne(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, username: killUsername})
      let info = []
      info.push({text: '你们', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '狼人团队', level: $enums.TEXT_COLOR.RED})
      info.push({text: '晚上袭击了', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: $support.getPlayerFullName(killPlayer), level: $enums.TEXT_COLOR.GREEN})
      return $helper.wrapResult(true, info)
    } else if ((gameInstance.stage === $enums.GAME_STAGE.WITCH_STAGE) && currentPlayer.role === 'witch') {
      let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, action: 'kill'})
      if(!killAction){
        let info = []
        info.push({text: '今晚没有玩家', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '死亡', level: $enums.TEXT_COLOR.RED})
        return $helper.wrapResult(true, info)
      }
      let dieUsername = killAction.to
      let diePlayer = await service.baseService.queryOne(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, username: dieUsername})
      let currentSkills = currentPlayer.skill
      let antidoteSkill
      currentSkills.forEach(item=>{
        if(item.key === 'antidote'){
          antidoteSkill = item
        }
      })

      let info = []
      if(antidoteSkill && antidoteSkill.status === $enums.SKILL_STATUS.AVAILABLE && currentPlayer.status === $enums.PLAYER_STATUS.ALIVE){
        info.push({text: '昨晚死亡的是', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(diePlayer), level: $enums.TEXT_COLOR.RED,})
        if(killAction.to === currentPlayer.username && gameInstance.day !== $enums.GAME_DAY.FIRST_DAY && gameInstance.witchSaveSelf === $enums.GAME_WITCH_SAVE_SELF.SAVE_ONLY_FIRST_NIGHT){
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
      info.push({text: '使用', level: $enums.TEXT_COLOR.BLACK})
      info.push({text: '毒药', level: $enums.TEXT_COLOR.RED})
      info.push({text: '毒杀别的玩家', level: $enums.TEXT_COLOR.BLACK})

      let saveAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: 3, action: 'antidote'})
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
      let poisonAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, action: 'poison'})
      if(poisonAction){
        let poisonPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: poisonAction.to})
        info = []
        info.push({text: '你使用了毒药毒死了', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(poisonPlayer) , level: $enums.TEXT_COLOR.RED})
      }
      return $helper.wrapResult(true, info)
    } else if (gameInstance.stage === $enums.GAME_STAGE.AFTER_NIGHT && currentPlayer.role === 'hunter') {
      if(currentPlayer.status === $enums.PLAYER_STATUS.DEAD){
        let info = []
        info.push({text: '你已', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: '出局', level: $enums.TEXT_COLOR.RED})
        let skills = currentPlayer.skill
        let skill
        skills.forEach(item=>{
          if(item.key === 'shoot'){
            skill = item
            return
          }
        })
        if(skill && skill.status === $enums.SKILL_STATUS.UNAVAILABLE){
          // 使用过技能了
          return $helper.wrapResult(true, info)
        }
        if(currentPlayer.outReason !== 'poison'){
          info.push({text: '，你现在可以发动', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '技能', level: $enums.TEXT_COLOR.GREEN})
        } else {
          info.push({text: '，你被', level: $enums.TEXT_COLOR.BLACK})
          info.push({text: '，毒药毒死，', level: $enums.TEXT_COLOR.RED})
          info.push({text: '无法发动技能', level: $enums.TEXT_COLOR.BLACK})
        }
        return $helper.wrapResult(true, info)
      }
    } else if (gameInstance.stage === $enums.GAME_STAGE.VOTE_STAGE){
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_STAGE, from: currentPlayer.username, action: 'vote'})
      if(voteAction && voteAction.to){
        let votePlayer = await service.baseService.queryOne(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, username: voteAction.to})
        let info = []
        info.push({text: '你今天投票给', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(votePlayer), level: $enums.TEXT_COLOR.RED})
        return $helper.wrapResult(true, info)
      }
      return $helper.wrapResult(true, [])
    }
    else if (gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId,day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_PK_STAGE, from: currentPlayer.username, action: 'vote'})
      if(voteAction && voteAction.to){
        let votePlayer = await service.baseService.queryOne(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, username: voteAction.to})
        let info = []
        info.push({text: '你今天投票给', level: $enums.TEXT_COLOR.BLACK})
        info.push({text: $support.getPlayerFullName(votePlayer), level: $enums.TEXT_COLOR.RED})
        return $helper.wrapResult(true, info)
      }
      return $helper.wrapResult(true, [])
    }
    return $helper.wrapResult(true, [])
  }

  /**
   * 获取玩家在游戏中的动作状态
   * @returns {Promise<{result}>}
   */
  async getActionStatusInGame (id) {
    const { service, app } = this
    const { $helper, $support, $model, $enums } = app
    const { game, player, action, gameTag, room } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let currentUser = await service.baseService.userInfo()
    let roomInstance = await service.baseService.queryById(room, gameInstance.roomId)
    let isOb = $support.isOb(roomInstance, currentUser.username)
    if(isOb){
      return $helper.wrapResult(true, [])
    }

    let currentPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: currentUser.username})

    if(gameInstance.stage === $enums.GAME_STAGE.VOTE_STAGE) {
      let useStatus = currentPlayer.status === $enums.PLAYER_STATUS.ALIVE
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_STAGE, from: currentPlayer.username, action: 'vote'})
      if(voteAction){
        // 您已经投过票了
        useStatus = false
      }
      let actions = [
        {
          key: 'vote',
          name: '投票',
          canUse: useStatus,
          show: currentPlayer.status === $enums.PLAYER_STATUS.ALIVE,
        }
      ]
      return $helper.wrapResult(true, actions)
    } else if (gameInstance.stage === $enums.GAME_STAGE.VOTE_PK_STAGE) {
      let useStatus = currentPlayer.status === $enums.PLAYER_STATUS.ALIVE
      let voteAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.VOTE_PK_STAGE, from: currentPlayer.username, action: 'vote'})
      let pkTag = await service.baseService.queryOne(gameTag, {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        mode: 3,
        desc: 'pkPlayer'
      })
      let pkPlayer = pkTag && pkTag.value2
      if(voteAction){
        // 您已经投过票了
        useStatus = false
      }

      if(pkPlayer && pkPlayer.length > 0 && pkPlayer.includes(currentPlayer.username)){
        // 你是pk中的玩家，不允许投票
        useStatus = false
      }
      let actions = [
        {
          key: 'vote',
          name: '投票',
          canUse: useStatus,
          show: currentPlayer.status === $enums.PLAYER_STATUS.ALIVE,
        }
      ]
      return $helper.wrapResult(true, actions)
    }
    return $helper.wrapResult(true, [])
  }

  /**
   * 获取游戏是否结束 优先判断好人阵营死亡情况，在夜晚狼人先刀，所以好人和狼人都死完情况下，优先狼人团队胜利
   * @returns {Promise<{result}>}
   */
  async settleGameOver (id) {
    const { service, app } = this
    const { $helper, $model, $enums } = app

    const { game, player } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)

    let goodAlive = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, camp: $enums.GAME_CAMP.CLERIC_AND_VILLAGER, status: $enums.PLAYER_STATUS.ALIVE})
    if(!goodAlive || goodAlive.length < 1){
      // 好人全死
      return await service.gameService.setGameWin(id, $enums.GAME_CAMP.WOLF)
    }

    let villagerAlive = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, role: 'villager', status: $enums.PLAYER_STATUS.ALIVE})
    if((!villagerAlive || villagerAlive.length < 1) && gameInstance.winCondition === $enums.GAME_WIN_CONDITION.KILL_HALF_ROLE){
      // 屠边 - 村民 => 游戏结束，狼人胜利
      return await service.gameService.setGameWin(id, $enums.GAME_CAMP.WOLF)
    }

    let clericAlive = await service.baseService.query(player,{
      gameId: gameInstance._id,
      roomId: gameInstance.roomId,
      role: { $in: ['predictor', 'witch', 'hunter']},
      status: $enums.PLAYER_STATUS.ALIVE
    })

    if((!clericAlive || clericAlive.length < 1) && gameInstance.winCondition === $enums.GAME_WIN_CONDITION.KILL_HALF_ROLE){
      // 屠边 - 屠神 => 游戏结束，狼人胜利
      return await service.gameService.setGameWin(id, $enums.GAME_CAMP.WOLF)
    }

    let wolfAlive = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, role: 'wolf', status: $enums.PLAYER_STATUS.ALIVE})
    if(!wolfAlive || wolfAlive.length < 1){
      // 狼人死完 => 游戏结束，好人胜利
      return await service.gameService.setGameWin(id, $enums.GAME_CAMP.CLERIC_AND_VILLAGER)
    }
    // 游戏未结束
    return $helper.wrapResult(true , 'N')
  }

  /**
   * 游戏赢家
   * @param id
   * @param camp
   * @returns {Promise<{result}>}
   */
  async setGameWin (id, camp) {
    const { service, app } = this
    const { $helper, $model, $ws, $enums } = app
    const { game, record } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    if(camp === null || camp === undefined){
      return $helper.wrapResult(false, '游戏赢家为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    await service.baseService.updateById(game, gameInstance._id,{status: $enums.GAME_STATUS.FINISHED, winner: camp})
    let recordObject = {
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
            text: camp === $enums.GAME_CAMP.WOLF ? '狼人阵营' : '好人阵营',
            level: camp === $enums.GAME_CAMP.WOLF ? $enums.TEXT_COLOR.RED : $enums.TEXT_COLOR.GREEN,
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
    await service.baseService.save(record, recordObject)
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + gameInstance.roomId
      if(conn.path === url){
        conn.sendText('gameOver')
      }
    })
    return $helper.wrapResult(true , 'Y')
  }

  /**
   * 进入下一个阶段
   * @param gameId
   * @returns {Promise<{result}>}
   */
  async moveToNextStage (gameId) {
    const { service, app } = this
    const { $helper, $model, $ws, $nodeCache, $enums, $constants } = app

    const { game, record } = $model

    if(!gameId || gameId === ''){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }

    let gameInstance = await service.baseService.queryById(game, gameId)
    let stage = gameInstance.stage

    // todo: 之后用栈来做，平票pk的阶段可以临时推入栈
    let nextStage = stage + 1 // 下一个要进入的阶段
    if(nextStage > 7) {
      // 进入第二天流程
      nextStage = 0
    }

    if(stage === $enums.GAME_STAGE.PREDICTOR_STAGE){
      // 结算预言家是否空过
      let settleResult = await service.stageService.predictorStage(gameInstance._id)
      if(!settleResult.result){
        return settleResult
      }
    } else if(stage === $enums.GAME_STAGE.WOLF_STAGE){
      // 结算狼人的实际击杀目标
      let settleResult = await service.stageService.wolfStage(gameInstance._id)
      if(!settleResult.result){
        return settleResult
      }
    } else if(stage === $enums.GAME_STAGE.WITCH_STAGE){
      // 结算女巫的操作结果
      let settleResult = await service.stageService.witchStage(gameInstance._id)
      if(!settleResult.result){
        return settleResult
      }
      await service.gameService.settleGameOver(gameInstance._id)
    } else if (stage === $enums.GAME_STAGE.AFTER_NIGHT) {
      // 天亮 => 发言环节 , 生成发言顺序等信息
      let settleResult = await service.stageService.preSpeakStage(gameInstance._id)
      if(!settleResult.result){
        return settleResult
      }
    } else if (stage === $enums.GAME_STAGE.VOTE_STAGE) {
      // 投票 => 遗言/pk加赛 ,需要整理票型， 结算死亡玩家
      let settleResult = await service.stageService.voteStage(gameInstance._id, $enums.GAME_STAGE.VOTE_STAGE)
      if(!settleResult.result){
        return settleResult
      }
      if(settleResult.result && settleResult.data === 'Y'){
        // 需要pk
        nextStage = $enums.GAME_STAGE.VOTE_PK_STAGE
      }
    } else if (stage === $enums.GAME_STAGE.VOTE_PK_STAGE){
      // 投票pk加赛 => 遗言 ,需要整理票型， 结算死亡玩家
      let settleResult = await service.stageService.voteStage(gameInstance._id, $enums.GAME_STAGE.VOTE_PK_STAGE)
      if(!settleResult.result){
        return settleResult
      }
      nextStage = $enums.GAME_STAGE.EXILE_FINISH_STAGE
    }

    // 修改游戏状态
    let update = {stage: nextStage}
    if(nextStage === 0){
      update.day = gameInstance.day + 1
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day + 1,
        stage: gameInstance.stage,
        view: [],
        isCommon: 1,
        isTitle: 0,
        content: {
          text: '天黑请闭眼',
          type: 'text',
          level: $enums.TEXT_COLOR.BLACK,
        }
      }
      await service.baseService.save(record, recordObject)
    }
    await service.baseService.updateById(game, gameInstance._id, update)
    $ws.connections.forEach(function (conn) {
      let url = '/lrs/' + gameInstance.roomId
      if(conn.path === url){
        conn.sendText('stageChange')
      }
    })

    // 倒计时 timer
    let updateGame = await service.baseService.queryById(game, gameId)
    if(updateGame.stage === $enums.GAME_STAGE.PREDICTOR_STAGE || updateGame.stage === $enums.GAME_STAGE.WOLF_STAGE || updateGame.stage === $enums.GAME_STAGE.WITCH_STAGE){
      // 预言家
      let t = updateGame.stage === $enums.GAME_STAGE.PREDICTOR_STAGE ? gameInstance.p1 : $constants.predictor_timer
      if(updateGame.stage === $enums.GAME_STAGE.WOLF_STAGE){
        t = gameInstance.p2 || $constants.wolf_timer
      }
      if(updateGame.stage === updateGame.stage === $enums.GAME_STAGE.WITCH_STAGE){
        t = gameInstance.p3 || $constants.witch_timer
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
    } else {
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
    }

    return $helper.wrapResult(true,'Y')
  }
}
module.exports = gameService;
