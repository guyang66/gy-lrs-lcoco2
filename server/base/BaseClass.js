// 基类
class BaseClass {
  constructor(ctx) {
    // 保存上下文
    this.ctx = ctx
    this.app = ctx.app
    this.service = ctx.service
  }
}
module.exports = BaseClass
