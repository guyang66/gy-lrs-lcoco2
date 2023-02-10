const BaseClass = require('../base/BaseClass')
class authController extends BaseClass {
  /**
   * 登录
   * @returns {Promise<void>}
   */
  async login () {
    const { service, app, ctx } = this
    const { $helper } = app
    const { username, password } = ctx.request.body
    if(!username || username === '') {
      ctx.body = $helper.Result.fail(-1, '用户名不能为空！')
      return
    }

    if(!password || password === '') {
      ctx.body = $helper.Result.fail(-1, '密码不能为空！')
      return
    }

    let user = await service.userService.getUsersByUsername(username)
    if(!user) {
      // 未查询到相关账户信息
      ctx.body = $helper.Result.error('USER_NOT_EXIST_ERROR')
      return
    }

    // 校验密码
    const userCurrentPass = await service.userService.getUsersPasswordByUsername(username);
    const verifyResult = await $helper.checkPassword(password, userCurrentPass.password)

    if(!verifyResult){
      ctx.body = $helper.Result.fail(-1, '密码错误！')
      return;
    }

    user = user.toObject();
    let userDataStr = JSON.parse(JSON.stringify(user));
    let token = await $helper.createToken(userDataStr);
    ctx.body = $helper.Result.success(
      {
        accessToken: token,
        user: user
      }
    )
  }

  /**
   * 登出
   * @returns {Promise<void>}
   */
  async logout () {
    // jwt服务端是无状态的，登出由客户端处理即可
    const { ctx } = this
    ctx.body = 'ok'
  }
}

module.exports = authController
