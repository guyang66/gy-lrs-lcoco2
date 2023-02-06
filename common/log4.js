const path = require('path');
const log4js = require('koa-log4');
const config = require('../config.json')
const isPrd = process.env.NODE_ENV === 'production'
const rootPath = isPrd ? config.log.prdRootPath : config.log.rootPath
log4js.configure({
  // 可以在开发环境设置为控制台输出
  appenders : {
    error:{
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      filename: path.join(`${rootPath}`, 'error.log'), //生成文件名
      backups: 30,
    },
    schedule: {
      type: 'file',
      filename: path.join(`${rootPath}`, 'schedule.log'), //生成文件名
      maxLogSize: 10485760 * 10, // 100mb,日志文件大小,超过该size则自动创建新的日志文件
      backups: 10,
    },
    mongodb: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      filename: path.join(`${rootPath}`, 'mongodb.log'), //生成文件名
      backups: 30,
    },
    common: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      filename: path.join(`${rootPath}`, 'common.log'), //生成文件名
      backups: 30,
    },
    out: {
      type: 'console'
    },
  },
  categories: {
    default: { appenders: [ 'out' ], level: 'info' },
    error:{
      appenders: ['error'],
      level: 'error'
    },
    mongodb: {
      appenders: ['mongodb'],
      level: isPrd ? 'off' : 'all'
    },
    common: {
      appenders: ['common'],
      level:  'all'
    },
    schedule: {
      appenders: ['schedule'],
      level:  'all'
    }
  }
})
const errorLogger = log4js.getLogger('error')
const mongoDBLogger = log4js.getLogger('mongodb')
const commonLogger = log4js.getLogger('common')
const scheduleLogger = log4js.getLogger('schedule')
module.exports = {commonLogger, errorLogger, mongoDBLogger, scheduleLogger}
