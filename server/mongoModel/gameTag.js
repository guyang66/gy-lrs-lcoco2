const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Out = new mongoose.Schema(
    // 记录游戏的关键信息
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      gameId: { type: String, required: [true,'gameId不能为空！']},
      day: {type: Number, default: 1, required: [true,'gameTag-day主体不能为空！']  },
      stage: { type: Number, default: 0, required: [true,'gameTag-stage主体不能为空！'] },
      target: { type: String, required: [true,'gameTag-target事件主体不能为空！']},
      name: { type: String },
      position: { type: Number},
      dayStatus: { type: Number, required: [true,'gameTag-dayStatus不能为空！'] }, // 是晚上还是白天 1：晚上 2：白天
      desc: { type: String, required: [true,'gameTag-事件描述不能为空！']}, // 导致事件发生的原因, 如：desc = 'assault' , mode = 1 ,dayStatus = 1  可以得出：在晚上被狼人袭击而死
      mode: { type: Number, required: [true,'gameTag-事件结果不能为空！']}, // 1 死亡  2、发言顺序
      value: { type: String },
      value2: { type: [] },
      value3: { type: Object }
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_game_tag",
    }
  )
  return mongoose.model('lcoco_game_tag', Out);
}

