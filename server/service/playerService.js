const BaseClass = require('../base/BaseClass')
class playerService extends BaseClass{
  /**
   * 更新player技能状态
   * @param targetPlayer
   * @param skillKey
   * @param status
   * @returns {Promise<{result}>}
   */
  async modifyPlayerSkill (targetPlayer, skillKey, status) {
    const { service, app } = this
    const { $helper, $model } = app
    const { player } = $model

    if(!targetPlayer || targetPlayer === ''){
      return $helper.wrapResult(false, 'player为空！', -1)
    }
    if(!skillKey || skillKey === ''){
      return $helper.wrapResult(false, 'skillKey为空！', -1)
    }
    if(status === null || status === undefined || status === ''){
      return $helper.wrapResult(false, 'status为空！', -1)
    }

    let skills = targetPlayer.skill
    let newSkillStatus = []
    skills.forEach(item=>{
      if(item.key === skillKey){
        newSkillStatus.push({
          name: item.name,
          key: item.key,
          status: status
        })
      } else {
        newSkillStatus.push(item)
      }
    })
    await service.baseService.updateById(player, targetPlayer._id, {
      skill: newSkillStatus
    })
    return $helper.wrapResult(true, 'ok')
  }


}
module.exports = playerService;
