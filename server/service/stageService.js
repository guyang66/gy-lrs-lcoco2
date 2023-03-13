const BaseClass = require('../base/BaseClass')
class stageService extends BaseClass{
  /**
   * 预言家阶段结算
   * @param gameId
   * @returns {Promise<{result}>}
   */
  async predictorStage(gameId) {
    const { service, app } = this
    const { $model, $enums } = app
    const { game, player, action } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    // 查找当天晚上的查验action
    let checkAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.PREDICTOR_STAGE, action: $enums.SKILL_ACTION_KEY.CHECK})
    if(!checkAction) {
      // 空过
      let predictorPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, role: $enums.GAME_ROLE.PREDICTOR})
      await service.recordService.emptyActionRecord(gameInstance, predictorPlayer)
    }
  }

  /**
   * 狼人行动结束后的结算 —— 计算被刀次数最多的玩家作为狼人夜晚击杀的目标（如果平票则随机抽取一位玩家死亡）
   * @param gameId
   * @returns {Promise<void>}
   */
  async wolfStage(gameId) {
    const { service, app} = this
    const { $support, $model, $enums } = app
    const { game, player, action } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let assaultActionList = await service.baseService.query(action, {roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, action: $enums.SKILL_ACTION_KEY.ASSAULT})
    if(!assaultActionList || assaultActionList.length < 1){
      await service.recordService.emptyActionRecord(gameInstance,{username: null, name: '狼人', position: null, role: 'wolf', camp: 0 })
      return
    }

    // 计算袭击真正需要死亡的玩家，票数多的玩家死亡，平票则随机抽选一个死亡
    let usernameList = []
    assaultActionList.forEach(item=>{
      usernameList.push(item.to)
    })
    // 找到他们中被杀次数最多的
    let targetUsername = $support.findMaxInArray(usernameList)
    await service.actionService.saveAction(gameInstance, $enums.SKILL_ACTION_KEY.KILL, $enums.GAME_ROLE.WOLF, targetUsername)

    let diePlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: targetUsername})
    // 狼人团队的最后击杀
    await service.recordService.wolfTeamAssaultRecord(gameInstance, diePlayer)

    // 结算有守卫的清空
    if(gameInstance.mode === $enums.GAME_MODE.STANDARD_6){

      let defendAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.GUARD_STAGE, action: $enums.SKILL_ACTION_KEY.DEFEND})
      if(!defendAction || diePlayer.username !== defendAction.to){
        // 如果空守或者守卫和刀死的不是同一个，则不是平安夜
        await service.tagService.deadTag(gameInstance, diePlayer, $enums.GAME_OUT_REASON.ASSAULT)
        await service.baseService.updateById(player, diePlayer._id,{status: $enums.PLAYER_STATUS.DEAD, outReason: $enums.GAME_OUT_REASON.ASSAULT})
      }
      // 天亮之前的结算
      await service.stageService.settleStage(gameInstance._id)
    }
  }

  /**
   * 女巫行动后的结算 - 结算狼人击杀、解药、毒药三者综合后的结果
   * @param gameId
   * @returns {Promise<{result}>}
   */
  async witchStage (gameId) {
    const { service, app} = this
    const { $model, $enums } = app

    const { game, player, action } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    // 女巫回合 => 天亮了, 需要结算死亡玩家和游戏是否结束
    let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WOLF_STAGE, action: $enums.SKILL_ACTION_KEY.KILL})
    let saveAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.WITCH_STAGE, action: $enums.SKILL_ACTION_KEY.ANTIDOTE})
    if(killAction && killAction.to){
      let killTarget = killAction.to
      let killPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: killTarget})
      if(!saveAction){
        // 女巫没有救人，不管他是没有使用技能，还是没有解药, 注定死亡一个
        await service.tagService.deadTag(gameInstance, killPlayer, $enums.GAME_OUT_REASON.ASSAULT)

        // 注册该玩家的死亡
        await service.baseService.updateOne(player,{ roomId: gameInstance.roomId, gameId: gameInstance._id, username: killPlayer.username}, { status: $enums.PLAYER_STATUS.DEAD , outReason: $enums.GAME_OUT_REASON.ASSAULT})
        if(killPlayer.role === $enums.GAME_ROLE.HUNTER){
          // 修改它的技能状态
          await service.playerService.modifyPlayerSkill(killPlayer, $enums.SKILL_ACTION_KEY.SHOOT, $enums.SKILL_STATUS.AVAILABLE)
        }
      }
      // 女巫救人，在女巫使用技能时结算。
    }

    // 结算女巫毒
    // 注意：不能在女巫用毒后就注册玩家的死亡，会造成还在女巫回合，就能看到谁已经死亡了(这样就知道死亡的玩家是被毒死，信息被泄露)，需要滞后到下一阶段
    let poisonAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage:  $enums.GAME_STAGE.WITCH_STAGE, action:  $enums.SKILL_ACTION_KEY.POISON})
    if(poisonAction && poisonAction.to){
      let poisonPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: poisonAction.to})
      let witchPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: poisonAction.from})
      // 注册玩家死亡
      await service.baseService.updateById(player, poisonPlayer._id,{status: $enums.PLAYER_STATUS.DEAD, outReason: $enums.GAME_OUT_REASON.POISON})
      await service.recordService.actionRecord(gameInstance, witchPlayer, poisonPlayer, $enums.SKILL_ACTION_KEY.POISON)
      await service.tagService.deadTag(gameInstance, poisonPlayer, $enums.GAME_OUT_REASON.POISON)
    }

    if(!saveAction && !poisonAction){
      // 空过,找女巫
      let witchPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, role: $enums.GAME_ROLE.WITCH})
      await service.recordService.emptyActionRecord(gameInstance, witchPlayer)
    }
    if(gameInstance.mode === $enums.GAME_MODE.STANDARD_9){
      // 结算所有的死亡玩家
      await service.stageService.settleStage(gameInstance._id)
    }
  }

  /**
   * 结算阶段
   * @returns {Promise<void>}
   */
  async settleStage (gameId) {
    const { service, app} = this
    const { $model, $enums } = app

    const { game, player, gameTag } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)

    await service.recordService.dayBeginRecord(gameInstance)

    // 结算所有的死亡玩家
    let diePlayerList = await service.baseService.query(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, mode: $enums.GAME_TAG_MODE.DIE})

    if(!diePlayerList || diePlayerList.length < 1){
      await service.recordService.peaceRecord(gameInstance)
    } else {
      let dieMap = {} // 去重，狼人和女巫杀同一个人则只显示一次即可
      for(let i = 0; i < diePlayerList.length; i++){
        if(dieMap[diePlayerList[i].target]){
          continue
        }
        let diePlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: diePlayerList[i].target})
        await service.recordService.deadRecord(gameInstance, diePlayer)
        dieMap[diePlayerList[i].target] = diePlayer
      }
    }
  }

  /**
   * 进入发言环节
   * @param gameId
   * @returns {Promise<{result}>}
   */
  async preSpeakStage (gameId) {
    const { service, app } = this
    const { $model, $enums } = app
    const { game, player } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    // 从存活的玩家中随机抽取一位玩家座位第一位发言
    let alivePlayer = await service.baseService.query(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, status: $enums.PLAYER_STATUS.ALIVE})
    let randomPosition = Math.floor(Math.random() * alivePlayer.length )
    let randomOrder = Math.floor(Math.random() * 2 ) + 1 // 随机发言顺序
    let targetPlayer = alivePlayer[randomPosition]
    await service.tagService.speakOrderTag(gameInstance, targetPlayer, randomOrder)
    await service.recordService.speakRecord(gameInstance, targetPlayer, randomOrder)
  }

  /**
   * 投票阶段
   * @returns {Promise<void>}
   */
  async voteStage (gameId, currentStage) {
    const { service, app} = this
    const { $helper, $model, $support, $enums } = app
    const { game, player, action } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)

    let voteActions = await service.baseService.query(action, {roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage: currentStage, action: $enums.SKILL_ACTION_KEY.VOTE})
    let alivePlayers = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, status: $enums.PLAYER_STATUS.ALIVE},{}, {sort: { position: 1 }})

    if(currentStage === $enums.GAME_STAGE.VOTE_PK_STAGE && gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK){
      let pkPlayers = await service.tagService.getTodayPkPlayer(gameInstance)
      let leftPlayers = []
      alivePlayers.forEach(item=>{
        if(!pkPlayers.includes(item.username)){
          leftPlayers.push(item)
        }
      })
      alivePlayers = leftPlayers
    }

    let voteResultMap = {}
    for(let i = 0; i < voteActions.length; i++){
      let item = voteActions[i]
      let from = item.from
      let to = item.to
      let fromPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: from})
      if(voteResultMap[to]){
        voteResultMap[to].push({username: from, position: fromPlayer.position})
      } else {
        voteResultMap[to] = [{username: from, position: fromPlayer.position}]
      }
    }

    // 找弃票玩家
    let abstainedPlayer = [] // 弃票玩家
    alivePlayers.forEach(item=>{
      let exist = voteActions.find(function (vote) {
        return vote.from === item.username
      })
      if(!exist){
        abstainedPlayer.push(item)
      }
    })

    for(let key in voteResultMap){
      await service.recordService.voteRecord(gameInstance, voteResultMap, key)
    }

    // 处理弃票record
    if(abstainedPlayer && abstainedPlayer.length > 0){
      await service.recordService.abstainedRecord(gameInstance, abstainedPlayer)
    }

    if(!voteActions || voteActions.length < 1){
      await service.recordService.abstainedRecord(gameInstance)
    } else {
      let usernameList = []
      voteActions.forEach(item=>{
        usernameList.push(item.to)
      })
      let maxCount = $helper.findMaxValue(usernameList)
      if(maxCount.length < 1){
        await service.recordService.abstainedRecord(gameInstance)
      } else if(maxCount.length ===  1){
        let max = maxCount[0]
        let votePlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: max})
        await service.recordService.exileRecord(gameInstance, votePlayer)

        // 注册死亡
        await service.tagService.deadTag(gameInstance, votePlayer, $enums.GAME_OUT_REASON.EXILE)

        await service.baseService.updateById(player, votePlayer._id,{status: $enums.PLAYER_STATUS.DEAD, outReason: $enums.GAME_OUT_REASON.VOTE})

        if(votePlayer.role === $enums.GAME_ROLE.HUNTER){
          // 修改猎人的技能状态
          await service.playerService.modifyPlayerSkill(votePlayer, $enums.SKILL_ACTION_KEY.SHOOT, $enums.SKILL_STATUS.AVAILABLE)
        }
      } else {

        await service.recordService.flatTicketRecord(gameInstance)

        // 需要pk的逻辑
        if(gameInstance.flatTicket === $enums.GAME_TICKET_FLAT.NEED_PK && currentStage === $enums.GAME_STAGE.VOTE_STAGE){
          // 平票加赛的处理
          let num = Math.floor(Math.random() * maxCount.length)
          let randomOrder = Math.floor(Math.random() * 2 ) + 1 // 1到2的随机数
          let targetPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: maxCount[num]})
          await service.tagService.speakOrderTag(gameInstance, targetPlayer, randomOrder)
          await service.recordService.votePkRecord(gameInstance, targetPlayer, maxCount, randomOrder)
          await service.tagService.votePkTag(gameInstance, maxCount)
          let gameStack = $support.getStageStack(gameInstance)
          gameStack.push($enums.GAME_STAGE.VOTE_PK_STAGE)
          await service.baseService.updateById(game, gameInstance._id, {stageStack: gameStack.getItems()})
        }
      }
    }
    await service.gameService.settleGameOver(gameInstance._id)
  }

  /**
   * 守卫阶段
   * @param gameId
   * @returns {Promise<{result}>}
   */
  async guardStage (gameId) {
    const { service, app} = this
    const { $model, $enums } = app
    const { game, player, action } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    // 查找当天晚上的守护动作
    let defendAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: $enums.GAME_STAGE.GUARD_STAGE, action: $enums.SKILL_ACTION_KEY.DEFEND})
    if(!defendAction) {
      // 空过
      let guardPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, role: $enums.GAME_ROLE.GUARD})
      await service.recordService.emptyActionRecord(gameInstance, guardPlayer)
    }
  }

  /**
   * 新的一轮
   * @param gameId
   * @returns {Promise<{result}>}
   */
  async newRound (gameId) {
    const { service, app } = this
    const { $model, $constants } = app
    const { game } = $model
    if(!gameId){
      throw new Error('gameId为空！')
    }
    let gameInstance = await service.baseService.queryById(game, gameId)
    let gameConfig = $constants.MODE[gameInstance.mode]
    let newStack = [].concat(gameConfig.STAGE).reverse()
    await service.baseService.updateById(game, gameInstance._id, {stageStack: newStack, day: gameInstance.day + 1})
  }
}
module.exports = stageService;
