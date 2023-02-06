const parse = require('urlparse')

module.exports = app => {
  return async function(ctx, next) {
    const { $helper, $nodeCache } = app
    // 再次从url上校验需不需要鉴权。
    const parser = parse(ctx.request.url)
    const { path } = parser
    if(path.indexOf('/auth') < 0) {
      await next();
      return
    }

    // token只能从header中取，前后端约定好。不能从cookie中拿，防止csrf攻击。

    let accessToken = ctx.header.authorization

    let isLogin

    try {
      isLogin = !!await $helper.checkToken(accessToken)
    } catch (e) {
      ctx.body = $helper.Result.fail('-1','token解析失败')
    }

    let userInfo

    try {
      userInfo = await $helper.decodeToken(accessToken)
    } catch (e) {
      ctx.body = $helper.Result.fail('-1','token解析失败')
    }

    if(!isLogin) {
      ctx.body = $helper.Result.error('NOT_LOGIN')
      return
    }

    // 挂载userinfo
    ctx.userInfo = userInfo

    // url 权限校验
    let urlPermissionList = $nodeCache.get('page_url_permission')
    if(!urlPermissionList){
      urlPermissionList = []
    }
    let userRoles = userInfo.roles
    let checkPermissionResult = false

    let target = urlPermissionList.find(item=>{
      return item.key === path || path.indexOf(item.key) > -1 // 前面是匹配单个， 后面是匹配一个组，给某个上级路由都加上权限。
    })

    if(!target){
      // 没有需要判断的url权限, 交给下一个中间件，并且不再执行下面的逻辑
      await next()
      return
    }

    if(target){
      // 存在需要判断的url权限
      for(let i = 0; i < userRoles.length; i++){
        let roleItem = userRoles[i]
        let permissionRolesList = target.roles
        // 遍历用户的角色列表，去匹配是否有权限操作
        let exist = permissionRolesList.find(p=>{
          return p === roleItem
        })
        if(exist) {
          checkPermissionResult = true
        }
      }

      if(!checkPermissionResult){
        ctx.body = $helper.Result.fail(403,'url无权访问！')
        return
      }
    }

    await next();
  };
}
