const Stack = require('../base/StackClass')
module.exports = app => ({

  /**
   * 获取玩家座位号
   * @param player
   * @returns {string}
   */
  getPlayerNumberString (player) {
    if(!player){
      return ''
    }
    return '' + player.position + '号'
  },

  /**
   * 获取玩家完整名字信息
   * @param player
   * @param name
   * @returns {string}
   */
  getPlayerFullName (player, name) {
    if(!player){
      return ''
    }
    if(!player.username){
      return  ''
    }
    return '' + player.position + '号（' + (name ? name : player.name) + ')'
  },

  getVisionKey (from, to) {
    const { $enums } = app
    if(from.number === to.number){
      // 自己对自己的视野为全知
      return 2
    }
    let fromRole = from.role
    let toRole = to.role
    if(fromRole === $enums.GAME_ROLE.WOLF && toRole === $enums.GAME_ROLE.WOLF){
      // 狼人拥有对同伴的完全视野
      return 2
    }
    // 村民、猎人、女巫没有视野
    // 预言家只有查验之后有视野
    return 0
  },

  /**
   * 获取游戏赢家阵营
   * @param gameInstance
   * @returns {string}
   */
  getGameWinner (gameInstance) {
    if(gameInstance && gameInstance.winner > -1){
      return '胜利者为：' + gameInstance.winnerString
    }
    return '胜利者为：无效的游戏结果'
  },

  /**
   * 是否是观战者
   * @param roomInstance
   * @param username
   * @returns {boolean}
   */
  isOb (roomInstance, username) {
    if(!roomInstance || !username){
      return false
    }
    let obList = roomInstance ? roomInstance.ob : []
    if(!obList || obList.length < 1){
      return false
    }
    return obList.includes(username)
  },

  /**
   * 获取游戏stage栈
   * @param gameInstance
   * @returns {StackClass}
   */
  getStageStack(gameInstance) {
    if(!gameInstance){
      return new Stack()
    }
    return new Stack(gameInstance.stageStack)
  },

  /**
   * 获取白天还是黑夜
   * @param stage
   * @param useString
   * @returns {string|string|*}
   */
  getDayAndNightString (stage, useString = false) {
    const { $constants, $enums } = app
    const { STAGE_MAP } = $constants
    if(stage === undefined || stage === null || stage === ''){
      return ''
    }
    let target = STAGE_MAP[stage]
    if(!target){
      return ''
    }
    if(useString){
      return target.day === $enums.GAME_DAY_NIGHT.IS_NIGHT ? '晚上' : '白天'
    }
    return target.day
  },

  /**
   * 根据角色获取对应阵营
   * @param role
   * @param useString
   * @returns {null|*}
   */
  getCampByRole (role, useString = false) {
    const { $constants } = app
    const { PLAYER_ROLE_MAP } = $constants
    if(!role){
      return null
    }
    let target = PLAYER_ROLE_MAP[role]
    if(!target){
      return null
    }
    return useString ? target.campName : target.camp
  },

  /**
   * 获取角色名字
   * @param role
   * @returns {null|*}
   */
  getRoleName (role) {
    const { $constants } = app
    const { PLAYER_ROLE_MAP } = $constants
    if(!role){
      return null
    }
    let target = PLAYER_ROLE_MAP[role]
    if(!target){
      return null
    }
    return target.name
  },

  /**
   * 获取指定技能技能
   * @param key
   * @param skills
   * @returns {null|*}
   */
  getSkillByKey (key, skills) {
    if(!key || key === ''){
      return null
    }
    return skills.find(item=>{
      return item.key === key
    })
  }
})
