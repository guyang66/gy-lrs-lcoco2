const BaseClass = require('../base/BaseClass')

class baseService extends BaseClass{
  /**
   * 查询
   * @param id
   * @param model
   * @returns {Promise<*|boolean>}
   */
  async queryById (model, id) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    try {
      return await model.findById(id)
    } catch (e){
      errorLogger.error('【baseService】—— queryById：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 查询满足条件的一个记录
   * @param model
   * @param params
   * @param projection
   * @param options
   * @returns {Promise<*|boolean>}
   */
  async queryOne (model, params, projection = {}, options = {}) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    try {
      return await model.findOne(params, projection, options)
    } catch (e){
      errorLogger.error('【baseService】—— findOne：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 条件查询list
   * @param model
   * @param params
   * @param projection
   * @param opt
   *           —— false：不设置options，不设置options为空
   *           —— null or undefined（默认）：默认按id排序
   *           —— object
   * @returns {Promise<*|boolean>}
   */
  async query (model, params, projection, opt) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    let queryOptions
    if(!opt){
      queryOptions = { sort: { _id: -1 } }
    } else {
      queryOptions = opt
    }
    if(opt === 'false' || opt === false){
      queryOptions = {}
    }

    try {
      return await model.find(params, projection, queryOptions)
    } catch (e){
      errorLogger.error('【baseService】—— query：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 新增
   * @param content
   * @param model
   * @returns {Promise<boolean>}
   */
  async save (model, content) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    let newInstance = new model({...content, createTime: new Date(), modifyTime: new Date()})
    let p = new Promise((resolve,reject)=>{
      newInstance.save(function(err, doc){
        if(err){
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
    try {
      return await p
    } catch (e){
      errorLogger.error('【baseService】—— save：' + e.toString())
      console.log('保存失败：' + e)
      return false
    }
  }

  /**
   * 计数
   * @param model
   * @param params
   * @returns {Promise<*|boolean>}
   */
  async count (model, params) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    let searchParams = {...params}
    try {
      return  await model.find(searchParams).countDocuments()
    } catch (e){
      errorLogger.error('【baseService】—— count：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 通过id更新
   * @param model
   * @param id
   * @param data
   * @returns {Promise<*|boolean>}
   */
  async updateById (model, id, data) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    try {
      return await model.findByIdAndUpdate(id, data)
    } catch (e){
      errorLogger.error('【baseService】—— updateById：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 批量更新
   * @param model
   * @param id
   * @param data
   * @returns {Promise<*|boolean>}
   */
  async batchUpdate (model, params, data) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    try {
      return await model.update(
        {...params},
        {
          $set: {...data}
        }
      )
    } catch (e){
      errorLogger.error('【baseService】—— batchUpdate：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 更新满足条件的一个记录
   * @param model
   * @param params
   * @param content
   * @returns {Promise<*|boolean>}
   */
  async updateOne (model, params, content) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    try {
      return await model.findOneAndUpdate(
        {...params},
        {...content}
      )
    } catch (e){
      errorLogger.error('【baseService】—— updateOne：' + e.toString())
      console.log(e)
      return false
    }
  }

  /**
   * 根据id删除
   * @param id
   * @param model
   * @returns {Promise<boolean>}
   */
  async deleteById (model, id) {
    const { $log4 } = this.app
    const { errorLogger } = $log4
    if(!model){
      return false
    }
    try {
      await model.findByIdAndRemove(id)
      return true
    } catch (e){
      errorLogger.error('【baseService】- delete' + e)
      console.log(e)
      return false
    }
  }

  /**
   * 根据上下文获取当前用户信息
   * @returns {Promise<*>}
   */
  async userInfo () {
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
    return await service.userService.getUserInfoById(user._id)
  }
}
module.exports = baseService;
