'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const webpack = require('webpack')
const vueLoaderConfig = require('./vue-loader.conf')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: ['@babel/polyfill', './src/main.js']
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ?
      config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    },
    fallback: {
      fs: false
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: vueLoaderConfig
        }
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: [resolve('src'), resolve('test')],
        exclude: resolve('node_modules'),
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-sprite-loader',
        },
        include: [resolve('src/icons')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: utils.assetsPath('img/[name].[hash:7][ext]')
        },
        exclude: [resolve('src/icons')],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: utils.assetsPath('media/[name].[hash:7][ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: utils.assetsPath('/fonts/[name].[hash:7][ext]')
        }
      }
    ]
  },
  node: {
    global: false
  },
  // 引入外部库, 无需webpack打包处理
  externals: {
    mockjs: 'Mock',
    echarts: 'echarts'
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/lib\/chart\/(.)*/,
      contextRegExp: /echarts$/,
    }), //打包忽略echarts
    new VueLoaderPlugin(),
    new NodePolyfillPlugin()
  ]
}
