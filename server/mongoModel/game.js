const baseModel = require('./baseModel')
const constants = require('../../common/constants')
const DEFAULT_MODE = 'standard_9'
const GAME_MODE = constants.MODE[DEFAULT_MODE]
module.exports = app => {
  const { mongoose } = app;
  const Role = new mongoose.Schema(
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      owner: { type: String, required: [true,'owner不能为空！']},
      status: { type: Number, default: 0 }, // 0: 初始化中  1: 进行中 2：已结束, 3:异常（比如房主提前终止游戏）
      stage: { type: Number, default: -1 },
      stageStack: { type: Array, default: [] }, // 存放每一轮所有的阶段，通过栈数据结构进行，临时加入一个新阶段就push进一个stage，进入下一阶段就pop一个stage出来用
      day: {type: Number, default: 1 }, // 第几天
      v1: { type: String }, // 座位1(玩家1)
      v2: { type: String }, // 座位2(玩家2)
      v3: { type: String }, // 座位3(玩家3)
      v4: { type: String }, // 座位4(玩家4)
      v5: { type: String }, // 座位5(玩家5)
      v6: { type: String }, // 座位6(玩家6)
      v7: { type: String }, // 座位7(玩家7)
      v8: { type: String }, // 座位8(玩家8)
      v9: { type: String }, // 座位9(玩家9)
      v10: { type: String }, // 座位7(玩家10)
      v11: { type: String }, // 座位8(玩家11)
      v12: { type: String }, // 座位9(玩家12)
      winner: { type: Number, default: -1 },
      winnerString: {type: String, default: '' },
      mode: {type: String, default: DEFAULT_MODE }, // 默认标准9人局
      playerCount: { type: Number, default: GAME_MODE.count }, // 默认9个人
      witchSaveSelf: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.witchSaveOptions }, // 女巫自救：1：能自救，2：仅第一晚能自救，3：不能自救
      winCondition: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.winConditionOptions }, // 胜利条件：1：屠边 2：全屠
      flatTicket: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.flatTicketOptions }, // 平票怎么处理，1：平票就直接进入黑夜，不pk，2：平票 二者加赛一轮
      predictorActionTime: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.predictorActionTime }, // 预言家行动时间
      wolfActionTime: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.wolfActionTime }, // 狼人行动时间
      witchActionTime: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.witchActionTime }, // 女巫行动时间
      guardActionTime: { type: Number, default: GAME_MODE.CONFIG_DEFAULT.guardActionTime }, // 女巫行动时间
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_game",
    }
  )
  return mongoose.model('lcoco_game', Role);
}

