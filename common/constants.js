const enums = require('./enums')
module.exports = {
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
      ],
      CONFIG_SETTINGS: [
        {title: '预言家行动时间（秒）：', type: 'counter', key: 'predictorActionTime'},
        {title: '狼人行动时间（秒）：', type: 'counter', key: 'wolfActionTime'},
        {title: '女巫行动时间（秒）：', type: 'counter', key: 'witchActionTime'},
        {title: '女巫解药限制：', type: 'radio', key: 'witchSaveSelf'},
        {title: '游戏胜利条件：', type: 'radio', key: 'winCondition'},
        {title: '平票处理：', type: 'radio', key: 'flatTicket'},
      ],
      CONFIG_OPTIONS: {
        witchSaveSelf: [
          { name: '均能自救', value: enums.GAME_WITCH_SAVE_SELF.SAVE_ALL_STAGE },
          { name: '首页自救', value: enums.GAME_WITCH_SAVE_SELF.SAVE_ONLY_FIRST_NIGHT },
          { name: '不能自救', value: enums.GAME_WITCH_SAVE_SELF.NO_SAVE_SELF },
        ],
        winCondition: [
          { name: '屠边', value: enums.GAME_WIN_CONDITION.KILL_HALF_ROLE },
          { name: '屠城', value: enums.GAME_WIN_CONDITION.KILL_ALL },
        ],
        flatTicket: [
          { name: '直接进入夜晚', value: enums.GAME_TICKET_FLAT.NO_PK },
          { name: '加赛pk一轮', value: enums.GAME_TICKET_FLAT.NEED_PK },
        ]
      },
      CONFIG_DEFAULT: {
        predictorActionTime: 30,
        wolfActionTime: 45,
        witchActionTime: 30,
        witchSaveSelf: enums.GAME_WITCH_SAVE_SELF.SAVE_ONLY_FIRST_NIGHT,
        winCondition: enums.GAME_WIN_CONDITION.KILL_HALF_ROLE,
        flatTicket: enums.GAME_TICKET_FLAT.NO_PK
      }
    },
    standard_6:  {
      name: '标准6人局',
      key: 'standard_6',
      count: 6,
      ROLE_MAP: [
        enums.GAME_ROLE.WOLF,
        enums.GAME_ROLE.WOLF,
        enums.GAME_ROLE.PREDICTOR,
        enums.GAME_ROLE.GUARD,
        enums.GAME_ROLE.VILLAGER,
        enums.GAME_ROLE.VILLAGER
      ],
      STAGE: [
        enums.GAME_STAGE.READY,
        enums.GAME_STAGE.PREDICTOR_STAGE,
        enums.GAME_STAGE.GUARD_STAGE,
        enums.GAME_STAGE.WOLF_STAGE,
        enums.GAME_STAGE.AFTER_NIGHT,
        enums.GAME_STAGE.SPEAK_STAGE,
        enums.GAME_STAGE.VOTE_STAGE,
        enums.GAME_STAGE.EXILE_FINISH_STAGE,
      ],
      CONFIG_SETTINGS: [
        {title: '预言家行动时间（秒）：', type: 'counter', key: 'predictorActionTime'},
        {title: '守卫行动时间（秒）：', type: 'counter', key: 'guardActionTime'},
        {title: '狼人行动时间（秒）：', type: 'counter', key: 'wolfActionTime'},
        {title: '游戏胜利条件：', type: 'radio', key: 'winCondition'},
        {title: '平票处理：', type: 'radio', key: 'flatTicket'},
      ],
      CONFIG_OPTIONS: {
        winCondition: [
          { label: '屠边', name: '屠边', value: enums.GAME_WIN_CONDITION.KILL_HALF_ROLE },
          { label: '屠城', name: '屠城', value: enums.GAME_WIN_CONDITION.KILL_ALL },
        ],
        flatTicket: [
          { label: '直接进入夜晚', name: '直接进入夜晚', value: enums.GAME_TICKET_FLAT.NO_PK },
          { label: '加赛pk一轮', name: '加赛pk一轮', value: enums.GAME_TICKET_FLAT.NEED_PK },
        ]
      },
      CONFIG_DEFAULT: {
        predictorActionTime: 30,
        wolfActionTime: 45,
        guardActionTime: 30,
        winCondition: enums.GAME_WIN_CONDITION.KILL_ALL,
        flatTicket: enums.GAME_TICKET_FLAT.NO_PK
      }
    },
  },
  SKILL_MAP: {
    wolf: [
      {
        name: '袭击',
        key: enums.SKILL_ACTION_KEY.ASSAULT,
        status: enums.SKILL_STATUS.AVAILABLE
      },{
        name: '自爆',
        key: enums.SKILL_ACTION_KEY.BOOM,
        status: enums.SKILL_STATUS.AVAILABLE,
      }],
    predictor: [
      {
        name: '查验',
        key: enums.SKILL_ACTION_KEY.CHECK,
        status: enums.SKILL_STATUS.AVAILABLE,
      }],
    witch: [
      {
        name: '解药',
        key: enums.SKILL_ACTION_KEY.ANTIDOTE,
        status: enums.SKILL_STATUS.AVAILABLE,
      },
      {
        name: '毒药',
        key: enums.SKILL_ACTION_KEY.POISON,
        status: enums.SKILL_STATUS.AVAILABLE,
      }
    ],
    hunter: [
      {
        name: '开枪',
        key: enums.SKILL_ACTION_KEY.SHOOT,
        status: enums.SKILL_STATUS.UNAVAILABLE, // 猎人最开始不能开枪, 需要满足条件之后才能发动技能
      }
    ],
    villager: [],
    guard: [
      {
        name: '守护',
        key: enums.SKILL_ACTION_KEY.DEFEND,
        status: enums.SKILL_STATUS.AVAILABLE,
      }
    ]
  },
  PLAYER_ROLE_MAP: {
    wolf: {
      camp: enums.GAME_CAMP.WOLF,
      campName: '狼人阵营',
      name: '狼人',
      key: enums.GAME_ROLE.WOLF
    },
    villager: {
      camp: enums.GAME_CAMP.CLERIC_AND_VILLAGER,
      campName: '好人阵营',
      name: '平民',
      key: enums.GAME_ROLE.VILLAGER
    },
    predictor: {
      camp: enums.GAME_CAMP.CLERIC_AND_VILLAGER,
      campName: '好人阵营',
      name: '预言家',
      key: enums.GAME_ROLE.PREDICTOR
    },
    witch: {
      camp: enums.GAME_CAMP.CLERIC_AND_VILLAGER,
      campName: '好人阵营',
      name: '女巫',
      key: enums.GAME_ROLE.WITCH
    },
    hunter: {
      camp: enums.GAME_CAMP.CLERIC_AND_VILLAGER,
      campName: '好人阵营',
      name: '猎人',
      key: enums.GAME_ROLE.HUNTER
    },
    guard: {
      camp: enums.GAME_CAMP.CLERIC_AND_VILLAGER,
      campName: '好人阵营',
      name: '守卫',
      key: enums.GAME_ROLE.GUARD
    }
  },
  STAGE_MAP: {
    0: {
      day: enums.GAME_DAY_NIGHT.IS_NIGHT,
      name: '天黑请闭眼',
      key: 'ready'
    },
    1: {
      day: enums.GAME_DAY_NIGHT.IS_NIGHT,
      name: '预言家请行动',
      key: 'predictor'
    },
    2: {
      day: enums.GAME_DAY_NIGHT.IS_NIGHT,
      name: '狼人请行动',
      key: 'wolf'
    },
    3: {
      day: enums.GAME_DAY_NIGHT.IS_NIGHT,
      name: '女巫请行动',
      key: 'witch'
    },
    4: {
      day: enums.GAME_DAY_NIGHT.IS_DAY,
      name: '天亮了',
      key: 'actionFinish'
    },
    5: {
      day: enums.GAME_DAY_NIGHT.IS_DAY,
      name: '发言环节',
      key: 'talk'
    },
    6: {
      day: enums.GAME_DAY_NIGHT.IS_DAY,
      name: '投票环节',
      key: 'vote'
    },
    6.5: {
      day: enums.GAME_DAY_NIGHT.IS_DAY,
      name: '加赛pk环节',
      key: 'vote-pk'
    },
    7: {
      day: enums.GAME_DAY_NIGHT.IS_DAY,
      name: '遗言环节',
      key: 'lastWord'
    },
    8: {
      day: enums.GAME_DAY_NIGHT.IS_NIGHT,
      name: '守卫请行动',
      key: 'guard'
    }
  },
  JUMP_MAP: {
    'wolf': '空刀',
    'predictor': '空验',
    'witch': '空过',
    'guard': '空守'
  },
  CAMP_MAP: {
    'wolf': {
      key: 'wolf',
      value: 0,
      name: '狼人阵营',
    },
    'cleric_and_villager': {
      key: 'cleric_and_villager',
      value: 1,
      name: '好人阵营',
    },
    'third': {
      key: 'third',
      value: 2,
      name: '第三方阵营',
    }
  },
  BROADCAST_MAP: {
    'ready': [
      {
        text: '请确认自己的身份，准备开始游戏，天黑请闭眼...',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    'night_begin': [
      {
        text: '天黑请闭眼...',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    'predictor_action': [
      {
        text: '预言家',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，选择你要查验的玩家。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    'wolf_action': [
      {
        text: '狼人',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，请选择袭击一位玩家。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    'witch_action': [
      {
        text: '女巫',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，你有一瓶解药和毒药，请选择使用一种。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    'guard_action': [
      {
        text: '守卫',
        level: enums.TEXT_COLOR.RED
      },
      {
        text: '请行动，你选择你要守护的玩家。',
        level: enums.TEXT_COLOR.BLACK
      }
    ],
    'vote': [
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
    'vote_pk': [
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
