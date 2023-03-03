const BaseClass = require('../base/BaseClass')
class actionService extends BaseClass{

  /**
   * 保存action
   * @param gameInstance
   * @param actionKey
   * @param fromUsername
   * @param toUsername
   * @returns {Promise<{result}>}
   */
  async saveAction ( gameInstance, actionKey, fromUsername, toUsername) {
    const { service, app } = this
    const { $helper, $model } = app
    const { action } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    let actionResult = {
      roomId: gameInstance.roomId,
      gameId: gameInstance._id,
      day: gameInstance.day,
      stage: gameInstance.stage,
      from: fromUsername,
      to: toUsername,
      action: actionKey
    }
    await service.baseService.save(action, actionResult)
    return $helper.wrapResult(true, 'ok')
  }
}
module.exports = actionService;
