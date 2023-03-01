const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Player = new mongoose.Schema(
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      gameId: { type: String, required: [true,'gameId不能为空！']},
      userId: { type: String},
      username: { type: String, required: [true,'username不能为空！']},
      name: { type: String},
      role: { type: String, required: [true,'身份角色不能为空！']},
      roleName: { type: String },
      camp: {type: Number, default: -1}, // 阵营 0：狼人阵营 1：神民阵营
      campName: { type: String },
      status: {type: Number, default: 1}, // 状态：0：死亡 ， 1：存活
      outReason: { type: String}, // 出局原因，vote: 被投票出局，wolf: 被狼刀，shoot: 被猎人枪，poison: 被女巫毒死
      position: {type: Number, required: [true,'位置不能为空！']}, // 座位号
      skill: [], // 拥有的技能  'boom'：自爆；'check': 查验, 'antidote':解药, 'poison':'毒药', 'shoot': '开枪'
      // skillStatus:{type: Number, default: 0}, // 技能状态 0:不能使用 1：能使用
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_player",
    }
  )
  return mongoose.model('lcoco_player', Player);
}

