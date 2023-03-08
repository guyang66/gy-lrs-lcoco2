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
    const { $model } = app
    const { player } = $model

    if(!targetPlayer || targetPlayer === ''){
      throw new Error('player为空！')
    }
    if(!skillKey || skillKey === ''){
      throw new Error('skillKey为空！')
    }
    if(status === null || status === undefined || status === ''){
      throw new Error('status为空！')
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
  }


}
module.exports = playerService;
