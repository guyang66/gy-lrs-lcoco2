module.exports = app => {
  const { router, controller, $middleware } = app;

  // 登录
  router.post('/api/login', controller.authController.login)

  // // user相关
  router.get('/api/user/getUserInfo/auth', $middleware.auth, controller.userController.getUserInfo)
  router.post('/api/user/create/auth', $middleware.auth, controller.userController.createUser)

  // 后台配置接口
  router.get('/api/route/auth',$middleware.auth, controller.configController.getRoute)
  router.get('/api/permission/ui/auth',$middleware.auth, controller.configController.getUiPermission)

  router.get('/api/room/create/auth', $middleware.auth, controller.roomController.createRoom)
  router.get('/api/room/info/auth', $middleware.auth, controller.roomController.getRoomInfo)
  router.get('/api/room/join/auth', $middleware.auth, controller.roomController.joinRoom)
  router.get('/api/room/quit/auth', $middleware.auth, controller.roomController.quitRoom)
  router.get('/api/room/modifyName/auth', $middleware.auth, controller.roomController.modifyPlayerNameInRoom)
  router.get('/api/room/kick/auth', $middleware.auth, controller.roomController.kickPlayer)
  router.get('/api/room/seat/auth', $middleware.auth, controller.roomController.sitDown)
  router.get('/api/room/mode/auth', $middleware.auth, controller.roomController.getRoomMode)
  router.get('/api/room/mode/change/auth', $middleware.auth, controller.roomController.changeRoomMode)

  router.post('/api/game/start/auth', $middleware.auth, controller.gameController.gameStart)
  router.get('/api/game/info/auth', $middleware.auth, controller.gameController.getGameInfo)
  router.get('/api/game/result/auth', $middleware.auth, controller.gameController.gameResult)
  router.get('/api/game/destroy/auth', $middleware.auth, controller.gameController.gameDestroy)
  router.get('/api/game/again/auth', $middleware.auth, controller.gameController.gameAgain)
  router.get('/api/game/ob/auth', $middleware.auth, controller.gameController.obGame)

  router.get('/api/game/nextStage/auth', $middleware.auth, controller.gameController.nextStage)
  router.get('/api/game/userNextStage/auth', $middleware.auth, controller.gameController.nextStage)
  router.get('/api/game/record/auth', $middleware.auth, controller.gameController.commonGameRecord)
  router.get('/api/game/checkPlayer/auth', $middleware.auth, controller.gameController.checkPlayer)
  router.get('/api/game/assaultPlayer/auth', $middleware.auth, controller.gameController.assaultPlayer)
  router.get('/api/game/antidotePlayer/auth', $middleware.auth, controller.gameController.antidotePlayer)
  router.get('/api/game/votePlayer/auth', $middleware.auth, controller.gameController.votePlayer)
  router.get('/api/game/poisonPlayer/auth', $middleware.auth, controller.gameController.poisonPlayer)
  router.get('/api/game/shootPlayer/auth', $middleware.auth, controller.gameController.shootPlayer)
  router.get('/api/game/boomPlayer/auth', $middleware.auth, controller.gameController.boomPlayer)

}
