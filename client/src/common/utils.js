// import menusIcon from "@config/menu-icon"
import config from '@config'
const getCurrentDate = (t, symbol = '-') =>{
  if(!t){
    t = new Date()
  }

  if(!(t instanceof Date)){
    t = new Date(t)
  }
  const y = t.getFullYear()
  const m = t.getMonth() + 1
  const d = t.getDate()
  return `${  y  }${symbol  }${m < 10 ? (`0${  m}`) : m  }${symbol  }${d < 10 ? (`0${  d}`) : d}`
}

const getDateString = (t) => {
  if(!t){
    t = new Date()
  }

  if(!(t instanceof Date)){
    t = new Date(t)
  }
  const y = t.getFullYear()
  const m = t.getMonth() + 1
  const d = t.getDate()
  return  y + '年' + (m < 10 ? '0' + m : m) + '月' +(d < 10 ? '0' + d : d) + '日'
}

const getCurrentDateYYDDMMhhmmss = (t) => {
  if(!t){
    t = new Date()
  }

  if(!(t instanceof Date)){
    t = new Date(t)
  }
  const h = t.getHours()
  const m = t.getMinutes()
  const s = t.getSeconds()
  return `${getCurrentDate(t, '-')  } ${  h < 10 ? (`0${  h}`) : h  }:${  m < 10 ? (`0${  m}`) : m  }:${  s < 10 ? (`0${  s}`) : s}`
}

const getDateDir = (t) => {
  if(!t){
    t = new Date()
  }

  if(!(t instanceof Date)){
    t = new Date(t)
  }
  const h = t.getHours()
  const m = t.getMinutes()
  const s = t.getSeconds()
  return getCurrentDate(t, '')  + (h < 10 ? (`0${  h}`) : h) + (m < 10 ? (`0${  m}`) : m ) + (s < 10 ? (`0${  s}`) : s)
}

const getMenuIconByKey = () => {
  return ''
}

const verifyEmailFormat = (email) => {
  if(!email || email === ''){
    return false
  }
  const reg = /^((?:[0-9a-zA-Z_]+.)+@[0-9a-zA-Z-]{1,13}\.[com,cn,net]{1,3})$/
  return reg.test(email)
}

const verifyPhoneFormat = (phone) => {
  if(!phone || phone === ''){
    return false
  }
  if(phone.length !== 13) {
    return false
  }
  return (/^1[3456789]\d{9}$/.test(phone))
}

const getFixUrl = (url) => {
  if(!url || url === ''){
    return ''
  }
  if(url.indexOf('http') > -1 || url.indexOf('https') > -1) {
    return url
  }
  if(process.env.NODE_ENV === 'development'){
    return 'http://localhost:8090' + url
  }
  // 生产环境可以怎么搞
  return  `${  window.location.origin  }${url}`
}

const getWsUrl = () => {
  if(process.env.NODE_ENV === 'production'){
    return config.websocket.prd
  }
  return config.websocket.dev
}

const speechProp = (text) => {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text
  msg.lang = 'zh_CN'
  msg.volume = 50
  msg.rate = 0.8
  msg.pitch = 0
  speechSynthesis.speak(msg)
}

export default  {
  getMenuIconByKey,
  getCurrentDate,
  getCurrentDateYYDDMMhhmmss,
  getDateDir,
  verifyEmailFormat,
  verifyPhoneFormat,
  getFixUrl,
  getDateString,
  getWsUrl,
  speechProp
}
