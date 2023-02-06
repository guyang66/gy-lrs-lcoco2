const BaseClass = require('../base/BaseClass')
// 设置投影，隐藏密码
let selectUserKey = { password: 0 };
class userService extends BaseClass{
  /**
   * 根据用户名查找用户
   * @param username
   * @returns {Promise<void>}
   */
  async getUsersByUsername(username){
    const { $model } = this.app;
    const { user } = $model
    if (username.length === 0) {
      return null;
    }
    const query = {username: username, status: 1};
    return await user.findOne(query, selectUserKey).exec();
  }
  /**
   * 根据用户名查找password
   * @param username
   * @returns {Promise<void>}
   */
  async getUsersPasswordByUsername(username) {
    const { $model } = this.app;
    const { user } = $model;
    if (username.length === 0) {
      return null;
    }
    const query = {username: {$in: username}};
    return await user.findOne(query).select('password').exec();
  }

  /**
   * 获取用户信息
   * @param id
   * @returns {Promise<*>}
   */
  async getUserInfoById(id) {
    const { $model } = this.app;
    const { user } = $model;
    let r = await user.findById(id, {}, function (err){
      if(err){
        console.log(err)
      }
    })
    return r
  }

  /**
   * 超级管理员创建一个用户
   * @param username
   * @param password
   * @returns {Promise<*>}
   */
  async createUser (username, password) {
    const { user } = app.$model
    await user.create(
      {
        username: username,
        password: password,
        email: '',
        name: '默认姓名',
        roles: ['player'],
        defaultRole: 'player',
        defaultRoleName: '玩家',
        status: 1
      }
    )
    const query = {username: {$in: username}};
    return await user.findOne(query, selectUserKey).exec();
  }
}
module.exports = userService;
