/* craco.config.js */
/**
 * 区分环境 —— NODE_ENV
 * - whenDev ☞ process.env.NODE_ENV === 'development'
 * - whenTest ☞ process.env.NODE_ENV === 'test'
 * - whenProd ☞ process.env.NODE_ENV === 'production'
 */
const CircularDependencyPlugin = require('circular-dependency-plugin')
const path = require('path')
const CracoAntDesignPlugin = require('craco-antd')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')
const WebpackBar = require('webpackbar')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const DashboardPlugin = require('webpack-dashboard/plugin')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

const { when, whenDev } = require('@craco/craco')

const isBuildAnalyzer = process.env.BUILD_ANALYZER === 'true'

module.exports = {
  webpack: {
    plugins: [
      // webpack构建进度条
      new WebpackBar({ profile: true }),
      new SimpleProgressWebpackPlugin(),
      new AntdDayjsWebpackPlugin(),
      // // 新增模块循环依赖检测插件
      ...whenDev(
        () => [
          new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd()
          }),
          // webpack-dev-server 强化插件
          new DashboardPlugin()
        ],
        []
      ),
      /**
       * 编译产物分析
       *  - https://www.npmjs.com/package/webpack-bundle-analyzer
       * 新增打包产物分析插件
       */
      ...when(
        isBuildAnalyzer,
        () => [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static', // html 文件方式输出编译分析
            openAnalyzer: false,
            reportFilename: path.resolve(__dirname, `analyzer/index.html`)
          })
        ],
        []
      )
    ]
  },
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false, // 对ES6的模块文件不做转化，以便使用tree shaking、sideEffects等
          useBuiltIns: 'entry', // browserslist环境不支持的所有垫片都导入
          // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
          // https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
          corejs: {
            version: 3, // 使用core-js@3
            proposals: true
          }
        }
      ]
    ],
    plugins: [
      // 配置 babel-plugin-import
      ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
      // 配置解析器
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      ['@babel/plugin-proposal-private-methods', { 'loose': true }],
      ['@babel/plugin-proposal-private-property-in-object', { 'loose': true }],
      ['babel-plugin-styled-components', { 'displayName': true }] // 服务端使用
    ]
  },
  plugins: [
    { plugin: CracoAntDesignPlugin }
  ]
}
