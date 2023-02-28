const BaseClass = require('../base/BaseClass')
class recordService extends BaseClass{
  async saveGameRecord (gameInstance, key, customRecord) {
    const { service, app } = this
    const { $helper, $model, $enums } = app
    const { record } = $model
    if(!gameInstance || gameInstance === ''){
      return $helper.wrapResult(false, 'gameInstance为空！', -1)
    }
    if(!key || key === ''){
      return $helper.wrapResult(false, 'record key为空！', -1)
    }
    let saveRecord
    switch (key) {
      case $enums.GAME_RECORD_KEY.GAME_START:
        saveRecord = {
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
        break;
      case $enums.GAME_RECORD_KEY.BEFORE_NIGHT:
        saveRecord = {
          roomId: gameInstance.roomId,
          gameId: gameInstance._id,
          content: {
            text: '天黑请闭眼',
            type: 'text',
            level: $enums.TEXT_COLOR.BLACK,
          },
          isCommon: 1,
        }
        await service.baseService.save(record, saveRecord)
        break;
      default:
    }
  }
}
module.exports = recordService;
