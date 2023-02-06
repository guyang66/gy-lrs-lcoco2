const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Permission = new mongoose.Schema(
    Object.assign({}, baseModel, {
      key: { type: String, unique: true, required: [true,'key不能为空！']},
      name: { type: String, default: '' }, // 名称
      roles: [],
      type: { type: String, default: 'button' }, // 类型
      status: { type: Number, default: 1},
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_ui_permission",
    }
  )
  return mongoose.model('lcoco_ui_permission', Permission);
}

