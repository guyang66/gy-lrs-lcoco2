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
    return '' + player.position + '号（' + (name ? name : player.name) + ')'
  },

  getVisionKey (from, to) {
    if(from.number === to.number){
      // 自己对自己的视野为全知
      return 2
    }
    let fromRole = from.role
    let toRole = to.role
    if(fromRole === 'wolf' && toRole === 'wolf'){
      // 狼人拥有对同伴的完全视野
      return 2
    }
    // 村民、猎人、女巫没有视野
    // 预言家只有查验之后有视野
    return 0
  },

  getGameWinner (gameInstance) {
    let winner
    if(gameInstance.winner !== null && gameInstance.winner !== undefined){
      winner = gameInstance.winner === 1 ? '好人阵营' : '狼人阵营'
    }
    return  winner ? '胜利者为：' + winner : ''
  }
})
