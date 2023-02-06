const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const User = new mongoose.Schema(
    Object.assign({}, baseModel, {
      username: { type: String, unique: true, required: [true,'username不能为空'] },
      password: { type: String, required: [true,'password不能为空'] },
      name: { type: String, default: '' }, // 昵称
      roles: { type: Array },
      defaultRoleName: { type: String }, // 冗余一个rolename 字段
      defaultRole: { type: String },
      remark: { type: String },
      status: { type: Number, default: 1 }, // 1：启用；0：停用
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_user",
    }
  )
  return mongoose.model('lcoco_user', User);
}

