# Create React App 多环境配置

[Adding Custom Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables)

## 需求

> 一般情况下只要开发与生产环境, 但有时候需要多套生产环境

## 实现
> 因为有<code>react-scripts@0.2.3</code>或者更高, Create React App 默认就支持多环境配置, 变量名以<code>REACT_APP_</code>打头

```markdown
.env: Default.
.env.local: Local overrides. This file is loaded for all environments except test.
.env.development, .env.test, .env.production: Environment-specific settings.
.env.development.local, .env.test.local, .env.production.local: Local overrides of environment-specific settings.
```
左侧文件的优先级高于右侧文件：
```markdown
npm start: .env.development.local, .env.local, .env.development, .env
npm run build: .env.production.local, .env.local, .env.production, .env
npm test: .env.test.local, .env.test, .env (note .env.local is missing)
```

## 注意点
> 通过上面的阅读可以获知, production的配置文件是跟着 build 脚本的, 如果需要打破这种默认逻辑, 则只要在执行语句里指定就行 
```shell
dotenv -e .env.production.local npm run build
```
