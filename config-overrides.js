const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssNormalize = require('postcss-normalize')
const {proxy, antdThemeConfig} = require('./client/config/config-default')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')

const {
  override,
  addWebpackAlias,
  disableEsLint,
  addLessLoader,
  addDecoratorsLegacy,
  setWebpackPublicPath,
  overrideDevServer
} = require('customize-cra')

const devServerConfig = () => config => {
  return {
    ...config,
    compress: true,
    disableHostCheck: true,
    proxy,
  }
}

const stylus = () => config => {
  const mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
  const shouldUseSourceMap = false
  const stylusLoader = {
    test: /\.styl$/,
    include: [path.resolve(__dirname, 'client/src')],
    exclude: /node_modules/,
    sideEffects: true,
    use: [
      mode === 'prod' ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          sourceMap: shouldUseSourceMap,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          sourceMap: shouldUseSourceMap,
          plugin: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
            postcssNormalize(),
          ],
        },
      },
      {
        loader: 'resolve-url-loader',
        options: {
          sourceMap: shouldUseSourceMap,
        },
      },
      {
        loader: 'stylus-loader',
        options: {
          sourceMap: true,
        },
      }

    ]
  }

  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf
  oneOf.unshift(stylusLoader)
  return config
}

const publicPath = process.env.NODE_ENV === 'production' ? '' : ''

module.exports = {
  webpack:override(
    // use mobx 需要下面两个配置
    addDecoratorsLegacy(),
    disableEsLint(),

    // 修改antd主题色
    addLessLoader({
      javascriptEnabled: true,
      modifyVars: antdThemeConfig
    }),
    setWebpackPublicPath(publicPath),
    addWebpackAlias({
      '@pages': path.resolve(__dirname, 'client/src/pages'),
      '@api': path.resolve(__dirname, 'client/src/api'),
      '@common': path.resolve(__dirname, 'client/src/common'),
      '@config': path.resolve(__dirname, 'client/src/config'),
      '@router': path.resolve(__dirname, 'client/src/router'),
      '@components': path.resolve(__dirname, 'client/src/components'),
      '@store': path.resolve(__dirname, 'client/src/store'),
      '@assets': path.resolve(__dirname, 'client/src/assets'),
      '@utils': path.resolve(__dirname, 'client/src/common/utils'),
      '@helper': path.resolve(__dirname, 'client/src/helper')
    }),
    stylus(),
    (config, env) => {
      config = rewireReactHotLoader(config, env)
      return {
        externals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          mobx: 'mobx',
          'react-router': 'ReactRouter',
          'react-router-dom': 'ReactRouterDOM',
          'mobx-react': 'mobxReact',
          'mobx-react-lite': 'mobxReactLite',
          moment: 'moment',
          _: '_'
        },
        ...config,
      }
    }
  ),
  devServer: overrideDevServer(devServerConfig()),
  paths: function (paths, env){
    // 因为client才是前端root目录，需要重新设置下打包目录
    paths.appPath = path.join(__dirname, '/client')
    paths.appBuild = path.join(__dirname, '/public')
    paths.appPublic = path.join(__dirname, '/client/public')
    paths.appHtml = path.join(__dirname, '/client/public/index.html')
    paths.appIndexJs = path.join(__dirname, '/client/src/index.js')
    paths.appSrc = path.join(__dirname, '/client/src')
    return paths
  }
}
