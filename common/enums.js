module.exports = {
  ROOM_STATUS: {
    READY: 0, // 准备中
    GOING: 1, // 游戏正在进行中
    INVALID: 2, // 已失效或房间不存在
  },
  GAME_STATUS: {
    GOING: 1, // 游戏进行中
    FINISHED: 2, // 游戏已结束
    EXCEPTION: 3, // 游戏异常
  },
  GAME_DAY_ORDER: {
    FIRST_DAY: 1, // 游戏第一天
    SECOND_DAY: 2, // 游戏第二天
  },
  GAME_DAY_NIGHT: {
    IS_NIGHT: 1, // 晚上
    IS_DAY: 2, // 白天
  },
  GAME_TICKET_FLAT: {
    NO_PK: 1, // 平票不pk，直接进入下一阶段
    NEED_PK: 2, // 平票需要pk，
  },
  GAME_WIN_CONDITION: {
    KILL_HALF_ROLE: 1, // 屠边
    KILL_ALL: 2 // 屠城
  },
  GAME_WITCH_SAVE_SELF: {
    SAVE_ALL_STAGE: 1, // 全程能自救
    SAVE_ONLY_FIRST_NIGHT: 2, // 仅第一晚能自救
    NO_SAVE_SELF: 3, // 全程不能自救
  },
  GAME_CAMP: {
    WOLF: 0, // 狼人阵营
    CLERIC_AND_VILLAGER: 1, // 神民阵营
    THIRD_CAMP: 2, // 第三方阵营
  },
  GAME_STAGE: {
    READY: 0, // 天黑请闭眼(准备开始新的一轮)
    PREDICTOR_STAGE: 1, // 预言家环节
    WOLF_STAGE: 2, // 狼人环节
    WITCH_STAGE: 3, // 女巫环节
    AFTER_NIGHT: 4, // 夜晚结束，天亮结算环节
    SPEAK_STAGE: 5, // 发言环节
    VOTE_STAGE: 6, // 投票放逐环节
    VOTE_PK_STAGE: 6.5, // 平票pk环节
    EXILE_FINISH_STAGE: 7, // 放逐结束，遗言环节
    GUARD_STAGE: 8, // 放逐结束，遗言环节
  },
  VISION_STATUS: {
    UNKNOWN: 0, // 未知
    KNOWN_CAMP: 1, // 知晓阵营
    KNOWN_ROLE: 2, // 完全知晓（知晓角色）
  },
  GAME_ROLE: {
    WOLF: 'wolf', // 狼人
    PREDICTOR: 'predictor', // 预言家
    WITCH: 'witch', // 女巫
    HUNTER: 'hunter', // 猎人
    VILLAGER: 'villager', // 村民
    GUARD: 'guard',  // 守卫
  },
  GAME_MODE: {
    STANDARD_6: 'standard_6', // 标准6人局
    STANDARD_9: 'standard_9', // 标准9人局
  },
  GAME_OUT_REASON: {
    SHOOT: 'shoot', // 被枪带走
    EXILE: 'exile', // 被放逐
    POISON: 'poison', // 被毒死
    ASSAULT: 'assault', // 被狼人刀死
    BOOM: 'boom', // 自爆自杀
  },
  SKILL_ACTION_KEY: {
    BOOM: 'boom', // 狼人自爆
    KILL: 'kill', // 狼人刀死
    ASSAULT: 'assault', // 狼人袭击/刀
    CHECK: 'check', // 预言家查验
    ANTIDOTE: 'antidote', // 女巫解药
    POISON: 'poison', // 女巫撒毒
    SHOOT: 'shoot', // 猎人开枪
    DEFEND: 'defend', // 守卫守护
    VOTE: 'vote', // 投票
    JUMP: 'jump', // 空过（未使用技能）
    DIE: 'die', // 死亡/出局
  },
  SKILL_STATUS: {
    UNAVAILABLE: 0, // 不能使用
    AVAILABLE: 1, // 可以使用
  },
  PLAYER_STATUS: {
    ALIVE: 1, // 存活/在场
    DEAD: 0 // 死亡/出局
  },
  GAME_TAG_MODE: {
    DIE: 1,
    SPEAK_ORDER: 2,
    VOTE_PK: 3
  },
  TEXT_COLOR: {
    BLACK: 1, // 黑色 #000000
    RED: 2, // 红色 #FF0000
    GREEN: 3, // 绿色 #67c23a
    BLUE: 4, // 深蓝色 #4169E1
    PINK: 5, // 深粉色 #d4237a
    ORANGE: 6 // 橙色 #FFA500
  },

}
