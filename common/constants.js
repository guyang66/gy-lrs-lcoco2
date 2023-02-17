const enums = require('./enums')
module.exports = {
  GAME_CONFIG:{
    PREDICTOR_ACTION_TIME: 30,
    WOLF_ACTION_TIME: 45,
    WITCH_ACTION_TIME: 30,
    DEFAULT_PLAYER_COUNT: 9, // 默认9人局
  },
  STANDARD_9_CONFIG: {
    MODE: 'standard_9',
    PLAYER_COUNT: 9,
    ROLE_MAP: [
      enums.GAME_ROLE.WOLF,
      enums.GAME_ROLE.WOLF,
      enums.GAME_ROLE.WOLF,
      enums.GAME_ROLE.PREDICTOR,
      enums.GAME_ROLE.WITCH,
      enums.GAME_ROLE.HUNTER,
      enums.GAME_ROLE.VILLAGER,
      enums.GAME_ROLE.VILLAGER,
      enums.GAME_ROLE.VILLAGER
    ],
    STAGE: [
      enums.GAME_STAGE.READY,
      enums.GAME_STAGE.PREDICTOR_STAGE,
      enums.GAME_STAGE.WOLF_STAGE,
      enums.GAME_STAGE.WITCH_STAGE,
      enums.GAME_STAGE.AFTER_NIGHT,
      enums.GAME_STAGE.SPEAK_STAGE,
      enums.GAME_STAGE.VOTE_STAGE,
      enums.GAME_STAGE.EXILE_FINISH_STAGE,
    ]
  },
  MODE: {
    standard_9:  {
      name: '标准9人局',
      key: 'standard_9',
      count: 9,
      ROLE_MAP: [
        enums.GAME_ROLE.WOLF,
        enums.GAME_ROLE.WOLF,
        enums.GAME_ROLE.WOLF,
        enums.GAME_ROLE.PREDICTOR,
        enums.GAME_ROLE.WITCH,
        enums.GAME_ROLE.HUNTER,
        enums.GAME_ROLE.VILLAGER,
        enums.GAME_ROLE.VILLAGER,
        enums.GAME_ROLE.VILLAGER
      ],
      STAGE: [
        enums.GAME_STAGE.READY,
        enums.GAME_STAGE.PREDICTOR_STAGE,
        enums.GAME_STAGE.WOLF_STAGE,
        enums.GAME_STAGE.WITCH_STAGE,
        enums.GAME_STAGE.AFTER_NIGHT,
        enums.GAME_STAGE.SPEAK_STAGE,
        enums.GAME_STAGE.VOTE_STAGE,
        enums.GAME_STAGE.EXILE_FINISH_STAGE,
      ]
    },
    standard_6:  {
      name: '标准6人局',
      key: 'standard_6',
      count: 6,
      content: null
    },
  },
  gameModeMap: {
    'standard_9': ['wolf', 'wolf', 'wolf', 'villager', 'villager', 'villager', 'predictor', 'witch', 'hunter']
  },
  skillMap: {
    wolf: [
      {
        name: '袭击',
        key: 'assault',
        status: enums.SKILL_STATUS.AVAILABLE
      },{
        name: '自爆',
        key: 'boom',
        status: enums.SKILL_STATUS.AVAILABLE,
      }],
    predictor: [
      {
        name: '查验',
        key: 'check',
        status: enums.SKILL_STATUS.AVAILABLE,
      }],
    witch: [
      {
        name: '解药',
        key: 'antidote',
        status: enums.SKILL_STATUS.AVAILABLE,
      },
      {
        name: '毒药',
        key: 'poison',
        status: enums.SKILL_STATUS.AVAILABLE,
      }
    ],
    hunter: [
      {
        name: '开枪',
        key: 'shoot',
        status: enums.SKILL_STATUS.UNAVAILABLE, // 猎人最开始不能开枪, 需要满足条件之后才能发动技能
      }
    ],
    villager: [],
    guard: [
      {
        name: '守护',
        key: 'defend',
        status: enums.SKILL_STATUS.AVAILABLE,
      }
    ]
  },
  playerRoleMap: {
    wolf: {
      name: '狼人',
      key: 'wolf'
    },
    villager: {
      name: '平民',
      key: 'villager'
    },
    predictor: {
      name: '预言家',
      key: 'predictor'
    },
    witch: {
      name: '女巫',
      key: 'witch'
    },
    hunter: {
      name: '猎人',
      key: 'hunter'
    },
    guard: {
      name: '守卫',
      key: 'guard'
    }
  },
  stageMap: {
    0: {
      name: '天黑请闭眼',
      key: 'ready'
    },
    1: {
      name: '预言家请行动',
      key: 'predictor'
    },
    2: {
      name: '狼人请行动',
      key: 'wolf'
    },
    3: {
      name: '女巫请行动',
      key: 'witch'
    },
    4: {
      name: '天亮了',
      key: 'actionFinish'
    },
    5: {
      name: '发言环节',
      key: 'talk'
    },
    6: {
      name: '投票环节',
      key: 'vote'
    },
    6.5: {
      name: '加赛pk环节',
      key: 'vote-pk'
    },
    7: {
      name: '遗言环节',
      key: 'lastWord'
    },
  },
  broadcastMap: {
    '1-0': [
      {
        text: '请确认自己的身份，准备开始游戏，天黑请闭眼...',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    '*-0': [
      {
        text: '天黑请闭眼...',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    '*-1': [
      {
        text: '预言家',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，选择你要查验的玩家。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    '*-2': [
      {
        text: '狼人',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，请选择袭击一位玩家。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    '*-3': [
      {
        text: '女巫',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，你有一瓶解药和毒药，请选择使用一种。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    '*-6': [
      {
        text: '开始',
        level: enums.TEXT_COLOR.BLACK
      },
      {
        text: '投票',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '，请使用投票技能进行投票，如果要',
        level: enums.TEXT_COLOR.BLACK
      },
      {
        text: '弃票',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '，则不进行任何操作，等待主持人进入下一阶段',
        level: enums.TEXT_COLOR.BLACK
      },
    ],
    '*-6.5': [
      {
        text: '开始',
        level: enums.TEXT_COLOR.BLACK
      },
      {
        text: '加赛投票',
        level: enums.TEXT_COLOR.BLUE
      },
      {
        text: '，请使用投票技能进行投票，如果要',
        level: enums.TEXT_COLOR.BLACK
      },
      {
        text: '弃票',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '，则不进行任何操作，等待主持人进入下一阶段',
        level: enums.TEXT_COLOR.BLACK
      },
    ]
  }

}
