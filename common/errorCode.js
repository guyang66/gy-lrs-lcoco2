const errorCode = {

  DEFAULT_ERROR: {
    code: -1,
    feedback: '系统错误',
    description: '系统有误，请稍候再试'
  },

  SYSTEM_ERROR: {
    code: -1,
    feedback: '系统错误',
    description: '系统有误，请稍候再试'
  },

  NORMAL_ERROR: {
    code: -2,
    description: ''
  },

  NOT_LOGIN: {
    code: -3,
    feedback: '无权访问（用户未登录）！',
    description: '无权访问（用户未登录）！',
  },

  // *** others ***

  SERVICE_ERROR: {
    code: 7999,
    feedback: '服务异常',
    description: '数据库服务异常'
  },

  QUERY_DATA_ERROR: {
    code: 1002,
    feedback: '服务异常（查询失败）',
    description: '服务异常（查询失败）'
  },
  USER_NOT_EXIST_ERROR: {
    code: 4002,
    message: '用户不存在或者已被禁用',
    description: '用户不存在或者已被禁用，请联系管理员！'
  },

}
module.exports = errorCode

