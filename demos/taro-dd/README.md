# Taro DD

当前项目是 [钉钉小程序](http://taro-docs.jd.com/taro/docs/GETTING-STARTED/#%E9%92%89%E9%92%89%E5%B0%8F%E7%A8%8B%E5%BA%8F) 说明

## 使用说明
> taro init taro-dd
> 
> 选择 React > No > Sass > Github（最新）> taro-hooks（使用 taro-hooks 的模板）
> 
> yarn add @tarojs/plugin-platform-alipay-dd

## 配置描述
```js
// config/index.js
{
  plugins: [
    "@tarojs/plugin-platform-alipay-dd"
  ]
}
```
```json
{
  "scripts": {
    "build:dd": "taro build --type dd",
    "dev:dd": "set NODE_ENV=production && taro build --type dd --watch"
  }
}
```

##运行
```shell
yarn dev:dd
```
> 使用小程序开发者工具使用 DingTalk 模式打开 dist 目录即可查看效果
