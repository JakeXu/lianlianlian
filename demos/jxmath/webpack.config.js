const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = function () {
  const isProd = process.env.NODE_ENV === 'production'
  const isPolyfill = process.env.POLYFILL
  const isClean = process.env.CLEAN

  let filename = 'jxmath.js'

  let rules = []
  let plugins = []
  if (isClean) {
    plugins.push(new CleanWebpackPlugin()) // 清除上一次打包内容
  }

  if (isPolyfill) {
    filename = 'jxmath.polyfill.min.js'
  } else if (isProd) {
    filename = 'jxmath.min.js'
  }

  if (isPolyfill) {
    rules = [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: '/node_modules/'
      }
    ]
  }

  const config = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename,
      library: 'jxm',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'typeof window !== "undefined" ? window : this'
    },
    plugins,
    optimization: {
      minimize: isProd
    },
    module: {
      rules
    }
  }

  return config
}
