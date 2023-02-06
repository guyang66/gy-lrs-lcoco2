const path = require('path')
const fs = require('fs')
const Router = require('koa-router');
const {errorLogger} = require('../../common/log4')
//自动扫指定目录下面的文件并且加载
const chalk = require('chalk');
const MapLoader = require('../base/MapClass')
const { scanFilesByFolder } = require('../utils')

const initConfig = function () {
  let config = {};
  const projectConfig = require('../../config.json')
  config = {...config, ...projectConfig};
  return config;
}

const initConstants = function () {
  return require('../../common/constants')
}

const initErrorCode = function () {
  return require('../../common/errorCode')
}

const initController = function(app){
  let dir = '../controller/'
  let _folder = path.resolve(__dirname, dir);
  const files = fs.readdirSync(_folder);
  let map = {}
  files.forEach((file) => {
    let fullPath = path.join(dir, file);
    const stat = fs.statSync(path.join(__dirname, fullPath));
    if(!stat.isDirectory() && !file.match(/js/)){
      // 不是目录、也不是js文件，则跳过
      return;
    }
    let filename = file.replace('.js', '');
    let Controller = require(_folder + '/' + filename);

    let proto = Controller.prototype
    let ret = {}
    const keys = Object.getOwnPropertyNames(proto);
    for(const key of keys){
      if (key === 'constructor') {
        continue;
      }
      ret[key] = methodToMiddleware(Controller, key);
    }
    proto = Object.getPrototypeOf(proto);
    map[file.replace('.js', '')] = ret
  })

  function methodToMiddleware(Controller,key){
    return function classControllerMiddleware(ctx, next){
      const controller = new Controller(ctx)
      let fn = controller[key]
      // 通过call函数调用方法
      return fn.call(controller, ctx, next)
    }
  }

  app['controller'] = map
}

// 初始化路由
const initRouter = function(app){
  const router = new Router();
  require('../routes')({...app, router});
  return router;
}


function initService(app){
  let dir = '../service/'
  let _folder = path.resolve(__dirname, dir);
  const files = fs.readdirSync(_folder);
  let map = {}
  files.forEach((file) => {
    let fullPath = path.join(dir, file);
    const stat = fs.statSync(path.join(__dirname, fullPath));
    if(!stat.isDirectory() && !file.match(/js/)){
      // 不是目录、也不是js文件，则跳过
      return;
    }
    map[file.replace('.js', '')] = require(path.join(_folder,file))
  })

  Object.defineProperty(app.context, 'service', {
    get() {
      return new MapLoader({ctx: this, properties: map})
    }
  })
}

// 初始化model
function initMongoModel(app){
  let model = {};
  const mongoose = require('mongoose')
  const BaseModel = require('../mongoModel/baseModel')
  scanFilesByFolder('../mongoModel',(filename, modelConfig)=>{
    model[filename] = modelConfig({...app, mongoose, BaseModel});
  });
  return model
}


// 初始化扩展
function initExtend(app) {
  scanFilesByFolder('../extend',(filename, extendFn)=>{
    app['$' + filename] = Object.assign(app['$' + filename] || {}, extendFn(app))
  })
}

function initMongodb(app) {
  const { commonLogger, mongoDBLogger } = app.$log4
  const utils = require('../extend/utils')
  const { localStringify } = utils(app)
  const mongoose = require('mongoose').set('debug', function (collectionName, method, query, doc) {
    let str = collectionName + '.' + method + '(' + localStringify(query) + ',' + localStringify(doc) + ')'
    // 开启sql log
    mongoDBLogger.info(str)
  });
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
  const config = app.$config
  let dbConfig = config.mongodb.local
  if(process.env.DB_ENV === 'development'){
    dbConfig = config.mongodb.dev
  }
  if(process.env.NODE_ENV === 'production'){
    dbConfig = config.mongodb.prd
  }
  const uri = 'mongodb://' + `${dbConfig.user}` + ':' + `${encodeURIComponent(dbConfig.pass)}` + '@' + `${dbConfig.servername}`  + ':' + `${dbConfig.port}` + '/' + `${dbConfig.database}`
  let url = uri + '?gssapiServiceName=mongodb'
  console.log(chalk.cyan('【mongodb url】：' + url));
  mongoose.connect(url,options,function (){})
  let db = mongoose.connection

  db.on('error', (error)=>{
    commonLogger.error('数据库连接失败！' + error)
    errorLogger.error('数据库连接失败！' + error)
    console.log(chalk.red('数据库连接失败！' + error));
  });
  db.once('open', ()=> {
    commonLogger.info("mongoDB connect success");
    console.log(chalk.green('============== mongoDB connect success ================='));
  })
  app.$mongoose = mongoose
  app.$db = db
}

// 初始化中间件middleware
function initMiddleware(app){
  let middleware = {}
  scanFilesByFolder('../middleware',(filename, middlewareConf)=>{
    middleware[filename] = middlewareConf(app);
  })
  return middleware;
}

function initLog4() {
  return require('../../common/log4');
}

function initNodeCache () {
  const NodeCache = require('node-cache')
  return new NodeCache()
}

function initSchedule (app) {
  const schedule = require('node-schedule');
  const { commonLogger } = app.$log4
  let schedules = {}
  scanFilesByFolder('../schedule',(filename, scheduler)=>{
    if(scheduler(app).open){
      schedules[filename] = schedule.scheduleJob(scheduler(app).interval,scheduler(app).handler)
      commonLogger.info('定时器：' + filename, '已启动')
    } else {
      commonLogger.info('定时器：' + filename, '设置为不启动！')
    }
  })
  return schedules;
}

const initWs = function (app) {
  const ws = require("nodejs-websocket")
  const server = ws.createServer(function (connection){
    connection.on("text", function (str) {
      console.log("Received "+str)
      connection.sendText(str.toUpperCase()+"!!!")
    })
    connection.on("close", function (code, reason) {
      console.log("Connection closed")
      console.log(code,reason)
    })
    connection.on("error", function (code, reason) {
      console.log(code,reason)
    })
  }).listen(6103)
  return server
}

module.exports = {
  initController,
  initRouter,
  initMiddleware,
  initService,
  initConfig,
  initLog4,
  initNodeCache,
  initExtend,
  initMongoModel,
  initMongodb,
  initSchedule,
  initConstants,
  initErrorCode,
  initWs,
}
