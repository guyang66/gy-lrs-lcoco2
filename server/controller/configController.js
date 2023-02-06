const BaseClass = require('../base/BaseClass')
class configController extends BaseClass {
  /**
   * 获取所有可用的路由
   * @returns {Promise<void>}
   */
  async getRoute(ctx) {
    const { service, app } = this
    const { $helper } = app
    let r = await service.routeService.getRoute()
    ctx.body = $helper.Result.success(r)
  }

  /**
   * 获取ui权限
   * @returns {Promise<void>}
   */
  async getUiPermission (ctx) {
    const { service, app, } = this
    const { $helper, $model  } = app
    const { uiPermission } = $model
    let r = await service.baseService.query(uiPermission, {status: 1})
    if(r){
      ctx.body = $helper.Result.success(r)
    } else {
      ctx.body = $helper.Result.fail(-1, '查询失败！')
    }
  }
}
module.exports = configController
