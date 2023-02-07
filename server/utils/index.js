const path = require('path')
const fs = require('fs')
const {errorLogger} = require('../../common/log4')

function getFileStat(path) {
  try {
    fs.statSync(path);
    return true;
  } catch (err) {
    return false;
  }
}

function scanFilesByFolder(dir, cb) {
  let _folder = path.resolve(__dirname, dir);
  if(!getFileStat(_folder)){
    return;
  }
  try {
    const files = fs.readdirSync(_folder);
    files.forEach((file) => {
      // 递归搜索
      let fullPath = path.join(dir, file);
      const stat = fs.statSync(path.join(__dirname,fullPath));
      if(!stat.isDirectory() && !file.match(/js/)){
        // 不是目录、也不是js文件，则跳过
        return;
      }
      if(stat.isDirectory()){
        scanFilesByFolder(path.join(dir,file),cb)
      }

      let filename = file.replace('.js', '');
      let oFileCnt = require(_folder + '/' + filename);
      (typeof oFileCnt === 'function') && cb && cb(filename, oFileCnt);
    })

  } catch (error) {
    errorLogger.error('文件自动加载失败...', error)
    console.log('文件自动加载失败...', error);
  }
}

function methodToMiddleware(Controller,key){
  return function classControllerMiddleware(ctx, next){
    const controller = new Controller(ctx)
    let fn = controller[key]
    // 通过call函数调用方法，那么在函数执行之前可以插入一些逻辑，比如上下文的初始化
    return fn.call(controller, ctx, next)
  }
}

module.exports = {
  getFileStat,
  scanFilesByFolder,
  methodToMiddleware
}
