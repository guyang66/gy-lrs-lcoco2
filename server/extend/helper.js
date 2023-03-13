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
   * 是否是空
   * @param obj
   * @returns {boolean}
   */
  isEmpty (obj) {
    return obj === null || obj === undefined || obj === ''
  },

  /**
   * 是否是空对象
   * @param obj
   * @returns {boolean}
   */
  isEmptyObject (obj) {
    return obj === {} || obj === null || obj === undefined || obj === ''
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

  /**
   * 获取一组随机数
   * @param l
   * @returns {string}
   */
  getRandomCode (l = 6) {
    let codeSet = '0123456789'
    let str = '';
    for (let i = 0; i < l; i ++) {
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
  },

  /**
   * 把map变成数组
   * @param map
   * @returns {[]|*[]}
   */
  mapToArray (map) {
    if(this.isEmptyObject(map)){
      return []
    }
    let tmp = []
    for(let key in map){
      tmp.push(map[key])
    }
    return tmp
  }

})
