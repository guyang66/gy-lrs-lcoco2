import fetch from '@common/fetch'
const urlPrefix = '/api/'
export default {

  createRoom (params) {
    return fetch({
      url: urlPrefix + 'room/create/auth',
      method: 'get',
      params,
    })
  },

  getRoomMode (params) {
    return fetch({
      url: urlPrefix + 'room/mode/auth',
      method: 'get',
      params,
    })
  },

  changeRoomMode (params) {
    return fetch({
      url: urlPrefix + 'room/mode/change/auth',
      method: 'get',
      params,
    })
  },

  getRoomInfo (params) {
    return fetch({
      url: urlPrefix + 'room/info/auth',
      method: 'get',
      params,
    })
  },

  joinRoom (params) {
    return fetch({
      url: urlPrefix + 'room/join/auth',
      method: 'get',
      params,
    })
  },

  seatIn (params) {
    return fetch({
      url: urlPrefix + 'room/seat/auth',
      method: 'get',
      params,
    })
  },

  kickPlayer (params) {
    return fetch({
      url: urlPrefix + 'room/kick/auth',
      method: 'get',
      params,
    })
  },

  quitRoom (params) {
    return fetch({
      url: urlPrefix + 'room/quit/auth',
      method: 'get',
      params,
    })
  },

  modifyNameInRoom (params) {
    return fetch({
      url: urlPrefix + 'room/modifyName/auth',
      method: 'get',
      params,
    })
  }

}
