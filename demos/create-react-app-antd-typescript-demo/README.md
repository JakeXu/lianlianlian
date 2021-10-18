# Create React App with Ant Design

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 使用说明
> 因为 husky 需要在 .git 目录才能 install, 所以 package.json 文件中的 prepare 命令在当前 demo 作为脚手架时修改为`"prepare": "husky install"`

## 配置描述
> 使用 CRA 的原因就是为了简化配置, 如非必要不推荐执行 `yarn eject`, 所有配置都基于`craco`

### [CRACO](https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#setting-a-custom-location-for-cracoconfigjs)
> 在根目录创建 `craco.config.js`, `.cracorc.js` 或 `.cracorc`, 优先级`craco.config.js` > `.cracorc.js` > `.cracorc`
- 执行 `yarn jest` [出错问题](https://github.com/ant-design/ant-design/blob/e7f5030f2bf6331483f6b21e5646fe485e1a843e/docs/react/use-with-create-react-app.en-US.md#test-with-jest)
  ```json
  {
    "jest": {
      "transformIgnorePatterns": [
        "/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime).+(js|jsx)$"
      ]
    }
  }
  ```
- [craco-fast-refresh](https://github.com/vimcaw/craco-fast-refresh)
> 在 create-react-app v4 版本上已不需要, 所以当前脚手架已不需要, 通过@pmmmwh/react-refresh-webpack-plugin 调用 [react-refresh](https://github.com/facebook/react/blob/main/packages/react-refresh/README.md)

- 文件配置说明
```javascript
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
      new AntdDayjsWebpackPlugin(), // moment.js 替换成 day.js
      // 新增模块循环依赖检测插件
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
      // 配置 babel-plugin-import antd 按需加载
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
    { plugin: CracoAntDesignPlugin } // antd 自定义主题 在 antd.customize.less 中修改
  ]
}

```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
