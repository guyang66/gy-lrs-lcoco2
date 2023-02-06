const BaseClass = require('../base/BaseClass')
class userController extends BaseClass {
  /**
   * 创建用户
   * @returns {Promise<void>}
   */
  async createUser() {
    //todo: url权限要跟上,
    const { service, ctx, app } = this
    const { $helper, $model } = app

    const { user } = $model
    const { username, name, password, role } = ctx.request.body
    if(!username || username === ''){
      ctx.body = $helper.Result.fail(-1,'username不能为空！')
      return
    }
    if(!name || name === ''){
      ctx.body = $helper.Result.fail(-1,'name不能为空！')
      return
    }
    if(!password || password === ''){
      ctx.body = $helper.Result.fail(-1,'password不能为空！')
      return
    }
    if(!role || role === ''){
      ctx.body = $helper.Result.fail(-1,'role不能为空！')
      return
    }

    let existUser = await service.baseService.queryOne(user, {username: username})
    if(existUser){
      ctx.body = $helper.Result.fail('-1', '当前用户已存在！')
      return
    }

    let pass = await $helper.createPassword(password)
    let obj = {
      username: username,
      name: name,
      defaultRole: role,
      defaultRoleName: '',
      password: pass,
      roles: [role]
    }
    let r = await service.baseService.save(user, obj)
    if(r){
      ctx.body = $helper.Result.success(r)
    } else {
      ctx.body = $helper.Result.fail(-1, '创建用户失败！')
    }
  }

  /**
   * 通过token获取用户信息
   * @returns {Promise<void>}
   */
  async getUserInfo () {
    const { service, ctx, app } = this
    const { $helper } = app
    const token = ctx.header.authorization
    let user;
    try {
      user = await $helper.decodeToken(token)
    } catch (e) {
      $helper.Result.fail(-1,e)
    }
    if(!user){
      $helper.Result.fail(-1, '用户信息不存在')
    }
    let realUser = await service.userService.getUserInfoById(user._id)
    ctx.userInfo = realUser
    ctx.body = $helper.Result.success(realUser)
  }
}
module.exports = userController
