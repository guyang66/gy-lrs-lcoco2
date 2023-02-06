const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Player = new mongoose.Schema(
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      gameId: { type: String, required: [true,'gameId不能为空！']},
      content: { type: Object, required: [ true,'content不能为空！']},
      view: { type: Array, default: [], required: [true,'可见者不能为空！']}, //
      isCommon: { type: Number, default: 0 }, // 是否公共（任何人可见，不需要判断view权限）可见 0: 否, 1: 是
      stage: { type: Number, default: 0 }, // 阶段
      day: {type: Number, default: 1 }, // 第几天
      isTitle: { type: Number, default: 0  }, //  1: 居中title， 0：正文
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_record",
    }
  )
  return mongoose.model('lcoco_record', Player);
}

