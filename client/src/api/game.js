import fetch from '@common/fetch'
const urlPrefix = '/api/'
export default {

  startGame (param) {
    return fetch({
      url: urlPrefix + 'game/start/auth',
      method: 'post',
      data: param,
    })
  },

  getGameInfo (params) {
    return fetch({
      url: urlPrefix + 'game/info/auth',
      method: 'get',
      params,
    })
  },

  nextStage (params) {
    return fetch({
      url: urlPrefix + 'game/nextStage/auth',
      method: 'get',
      params,
    })
  },

  gameRecord (params) {
    return fetch({
      url: urlPrefix + 'game/record/auth',
      method: 'get',
      params,
    })
  },

  checkPlayer (params) {
    return fetch({
      url: urlPrefix + 'game/checkPlayer/auth',
      method: 'get',
      params,
    })
  },

  defendPlayer (params) {
    return fetch({
      url: urlPrefix + 'game/defendPlayer/auth',
      method: 'get',
      params,
    })
  },

  assaultPlayer (params) {
    return fetch({
      url: urlPrefix + 'game/assaultPlayer/auth',
      method: 'get',
      params,
    })
  },

  antidotePlayer (params) {
    return fetch({
      url: urlPrefix + 'game/antidotePlayer/auth',
      method: 'get',
      params,
    })
  },

  votePlayer (params) {
    return fetch({
      url: urlPrefix + 'game/votePlayer/auth',
      method: 'get',
      params,
    })
  },

  poisonPlayer (params) {
    return fetch({
      url: urlPrefix + 'game/poisonPlayer/auth',
      method: 'get',
      params,
    })
  },

  shootPlayer (params) {
    return fetch({
      url: urlPrefix + 'game/shootPlayer/auth',
      method: 'get',
      params,
    })
  },

  boomPlayer (params) {
    return fetch({
      url: urlPrefix + 'game/boomPlayer/auth',
      method: 'get',
      params,
    })
  },

  gameResult (params) {
    return fetch({
      url: urlPrefix + 'game/result/auth',
      method: 'get',
      params,
    })
  },

  gameDestroy (params) {
    return fetch({
      url: urlPrefix + 'game/destroy/auth',
      method: 'get',
      params,
    })
  },

  gameAgain (params) {
    return fetch({
      url: urlPrefix + 'game/again/auth',
      method: 'get',
      params,
    })
  },

  obGame (params) {
    return fetch({
      url: urlPrefix + 'game/ob/auth',
      method: 'get',
      params,
    })
  },

  getGameSettings(params) {
    return fetch({
      url: urlPrefix + 'game/settings/auth',
      method: 'get',
      params,
    })
  }
}
