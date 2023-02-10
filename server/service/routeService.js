const BaseClass = require('../base/BaseClass')

class routeService extends BaseClass{
  /**
   * 获取可用权限路由
   * @returns {Promise<*>}
   */
  async getRoute () {
    const { route } = this.app.$model
    const { errorLogger } = this.app.$log4
    // 获取正在使用的路由
    let r = await route.find( { status: 1}, null, function (err){
      if(err){
        errorLogger.error(err)
      }
    })
    return r
  }

  /**
   * 获取路由配置列表
   * @param page
   * @param pageSize
   * @param params
   * @returns {Promise<{total: *, list: *}>}
   */
  async getList (page= 1, pageSize = 10, params) {
    const { errorLogger } = this.app.$log4
    const { route } = this.app.$model
    let { searchKey, status } = params
    let list = []
    let searchParams = {}
    status = (status !== undefined && status !== null) ? (status - 0) : 2
    let p1 = {
      "$or": [
        {
          "name": new RegExp(searchKey,'i')
        },
        {
          "key": new RegExp(searchKey,'i')
        },
        {
          "path": new RegExp(searchKey,'i')
        }
      ]
    }

    if(searchKey && searchKey !== ''){
      let p2 = {}
      if(status !== undefined && status !== null && status !== 2){
        p2.status = status
      }
      searchParams = {
        "$and": [p1, p2]
      }
    } else {
      if(status !== undefined && status !== null && status !== 2){
        searchParams.status = status
      }
    }
    let sortParam = {}

    let total = await route.find(searchParams).countDocuments()
    list = await route.find(searchParams, null, {skip: pageSize * (page < 1 ? 0 : (page - 1)), limit: (pageSize - 0), sort : sortParam }, function (err, docs){
      if(err){
        errorLogger.error(err)
      }
    })
    return { list, total }
  }
}
module.exports = routeService;
