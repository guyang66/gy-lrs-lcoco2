module.exports = {
  errorCode: {
    SYSTEM_ERROR: -1, // 系统错误
    NOT_LOGIN: -3, // 用户未登录
  },
  gameModeMap: {
    'standard_9': ['wolf', 'wolf', 'wolf', 'villager', 'villager', 'villager', 'predictor', 'witch', 'hunter']
  },
  skillMap: {
    wolf: [
      {
        name: '袭击',
        key: 'assault',
        status: 1,
      },{
        name: '自爆',
        key: 'boom',
        status: 1,
      }],
    predictor: [
      {
        name: '查验',
        key: 'check',
        status: 1,
      }],
    witch: [
      {
        name: '解药',
        key: 'antidote',
        status: 1,
      },
      {
        name: '毒药',
        key: 'poison',
        status: 1,
      }
    ],
    hunter: [
      {
        name: '开枪',
        key: 'shoot',
        status: 0, // 猎人最开始不能开枪
      }
    ],
    villager: [],
    guard: [
      {
        name: '守护',
        key: 'defend',
        status: 1,
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
        level: 1, // 黑色字体
      }
    ],
    '*-0': [
      {
        text: '天黑请闭眼...',
        level: 1, // 黑色字体
      }
    ],
    '*-1': [
      {
        text: '预言家',
        level: 2, // 红色字体
      },
      {
        text: '请行动，选择你要查验的玩家。',
        level: 1, // 黑色字体
      }
    ],
    '*-2': [
      {
        text: '狼人',
        level: 2, // 红色字体
      },
      {
        text: '请行动，请选择袭击一位玩家。',
        level: 1, // 黑色字体
      }
    ],
    '*-3': [
      {
        text: '女巫',
        level: 2, // 红色字体
      },
      {
        text: '请行动，你有一瓶解药和毒药，请选择使用一种。',
        level: 1, // 黑色字体
      }
    ],
    '*-6': [
      {
        text: '开始',
        level: 1, // 红色字体
      },
      {
        text: '投票',
        level: 2, // 黑色字体
      },
      {
        text: '，请使用投票技能进行投票，如果要',
        level: 1, // 黑色字体
      },
      {
        text: '弃票',
        level: 2, // 黑色字体
      },
      {
        text: '，则不进行任何操作，等待主持人进入下一阶段',
        level: 1, // 黑色字体
      },
    ],
    '*-6.5': [
      {
        text: '开始',
        level: 1, // 红色字体
      },
      {
        text: '加赛投票',
        level: 4, // 黑色字体
      },
      {
        text: '，请使用投票技能进行投票，如果要',
        level: 1, // 黑色字体
      },
      {
        text: '弃票',
        level: 2, // 黑色字体
      },
      {
        text: '，则不进行任何操作，等待主持人进入下一阶段',
        level: 1, // 黑色字体
      },
    ]
  }

}
