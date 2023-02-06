const BaseSchema = {
  createTime: {
    type:Date,
    default: new Date()
  },
  modifyTime: {
    type:Date,
    default: new Date()
  },
  createId: {
    type: Number,
    default: 1
  },
  modifyId: {
    type: Number,
    default: 1
  },
  isDelete: {
    type: Boolean,
    default: false,
  }
}
module.exports = BaseSchema
