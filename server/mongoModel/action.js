const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Action = new mongoose.Schema(
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      gameId: { type: String, required: [true,'gameId不能为空！']},
      day: {type: Number, default: 1, required: [true,'action-day不能为空！']  },
      stage: { type: Number, default: 0, required: [true,'action-stage不能为空！'] },
      from: { type: String, required: [true,'action-from不能为空！']},
      to: { type: String, required: [true,'action-to客体不能为空！']},
      // 'assault': '狼人袭击' , 'kill' : '狼人阵营刀死', 'check': '预言家查验', 'antidote':女巫解药, 'poison':'女巫毒药', 'shoot': '猎人开枪'，'boom'：狼人自爆；'vote': '投票流放'
      action: { type: String, required: [true,'action-动作不能为空！']},
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_action",
    }
  )
  return mongoose.model('lcoco_action', Action);
}

