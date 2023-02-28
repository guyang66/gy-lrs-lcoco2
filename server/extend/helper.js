const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const errorCode = require('../../common/errorCode')
const getRandom = function (n, m) {
  n = Number(n);
  m = Number(m);
  if(n > m){
    let tmp = n;
    n = m;
    m = tmp
  }
  return Math.floor(Math.random() * (m - n) + n);
}
module.exports = app => ({
  /**
   * 封装response对象
   */
  Result : {
    success (content) {
      return {
        success: true,
        data: content,
        errorCode: null,
        errorMessage: null
      }
    },

    fail (code, message) {
      return {
        success: false,
        data: null,
        errorCode: code,
        errorMessage: message ? message : ''
      }
    },

    error (errorKey) {
      let body = errorCode[errorKey] ? errorCode[errorKey] : errorCode['DEFAULT_ERROR']
      return {
        success: false,
        data: null,
        errorCode: body.code,
        errorMessage: body.message
      }
    }
  },

  /**
   *
   * @param success
   * @param msg
   * @param code
   * @returns {{result}}
   */
  wrapResult (success, msg, code) {
    let obj = {
      result: !!success,
    }
    if(success){
      obj.data = msg
    } else {
      obj.errorMessage = errorCode[msg] ? errorCode[msg].message : msg
      obj.errorCode = errorCode[msg] ? errorCode[msg].code :code
    }
    return obj
  },

  isEmpty (obj) {
    return obj === null || obj === undefined || obj === ''
  },

  isEmptyObject (obj) {
    return obj === {} || obj === null || obj === undefined || obj === ''
  },

  formatDateYYMMDD (t) {
    if(!t || t === ''){
      t = new Date()
    }
    if(!(t instanceof Date)){
      t = new Date(t)
    }
    let y = t.getFullYear()
    let m = t.getMonth() + 1
    let d = t.getDate()
    return '' + y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)
  },

  formatDateHHMMSS (t) {
    if(!t){
      t = new Date()
    }

    if(!(t instanceof Date)){
      t = new Date(t)
    }
    let h = t.getHours()
    let m = t.getMinutes()
    let s = t.getSeconds()
    return (h < 10 ? ('0' + h) : h) + ':' + (m < 10 ? ('0' + m) : m ) + ':' + (s < 10 ? ('0' + s) : s)
  },

  /**
   * 格式日期
   * @param t
   * @returns {string}
   */
  formatDate (t) {
    if(!t){
      t = new Date()
    }

    if(!(t instanceof Date)){
      t = new Date(t)
    }
    let h = t.getHours()
    let m = t.getMinutes()
    let s = t.getSeconds()
    return this.formatDateYYMMDD(t) + ' ' + (h < 10 ? ('0' + h) : h) + ':' + (m < 10 ? ('0' + m) : m ) + ':' + (s < 10 ? ('0' + s) : s)
  },
  /**
   * 同步等待，延迟
   * @param ms
   * @returns {Promise<unknown>}
   */
  wait (ms) {
    return new Promise(resolve => setTimeout(() =>resolve(), ms));
  },

  /**
   * 密码加密
   * @param password
   * @returns {Promise<void>}
   */
  async createPassword (password) {
    let { $config } = app;
    const hmac = crypto.createHash("sha256", $config.crypto.secret);
    hmac.update(password.toString());
    return hmac.digest("hex");
  },

  /**
   * 检查密码
   * @returns {Promise<void>}
   */
  async checkPassword (password, dbPasseord) {
    let target = await this.createPassword(password);
    return target === dbPasseord
  },

  /**
   * 生成token
   * @returns {Promise<void>}
   */
  async createToken( data ) {
    let { $config, $jwtKey } = app;
    // 测试环境用固定secret
    // if($config.jwt.resetWhenReload && process.env.NODE_ENV === 'production'){
    //   return await jwt.sign(data, $jwtKey, {expiresIn: 30 * 24 * 60 * 60 + 's'});
    // }
    return await jwt.sign(data, $config.jwt.secret, {expiresIn: 30 * 24 * 60 * 60 + 's'});
  },

  /**
   * 检查token
   * @param token
   * @returns {Promise<void>}
   */
  async checkToken (token) {
    let { $config, $jwtKey } = app;
    // if($config.jwt.resetWhenReload && process.env.NODE_ENV === 'production'){
    //   return await jwt.verify(token, $jwtKey)
    // }
    return await jwt.verify(token, $config.jwt.secret)
  },

  /**
   * decode token
   * @param token
   * @returns {Promise<*>}
   */
  async decodeToken (token) {
    return await jwt.decode(token)
  },

  getRandomCode () {
    let codeSet = '0123456789'
    let str = '';
    for (let i = 0; i < 6; i ++) {
      let ran = getRandom(0, 6);
      str += codeSet.charAt(ran);
    }
    return str
  },

  /**
   * 获取随机不重复的玩家数组（整数数组）
   * @param roleArray
   * @returns {this}
   */
  getRandomNumberArray (roleArray) {
    let l = roleArray.length
    let arr = []
    let map = {}
    const newNum = () => {
      let num
      do {
        num = Math.floor(Math.random() * l ) + 1
      }
      while (map[num])
      return num
    }

    for(let i = 0 ;i < l ;i++) {
      let num = newNum()
      if(-1 === arr.indexOf(num)){
        arr.push({
          number: num,
          role: roleArray[i]
        })
        map[num] = num
      }
    }
    return arr.sort(function (a,b){return a.number - b.number})
  },

  /**
   * 找到数组中重复次数最多的元素
   * @param array
   * @returns {string}
   */
  findMaxInArray (array) {
    let map = {}
    array.forEach((item,index) => {
      if(array.indexOf(item) === index){
        map[item] = 1
      }else{
        map[item] = map[item] + 1
      }
    })

    let max = 0
    let target = array[0]
    for(let key in map) {
      if(map[key] > max){
        max = map[key]
        target = key
      }
    }
    return target
  },

  /**
   * 找到数组中重复次数最多的元素，以数组形式返回
   * @param arr
   * @returns {[]}
   */
  findMaxValue (arr) {
    let obj = {}
    for(let i = 0; i < arr.length; i++){
      let arr2 = Object.keys(obj)
      if(arr2.indexOf(String(arr[i])) !== -1){
        obj[arr[i]]++
      } else {
        obj[arr[i]] = 1
      }
    }
    let max = 0
    let ans = []
    for(let i in obj){
      if(obj[i] > max){
        max = obj[i]
        ans.length = 0
        ans.push(i)
      }else if(obj[i] === max){
        ans.push(i)
      }
    }
    return ans
  },

  /**
   * 是否含有该元素
   */
  hasElement (array, target) {
    if(!array || array.length < 1 || !target || target === ''){
      return false
    }
    return array.find(item=>{
      return item === target
    })
  }

})
