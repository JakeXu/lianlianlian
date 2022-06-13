# JXMath

> 一个开发`npm`包的demo演示

# Usage

## Use it in ES6 or Node.js

### Install:

```shell
yarn add jxmath
```

or

```shell
npm i jxmath -S
```

### Then:

```javascript
// ES6 import
import jxm from 'jxmath';

// Node.js
const jxm = require('jxmath');

// Use
jxm(123).add(456).valueOf();      // 579
```

## Use it in modern browsers

```html

<html>
<script src="./dist/jxmath.min.js"></script>
<script>
    console.log(jxm(123).add(456).valueOf()); // 579
</script>
</html>
```

## Use it in old browsers

```html

<html>
<script src="./dist/jxmath.polyfill.min.js"></script>
<script>
    console.log(jxm(123).add(456).valueOf()); // 579
</script>
</html>
```

## Features

- add()
- ...

# Other

## 操作说明

- 创建目录并执行 `npm init -y` 命令, 并完善`package.json`
- 执行 `npm login` 命令, 登录账号
- 执行 `npm publish` 命令, 发布包
- 更新包
    - 补丁修复, `npm version patch`, 如0.0.1到0.0.2
    - 新功能, `npm version minor`, 如0.1.1到0.2.2
    - 重大更新, `npm version major`, 如1.1.1到2.2.2
- 删除包
    - `npm unpublish <包名> –force`
    - `npm deprecate <包名>`
