const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Routes = new mongoose.Schema(
    Object.assign({}, baseModel, {
      key: { type: String, default: '' },
      path: { type: String, unique: true, required: [true,'path不能为空！'] },
      name: { type: String, default:'管理后台' },
      roles: [], // 角色
      exact: { type: Boolean, default: true }, // 是否在前端路由精确匹配
      backUrl: { type: String, default: '/403' }, // 回退url，默认回到403页面，可配置。
      status: { type: Number, default: 1 } // 1：启用；0：停用
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_route",
    }
  )
  return mongoose.model('lcoco_route', Routes);
}

