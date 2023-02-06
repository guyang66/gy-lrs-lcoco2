const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Vision = new mongoose.Schema(
    Object.assign({}, baseModel, {
      roomId: { type: String, required: [true,'roomId不能为空！']},
      gameId: { type: String, required: [true,'gameId不能为空！']},
      from: { type: String, required: [true,'(vision)主体不能为空！']}, // from -> to  ：from玩家知晓to玩家的身份状态
      to: { type: String, required: [true,'(vision)客体不能为空！']},
      status: { type: Number, default: 1}, // 0：完全未知 ， 1：知道阵营 2：完全知晓身份
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_vision",
    }
  )
  return mongoose.model('lcoco_vision', Vision);
}

