const baseModel = require('./baseModel')
module.exports = app => {
  const { mongoose } = app;
  const Room = new mongoose.Schema(
    Object.assign({}, baseModel, {
      name: { type: String, default: '狼人杀房间' }, // 房间名字
      status: { type: Number, default: 0 },  // 0：准备中/未开始, 1：进行游戏中 , 2: 已完成对局，房间已失效
      gameId: { type: String, default: null }, // status = 1 时，初始化gameId
      password: { type: String, required: [true, '房间密码不能为空！']},
      owner: { type: String, required: [true, '房间创建者不能为空！']}, // 房间归属者（创建者）
      v1: { type: String }, // 座位1
      v2: { type: String }, // 座位2
      v3: { type: String }, // 座位3
      v4: { type: String }, // 座位4
      v5: { type: String }, // 座位5
      v6: { type: String }, // 座位6
      v7: { type: String }, // 座位7
      v8: { type: String }, // 座位8
      v9: { type: String }, // 座位9
      count: {type: Number, default: 9 }, // 默认9个座位
      wait: { type: Array, default: []}, // 等待区
      ob: { type: Array, default: []}, // 观众席，观众要跳过一些逻辑判断
      remark: { type: String },
    }), {
      timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime'},
      collection: "lcoco_room",
    }
  )
  return mongoose.model('lcoco_room', Room);
}

