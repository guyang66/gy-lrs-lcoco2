const BaseClass = require('../base/BaseClass')

class stageService extends BaseClass{
  /**
   * 预言家阶段结算
   * @param id
   * @returns {Promise<{result}>}
   */
  async predictorStage(id) {
    const { service, app } = this
    const { $helper, $model, $support } = app
    const { game, player, action, record } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let checkAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: 1, action: 'check'})
    if(!checkAction) {
      // 空过
      let predictorPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, role: 'predictor'})
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 0,
        isTitle: 0,
        content: {
          type: 'action',
          key: 'jump',
          text: $support.getPlayerFullName(predictorPlayer) + '，预言家空验',
          actionName: '空验',
          level: 6,
          from: {
            username: predictorPlayer.username,
            name: predictorPlayer.name,
            position: predictorPlayer.position,
            role: predictorPlayer.role,
            camp: predictorPlayer.camp,
            status: predictorPlayer.status
          },
          to: {
            username: null,
            name: null,
          }
        }
      }
      await service.baseService.save(record, recordObject)
    }
    return $helper.wrapResult(true, '')
  }

  /**
   * 狼人行动结束后的结算 —— 计算被刀次数最多的玩家作为狼人夜晚击杀的目标（如果平票则随机抽取一位玩家死亡）
   * @param id
   * @returns {Promise<{result}>}
   */
  async wolfStage(id) {
    const { service, app} = this
    const { $helper, $model, $support } = app

    const { game, player, action, record } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let assaultActionList = await service.baseService.query(action, {roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage: 2, action: 'assault'})
    if(!assaultActionList || assaultActionList.length < 1){
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 0,
        isTitle: 0,
        content: {
          type: 'action',
          key: 'jump',
          text: '狼人空刀',
          actionName: '空刀',
          level: 5,
          from: {
            username: null,
            name: '狼人',
            position: null,
            role: 'wolf',
            camp: 0
          },
          to: {
            username: null,
            name: null,
          }
        }
      }
      await service.baseService.save(record, recordObject)
      return $helper.wrapResult(true, '')
    }

    // 计算袭击真正需要死亡的玩家，票数多的玩家死亡，平票则随机抽选一个死亡
    let usernameList = []
    assaultActionList.forEach(item=>{
      usernameList.push(item.to)
    })
    // 找到他们中被杀次数最多的
    let target = $helper.findMaxInArray(usernameList)
    let actionObject = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      from: 'wolf',
      to: target,
      action: 'kill',
    }
    await service.baseService.save(action, actionObject)
    let diePlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: target})
    let recordObject = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      view: [],
      isCommon: 0,
      isTitle: 0,
      content: {
        text: '狼人今晚袭击了：' + $support.getPlayerFullName(diePlayer),
        type: 'action',
        key: 'kill',
        actionName: '袭击',
        level: 2,
        from: {
          username: null,
          name: '狼人',
          position: null,
          role: 'wolf',
          camp: 0,
        },
        to: {
          username: diePlayer.username,
          name: diePlayer.name,
          position: diePlayer.position,
          role: diePlayer.role,
          camp: diePlayer.camp,
        }
      }
    }
    await service.baseService.save(record, recordObject)
    return $helper.wrapResult(true, '')
  }

  /**
   * 女巫行动后的结算 - 结算狼人击杀、解药、毒药三者综合后的结果
   * @param id
   * @returns {Promise<{result}>}
   */
  async witchStage (id) {
    const { service, app} = this
    const { $helper, $model, $support } = app

    const { game, player, action, record, gameTag } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    // 女巫回合 => 天亮了, 需要结算死亡玩家和游戏是否结束
    let killAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: 2, action: 'kill'})
    let saveAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: 3, action: 'antidote'})
    if(killAction && killAction.to){
      let killTarget = killAction.to
      let killPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: killTarget})
      if(!saveAction){
        // 女巫没有救人，不管他是没有使用技能，还是没有解药, 注定死亡一个
        let tagObject = {
          roomId: gameInstance.roomId,
          gameId: gameInstance._id,
          day: gameInstance.day,
          stage: gameInstance.stage,
          dayStatus: gameInstance.stage < 4 ? 1 : 2,
          desc: 'assault',
          mode: 1,
          target: killPlayer.username,
          name: killPlayer.name,
          position: killPlayer.position
        }
        await service.baseService.save(gameTag, tagObject)
        // 注册该玩家的死亡
        await service.baseService.updateOne(player,{ roomId: gameInstance.roomId, gameId: gameInstance._id, username: killPlayer.username}, { status: 0 , outReason: 'assault'})
        if(killPlayer.role === 'hunter'){
          // 修改它的技能状态
          let skills = killPlayer.skill
          let newSkillStatus = []
          skills.forEach(item=>{
            if(item.key === 'shoot'){
              newSkillStatus.push({
                name: item.name,
                key: item.key,
                status: 1
              })
            } else {
              newSkillStatus.push(item)
            }
          })
          await service.baseService.updateById(player, killPlayer._id, {
            skill: newSkillStatus
          })
        }
      }
      // 女巫救人，在女巫使用技能时结算。
    }

    // 结算女巫毒
    // 注意：不能在女巫用毒后就注册玩家的死亡，会造成还在女巫回合，就能看到谁已经死亡了(这样就知道死亡的玩家是被毒死)，需要滞后
    let poisonAction = await service.baseService.queryOne(action,{gameId: gameInstance._id, roomId: gameInstance.roomId, day: gameInstance.day, stage: 3, action: 'poison'})
    if(poisonAction && poisonAction.to){
      let poisonPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: poisonAction.to})
      let witchPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: poisonAction.from})
      // 注册玩家死亡
      await service.baseService.updateById(player, poisonPlayer._id,{status: 0, outReason: 'poison'})
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 0,
        isTitle: 0,
        content: {
          type: 'action',
          key: 'poison',
          text: $support.getPlayerFullName(witchPlayer) + '使用毒药毒死了' + $support.getPlayerFullName(poisonPlayer),
          actionName: '毒药',
          level: 2,
          from: {
            username: witchPlayer.username,
            name: witchPlayer.name,
            position: witchPlayer.position,
            role: witchPlayer.role,
            camp: witchPlayer.camp
          },
          to: {
            username: poisonPlayer.username,
            name: poisonPlayer.name,
            position: poisonPlayer.position,
            role: poisonPlayer.role,
            camp: poisonPlayer.camp
          }
        }
      }
      await service.baseService.save(record, recordObject)

      let tagObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        dayStatus: gameInstance.stage < 4 ? 1 : 2,
        desc: 'poison',
        mode: 1,
        target: poisonPlayer.username,
        name: poisonPlayer.name,
        position: poisonPlayer.position
      }
      await service.baseService.save(gameTag, tagObject)
    }

    if(!saveAction && !poisonAction){
      // 空过,找女巫
      let witchPlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, role: 'witch'})

      // 查女巫的技能
      let skill = witchPlayer.skill
      let has = false
      skill.forEach(item=>{
        if(item.status === 1){
          has = true
        }
      })
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 0,
        isTitle: 0,
        content: {
          type: 'action',
          key: 'jump',
          text: $support.getPlayerFullName(witchPlayer) + '，女巫空过',
          actionName: has ? '空过' : '药已用完',
          level: 5,
          from: {
            username: witchPlayer.username,
            name: witchPlayer.name,
            status: (killAction && killAction.to === witchPlayer.username) ? 1 : witchPlayer.status,
            position: witchPlayer.position,
            role: witchPlayer.role,
            camp: witchPlayer.camp
          },
          to: {
            username: null,
            name: null,
          }
        }
      }
      await service.baseService.save(record, recordObject)
    }

    let gameRecord = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      stage: gameInstance.stage,
      day: gameInstance.day,
      content: {
        text: '天亮了！',
        type: 'text',
        level: 4,
      },
      isCommon: 1,
      isTitle: 0
    }
    await service.baseService.save(record, gameRecord)

    // 结算所有的死亡玩家
    let diePlayerList = await service.baseService.query(gameTag,{roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage:{ $in: [2, 3]}, mode: 1})
    if(!diePlayerList || diePlayerList.length < 1){
      let peaceRecord = {
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
          level: 3,
        }
      }
      await service.baseService.save(record, peaceRecord)
    } else {
      let dieMap = {} // 去重，狼人和女巫杀同一个人则只显示一次即可
      for(let i = 0; i < diePlayerList.length; i++){
        if(dieMap[diePlayerList[i].target]){
          continue
        }
        let diePlayer = await service.baseService.queryOne(player,{roomId: gameInstance.roomId, gameId: gameInstance._id, username: diePlayerList[i].target})
        let deadRecord = {
          roomId: gameInstance.roomId,
          gameId: gameInstance._id,
          day: gameInstance.day,
          stage: gameInstance.stage,
          view: [],
          isCommon: 1,
          isTitle: 0,
          content: {
            type: 'action',
            action: 'die',
            actionName: '死亡',
            level: 2,
            from: {
              username: diePlayer.username,
              name: diePlayer.name,
              position: diePlayer.position,
              role: diePlayer.role,
              camp: diePlayer.camp
            },
            to: {
              role: 'out',
              name: '出局'
            }
          }
        }
        await service.baseService.save(record, deadRecord)
        dieMap[diePlayerList[i].target] = diePlayer
      }
    }
    return $helper.wrapResult(true, '')
  }

  /**
   * 进入发言环节
   * @param id
   * @returns {Promise<{result}>}
   */
  async preSpeakStage (id) {
    const { service, app } = this
    const { $helper, $model, $support } = app
    const { game, player, record, gameTag } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)
    let alivePlayer = await service.baseService.query(player, {gameId: gameInstance._id, roomId: gameInstance.roomId, status: 1})
    let randomPosition = Math.floor(Math.random() * alivePlayer.length )
    let randomOrder = Math.floor(Math.random() * 2 ) + 1 // 随机发言顺序
    let targetPlayer = alivePlayer[randomPosition]
    let tagObject = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      dayStatus: gameInstance.stage < 4 ? 1 : 2,
      desc: 'speakOrder',
      mode: 2,
      value: randomOrder === 1 ? 'asc' : ' desc', // asc 上升（正序） ; desc 下降（逆序）
      target: targetPlayer.username,
      name: targetPlayer.name,
      position: targetPlayer.position
    }
    await service.baseService.save(gameTag, tagObject)
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
            text: '进入投票环节，由',
            level: 1,
          },
          {
            text: $support.getPlayerFullName(targetPlayer),
            level: 4,
          },
          {
            text: '开始发言。顺序为：',
            level: 1,
          },
          {
            text: randomOrder === 1 ? '正向' : '逆向',
            level: randomOrder === 1 ? 3 : 2,
          }
        ]
      }
    }
    await service.baseService.save(record, recordObject)
    return $helper.wrapResult(true, '')
  }

  /**
   * 投票阶段
   * @returns {Promise<void>}
   */
  async voteStage (id, stageNumber = 6) {
    const { service, app} = this
    const { $helper, $model, $support } = app
    const { game, player, record, action, gameTag } = $model
    if(!id){
      return $helper.wrapResult(false, 'gameId为空！', -1)
    }
    let gameInstance = await service.baseService.queryById(game, id)

    let needPk
    let voteActions = await service.baseService.query(action, {roomId: gameInstance.roomId, gameId: gameInstance._id, day: gameInstance.day, stage: stageNumber, action: 'vote'})
    let alivePlayers = await service.baseService.query(player,{gameId: gameInstance._id, roomId: gameInstance.roomId, status: 1},{}, {sort: { position: 1 }})

    if(stageNumber === 6.5 && gameInstance.flatTicket === 2){
      let pkTag = await service.baseService.queryOne(gameTag, {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        mode: 3,
        desc: 'pkPlayer'
      })
      let pkPlayers = pkTag ? pkTag.value2 : []
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
      let content = voteResultMap[key]
      // 排序
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
      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 1,
        isTitle: 0,
        content: {
          type: 'vote',
          actionName: '投票',
          text: voteResultString,
          action: 'vote',
          level: 4,
          from: {
            username: null,
            name: votePlayerString,
            position: null,
            role: null,
            camp: null
          },
          to: {
            username: toPlayer.username,
            name: toPlayer.position + '号（共' + content.length + '票）',
            position: toPlayer.position,
            role: null,
            camp: null
          }
        }
      }
      await service.baseService.save(record, recordObject)
    }

    // 处理弃票record
    if(abstainedPlayer && abstainedPlayer.length > 0){
      let abstainedString = ''
      for(let i =0; i < abstainedPlayer.length; i++){
        if(i !== 0){
          abstainedString = abstainedString + '、'
        }
        abstainedString = abstainedString + abstainedPlayer[i].position + '号'
      }

      let recordObject = {
        roomId: gameInstance.roomId,
        gameId: gameInstance._id,
        day: gameInstance.day,
        stage: gameInstance.stage,
        view: [],
        isCommon: 1,
        isTitle: 0,
        content: {
          type: 'vote',
          actionName: '弃票',
          text: abstainedString + '弃票',
          action: 'abstained',
          level: 5,
          from: {name: abstainedString},
          to: {
            name: '弃票',
            username: null
          }
        }
      }
      await service.baseService.save(record, recordObject)
    }

    if(!voteActions || voteActions.length < 1){
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
          level: 2,
        }
      }
      await service.baseService.save(record, recordObject)
    } else {
      let usernameList = []
      voteActions.forEach(item=>{
        usernameList.push(item.to)
      })
      let maxCount = $helper.findMaxValue(usernameList)
      if(maxCount.length < 1){
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
            level: 2,
          }
        }
        await service.baseService.save(record, recordObject)
      } else if(maxCount.length ===  1){
        let max = maxCount[0]
        let votePlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: max})
        let recordObject = {
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
            action: 'out',
            text: $support.getPlayerFullName(votePlayer) + '获得最高票数，出局！',
            level: 2,
            from: {
              name: votePlayer.name,
              username: votePlayer.username,
              position: votePlayer.position,
              role: votePlayer.role,
              camp: votePlayer.camp
            },
            to: {
              role: 'exile',
              name: '放逐出局'
            }
          }
        }
        await service.baseService.save(record, recordObject)

        // 注册死亡
        let tagObject = {
          roomId: gameInstance.roomId,
          gameId: gameInstance._id,
          day: gameInstance.day,
          stage: gameInstance.stage,
          dayStatus: gameInstance.stage < 4 ? 1 : 2,
          desc: 'vote',
          mode: 1,
          target: votePlayer.username,
          name: votePlayer.name,
          position: votePlayer.position
        }
        await service.baseService.save(gameTag, tagObject)
        await service.baseService.updateById(player, votePlayer._id,{status: 0, outReason: 'vote'})
        if(votePlayer.role === 'hunter'){
          // 修改猎人的技能状态
          let skills = votePlayer.skill
          let newSkillStatus = []
          skills.forEach(item=>{
            if(item.key === 'shoot'){
              newSkillStatus.push({
                name: item.name,
                key: item.key,
                status: 1
              })
            } else {
              newSkillStatus.push(item)
            }
          })
          await service.baseService.updateById(player, votePlayer._id, {
            skill: newSkillStatus
          })
        }
      } else {
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
                text: '平票',
                level: 2,
              },
              {
                text: '，没有玩家出局',
                level: 1,
              }
            ]
          }
        }
        await service.baseService.save(record, recordObject)

        // 需要pk的逻辑
        if(gameInstance.flatTicket === 2 && stageNumber === 6){
          // 平票加赛的处理
          let num = Math.floor(Math.random() * maxCount.length)
          let randomOrder = Math.floor(Math.random() * 2 ) + 1 // 1到2的随机数
          let targetPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: maxCount[num]})
          let tagObject = {
            roomId: gameInstance.roomId,
            gameId: gameInstance._id,
            day: gameInstance.day,
            stage: gameInstance.stage,
            dayStatus: gameInstance.stage < 4 ? 1 : 2,
            desc: 'pkOrder',
            mode: 2,
            value: randomOrder === 1 ? 'asc' : ' desc', // asc 上升（正序） ; desc 下降（逆序）
            target: targetPlayer.username,
            name: targetPlayer.name,
            position: targetPlayer.position
          }
          await service.baseService.save(gameTag, tagObject)

          let pkPlayerString = ''
          for(let i = 0; i < maxCount.length; i ++ ){
            let pkPlayer = await service.baseService.queryOne(player, {roomId: gameInstance.roomId, gameId: gameInstance._id, username: maxCount[i]})
            pkPlayerString = pkPlayerString + $support.getPlayerFullName(pkPlayer)
            if(i < maxCount.length - 1){
              pkPlayerString = pkPlayerString + '、'
            }
          }
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
                  text: '进入',
                  level: 1,
                },
                {
                  text: '加赛pk',
                  level: 2,
                },
                {
                  text: '环节，',
                  level: 1,
                },
                {
                  text: pkPlayerString,
                  level: 3,
                },
                {
                  text: '进行pk',
                  level: 2,
                },
                {
                  text: '，由',
                  level: 1,
                },
                {
                  text: $support.getPlayerFullName(targetPlayer),
                  level: 4,
                },
                {
                  text: '先开始发言。顺序为：',
                  level: 1,
                },
                {
                  text: randomOrder === 1 ? '正向' : '逆向',
                  level: randomOrder === 1 ? 3 : 2,
                }
              ]
            }
          }
          await service.baseService.save(record, recordObject)

          let pkTagObject = {
            roomId: gameInstance.roomId,
            gameId: gameInstance._id,
            day: gameInstance.day,
            stage: gameInstance.stage,
            dayStatus: gameInstance.stage < 4 ? 1 : 2,
            desc: 'pkPlayer',
            mode: 3,
            value2: maxCount,
            target: 'pkPlayer',
          }
          await service.baseService.save(gameTag, pkTagObject)
          // 进入到6.5阶段（pk阶段）
          needPk = 'Y'
        }
      }
    }

    await service.gameService.settleGameOver(gameInstance._id)
    return $helper.wrapResult(true, needPk)
  }
}
module.exports = stageService;
