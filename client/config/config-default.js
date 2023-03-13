module.exports = {
  proxy: [
    {
      context: ['/api'],
      target: 'http://localhost:6100/api',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  ],
  // antd 主题配置
  antdThemeConfig: {
    '@primary-color': '#4169E1', // 全局主色
    '@link-color': '#4169E1', // 链接色
    '@font-size-base': '12px',
  },

  // 外部资源地址
  resources: [
    '//cdn.yyyangyang.com/public/babel-polyfill/6.26.0/polyfill.min.js',
    '//cdn.yyyangyang.com/public/react/16.13.1/react.min.js',
    '//cdn.yyyangyang.com/public/react-dom/16.13.1/react-dom.min.js',
    '//cdn.yyyangyang.com/public/react-router/5.2.0/react-router.min.js',
    '//cdn.yyyangyang.com/public/react-router-dom/5.2.0/react-router-dom.min.js',
    '//cdn.yyyangyang.com/public/mobx/5.15.4/mobx.umd.min.js',
    '//cdn.yyyangyang.com/public/mobx-react-lite/2.0.6/mobxreactlite.umd.production.min.js',
    '//cdn.yyyangyang.com/public/mobx-react/6.2.2/mobxreact.umd.production.min.js',
    '//cdn.yyyangyang.com/public/moment/2.24.0/moment.min.js',
    '//cdn.yyyangyang.com/public/moment/2.24.0/zh-cn.js',
    '//cdn.yyyangyang.com/public/antd/4.16.0/antd.min.js',
    '//cdn.yyyangyang.com/public/lodash/4.17.11/lodash.min.js',
  ],
}
