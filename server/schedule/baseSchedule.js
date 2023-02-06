module.exports = app => {
  const { $log4, $helper, service, $nodeCache } = app
  const { scheduleLogger, missionLogger } = $log4
  return {
    /** cron风格调度格式
     * *    *    *    *    *    *
     ┬    ┬    ┬    ┬    ┬    ┬
     │    │    │    │    │    |
     │    │    │    │    │    └ 一周的星期 (0 - 7) (0 or 7 is Sun)
     │    │    │    │    └───── 月份 (1 - 12)
     │    │    │    └────────── 月份中的日子 (1 - 31)
     │    │    └─────────────── 小时 (0 - 23)
     │    └──────────────────── 分钟 (0 - 59)
     └───────────────────────── 秒 (0 - 59, OPTIONAL)
     */
    open: false,
    interval: process.env.NODE_ENV === 'development' ? '30 * * * * *' : '0 0 1 * * *',
    handler: async () => {
      console.log('this is base schedule handle')
    }
  }
}
