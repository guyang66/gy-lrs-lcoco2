const BaseClass = require('../base/BaseClass')
class tagService extends BaseClass{

  /**
   * 死亡标记
   * @param gameInstance
   * @param diePlayer
   * @param dieDesc
   * @returns {Promise<{result}>}
   */
  async deadTag (gameInstance, diePlayer, dieDesc) {
    const { service, app } = this
    const { $model, $enums, $support } = app
    const { gameTag } = $model
    if(!gameInstance || gameInstance === ''){
      throw new Error('gameInstance为空!')
    }
    if(!diePlayer){
      throw new Error('diePlayer为空!')
    }
    let tag = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      dayStatus: $support.getDayAndNightString(gameInstance.stage),
      desc: dieDesc,
      mode: $enums.GAME_TAG_MODE.DIE,
      target: diePlayer.username,
      name: diePlayer.name,
      position: diePlayer.position
    }
    await service.baseService.save(gameTag, tag)
  }

  /**
   * 发言顺序标记
   * @param gameInstance
   * @param targetPlayer
   * @param randomOrder
   * @returns {Promise<{result}>}
   */
  async speakOrderTag (gameInstance, targetPlayer, randomOrder) {
    const { service, app } = this
    const { $model, $enums, $support } = app
    const { gameTag } = $model
    if(!gameInstance || gameInstance === ''){
      throw new Error('gameInstance为空!')
    }
    let tag = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      dayStatus: $support.getDayAndNightString(gameInstance.stage),
      desc: 'speakOrder',
      mode: $enums.GAME_TAG_MODE.SPEAK_ORDER,
      value: randomOrder === 1 ? 'asc' : ' desc', // asc 上升（正序） ; desc 下降（逆序）
      target: targetPlayer.username,
      name: targetPlayer.name,
      position: targetPlayer.position
    }
    await service.baseService.save(gameTag, tag)
  }

  /**
   * 平票pk标记
   * @param gameInstance
   * @param maxCount
   * @returns {Promise<{result}>}
   */
  async votePkTag (gameInstance, maxCount) {
    const { service, app } = this
    const { $model, $enums, $support } = app
    const { gameTag } = $model
    if(!gameInstance || gameInstance === ''){
      throw new Error('gameInstance为空!')
    }
    let tag = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      dayStatus: $support.getDayAndNightString(gameInstance.stage),
      desc: 'pkPlayer',
      mode: $enums.GAME_TAG_MODE.VOTE_PK,
      value2: maxCount,
      target: 'pkPlayer',
    }
    await service.baseService.save(gameTag, tag)
  }

  /**
   *
   * @param gameInstance
   * @returns {Promise<{result}|*|*[]>}
   */
  async getTodayPkPlayer (gameInstance) {
    const { service, app } = this
    const { $model, $enums } = app
    const { gameTag } = $model
    if(!gameInstance || gameInstance === ''){
      throw new Error('gameInstance为空!')
    }
    let pkTag = await service.baseService.queryOne(gameTag, {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      mode: $enums.GAME_TAG_MODE.VOTE_PK
    })
    return pkTag ? pkTag.value2 : []
  }

}
module.exports = tagService;
