const baseModel = require('./baseModel')
const constants = require('../../common/constants')
module.exports = app => {
  const { mongoose } = app;
  const Role = new mongoose.Schema(
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      owner: { type: String, required: [true,'owner不能为空！']},
      status: { type: Number, default: 1 }, // 1 进行中， 2：已结束, 3:异常（比如房主提前终止游戏）
      stage: { type: Number, default: 0 }, // 阶段： 0 ：幕布 1、预言家行动 2、狼人行动 3、女巫行动 4、天亮了发动技能环节（猎人行动）和发表遗言 5、发言环节、6、投票环节、(6.5 、平票pk阶段) 7、遗言环节或技能环节
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
      winner: { type: Number, default: -1 }, // 0：狼人阵营胜利， 1：好人阵营胜利
      mode: {type: String, default: 'standard_9' }, // 默认标准9人局
      playerCount: { type: Number, default: 9 }, // 默认9个人
      witchSaveSelf: { type: Number, default: 1 }, // 女巫自救：1：能自救，2：仅第一晚能自救，3：不能自救
      winCondition: { type: Number, default: 1 }, // 胜利条件：1：屠边 2：全屠
      flatTicket: { type: Number, default: 1 }, // 平票怎么处理，1：平票就直接进入黑夜，不pk，2：平票 二者加赛一轮
      p1: { type: Number, default: constants.predictor_timer }, // 预言家行动时间
      p2: { type: Number, default: constants.wolf_timer }, // 狼人行动时间
      p3: { type: Number, default: constants.witch_timer }, // 女巫行动时间
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_game",
    }
  )
  return mongoose.model('lcoco_game', Role);
}

