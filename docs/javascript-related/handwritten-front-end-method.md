# Handwritten front-end method

> 总是使用第三方类库, 偶尔也可以自己动动手实现一下

## 防抖

```javascript
function debounce(fn, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 测试
function task() {
  console.log('run task')
}

const debounceTask = debounce(task, 1000)
window.addEventListener('scroll', debounceTask)
```

## 节流

```javascript
function throttle(fn, delay) {
  let last = 0 // 上次触发时间
  return function (...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

// 测试
function task() {
  console.log('run task')
}

const throttleTask = throttle(task, 1000)
window.addEventListener('scroll', throttleTask)
```

## 深拷贝

### 简易版

```javascript
JSON.parse(JSON.stringify())
```

### 基础版

```javascript
function deepClone(target) {
  let cloneTarget = {};
  for (const key in target) {
    cloneTarget[key] = target[key];
  }
  return cloneTarget;
};
```

> 问题:

- 如果是原始类型，无需继续拷贝，直接返回
- 如果是引用类型，创建一个新的对象，遍历需要克隆的对象，将需要克隆对象的属性执行深拷贝后依次添加到新对象上

```javascript
function deepClone(target) {
  if (typeof target === 'object') {
    let cloneTarget = {};
    for (const key in target) {
      cloneTarget[key] = deepClone(target[key]);
    }
    return cloneTarget;
  } else {
    return target;
  }
};

// 测试格式
const target = {
  field1: 1,
  field2: undefined,
  field3: 'field3',
  field4: {
    child: 'child',
    child2: {
      child2: 'child2'
    }
  }
};

```

### 考虑数组

```javascript
function deepClone(target) {
  if (typeof target === 'object') {
    let cloneTarget = Array.isArray(target) ? [] : {};
    for (const key in target) {
      cloneTarget[key] = deepClone(target[key]);
    }
    return cloneTarget;
  } else {
    return target;
  }
};

//测试格式
const target = {
  field1: 1,
  field2: undefined,
  field3: {
    child: 'child'
  },
  field4: [2, 4, 8]
};
```

### 循环引用

```javascript
function deepClone(target, map = new Map()) {
  if (typeof target === 'object') {
    let cloneTarget = Array.isArray(target) ? [] : {};
    const mapValue = map.get(target)
    if (mapValue) {
      return mapValue;
    }
    for (const key in target) {
      cloneTarget[key] = deepClone(target[key], map);
    }
    map.set(target, cloneTarget);
    return cloneTarget;
  } else {
    return target;
  }
};

//测试格式
const target = {
  field1: 1,
  field2: undefined,
  field3: {
    child: 'child'
  },
  field4: [2, 4, 8]
};
target.target = target;
```

### 其他数据类型

#### 判断引用类型

```javascript
function isObject(target) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}
```

#### 获取数据类型

> 每一个引用类型都有`toString`方法，默认情况下，`toString()`方法被每个`Object`对象继承。如果此方法在自定义对象中未被覆盖，`toString()` 返回 "`[object type]`"，其中`type`是对象的类型。

```javascript
function getType(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return Object.prototype.toString.call(value);
}
```

##### 概念

- [Object.prototype.toString.call()](./object-prototype-tostring-call.md)

#### 分类

- 可以继续遍历的类型
    - Map
    - Set
    - Array
    - Object
    - Arguments

```javascript
// 使用原对象的构造方法，所以它可以保留对象原型上的数据
function getInit(target) {
  const Ctor = target.constructor;
  return new Ctor();
}

// 修改为
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
const argsTag = '[object Arguments]';

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag];

function deepClone(target, map = new Map()) {
  // 克隆原始类型
  if (!isObject(target)) {
    return target;
  }
  // 初始化
  const type = getType(target);
  let cloneTarget;
  if (deepTag.includes(type)) {
    cloneTarget = getInit(target, type);
  }

  // 防止循环引用
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);

  // 克隆set
  if (type === setTag) {
    target.forEach(value => {
      cloneTarget.add(deepClone(value, map));
    });
    return cloneTarget;
  }

  // 克隆map
  if (type === mapTag) {
    target.forEach((value, key) => {
      cloneTarget.set(key, deepClone(value, map));
    });
    return cloneTarget;
  }

  // 克隆对象和数组
  const keys = type === arrayTag ? undefined : Object.keys(target);
  forEach(keys || target, (value, key) => {
    if (keys) {
      key = value;
    }
    cloneTarget[key] = deepClone(target[key], map);
  });

  return cloneTarget;
};
```

- 不可以继续遍历的类型
    - Boolean
    - Date
    - Number
    - String
    - Symbol
    - Error
    - RegExp
    - Function

```javascript
// 加入不可以继续遍历的类型的处理
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
const argsTag = '[object Arguments]';

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag];

function cloneSymbol(symbol) {
  return Object(Symbol.prototype.valueOf.call(symbol))
}

function cloneRegExp(regexp) {
  const reFlags = /\w*$/
  const result = new regexp.constructor(regexp.source, reFlags.exec(regexp))
  result.lastIndex = regexp.lastIndex
  return result
} // 说明: https://juejin.cn/post/6844903775384125448

// 箭头函数没有 `prototype` 属性
function cloneFunction(func) {
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  if (func.prototype) {
    console.log('普通函数');
    const param = paramReg.exec(funcString);
    const body = bodyReg.exec(funcString);
    if (body) {
      console.log('匹配到函数体：', body[0]);
      if (param) {
        const paramArr = param[0].split(',');
        console.log('匹配到参数：', paramArr);
        return new Function(...paramArr, body[0]);
      } else {
        return new Function(body[0]);
      }
    } else {
      return null;
    }
  } else {
    return eval(funcString);
  }
}

function cloneOtherType(target, type) {
  const Ctor = target.constructor;
  switch (type) {
    case boolTag:
    case numberTag:
    case stringTag:
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return cloneReg(target);
    case symbolTag:
      return cloneSymbol(target);
    case funcTag:
      return cloneFunction(target);
    default:
      return null;
  }
}

function isObject(target) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}

// 使用原对象的构造方法，所以它可以保留对象原型上的数据
function getInit(target) {
  const Ctor = target.constructor;
  return new Ctor();
}

function deepClone(target, map = new Map()) {
  // 克隆原始类型
  if (!isObject(target)) {
    return target;
  }
  // 初始化
  const type = getType(target);
  let cloneTarget;
  if (deepTag.includes(type)) {
    cloneTarget = getInit(target);
  } else {
    return cloneOtherType(target, type);
  }

  // 防止循环引用
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);

  // 克隆set
  if (type === setTag) {
    target.forEach(value => {
      cloneTarget.add(deepClone(value, map));
    });
    return cloneTarget;
  }

  // 克隆map
  if (type === mapTag) {
    target.forEach((value, key) => {
      cloneTarget.set(key, deepClone(value, map));
    });
    return cloneTarget;
  }

  // 克隆对象和数组
  const keys = type === arrayTag ? undefined : Object.keys(target);
  forEach(keys || target, (value, key) => {
    if (keys) {
      key = value;
    }
    cloneTarget[key] = deepClone(target[key], map);
  });

  return cloneTarget;
};
```

### 知识点

- 基本实现
    - 递归能力
- 循环引用
    - 考虑问题的全面性
    - 理解`WeakMap`的真正意义
- 多种类型
    - 考虑问题的严谨性
    - 创建各种引用类型的方法，JS API的熟练程度
    - 准确的判断数据类型，对数据类型的理解程度
- 通用遍历
    - 写代码可以考虑性能优化
    - 了解集中遍历的效率
    - 代码抽象能力
- 拷贝函数
    - 箭头函数和普通函数的区别
    - 正则表达式熟练程度

## 手写`Promise`

### Promises/A+规范

#### 术语

- `promise`：是一个拥有`then`方法的对象或函数，其行为符合本规范
- `thenable`：是一个定义了`then`方法的对象或函数。这个主要是用来兼容一些老的Promise实现，只要一个Promise实现是thenable，也就是拥有`then`方法的，就可以跟Promises/A+兼容。
- `value`：指`reslove`出来的值，可以是任何合法的JS值(包括 undefined , thenable 和 promise等)
- `exception`：异常，在Promise里面用`throw`抛出来的值
- `reason`：拒绝原因，是`reject`里面传的参数，表示`reject`的原因

#### Promise状态

> 这里的不可变指的是`===`，也就是说，如果`value`或者`reason`是对象，只要保证引用不变就行，规范没有强制要求里面的属性也不变

- `pending`：一个promise在resolve或者reject前就处于这个状态
- `fulfilled`：一个promise被resolve后就处于`fulfilled`状态，这个状态不能再改变，而且必须拥有一个**不可变**的值(`value`)
- `rejected`：一个promise被reject后就处于`rejected`状态，这个状态也不能再改变，而且必须拥有一个**不可变**的拒绝原因(`reason`)

#### then方法

> 一个promise必须拥有一个`then`方法来访问他的值或者拒绝原因。`then`方法有两个参数：promise.then(onFulfilled, onRejected)

##### 参数可选

- `onFulfilled`
    - 函数
        - 当 promise 执行结束后其必须被调用，其第一个参数为 promise 的终值`value`
        - 在 promise 执行结束前其不可被调用
        - 其调用次数不可超过一次
    - 不是函数(忽略)
- `onRejected`
    - 函数
        - 当 promise 被拒绝执行后其必须被调用，其第一个参数为 promise 的拒因`reason`
        - 在 promise 被拒绝执行前其不可被调用
        - 其调用次数不可超过一次
    - 不是函数(忽略)

##### 多次调用

- 当 promise 成功执行时，所有`onFulfilled`需按照其注册顺序依次回调
- 当 promise 被拒绝执行时，所有的`onRejected`需按照其注册顺序依次回调

##### 返回

> then 方法必须返回一个`promise`对象。promise2 = promise1.then(onFulfilled, onRejected);

- 如果 onFulfilled 或者 onRejected 返回一个值 `x` ，则运行 Promise 解决过程：`[[Resolve]](promise2, x)`
- 如果 onFulfilled 或者 onRejected 抛出一个异常 `e` ，则 promise2 必须拒绝执行，并返回拒因`e`
- 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
- 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的拒因

### 手写Promise

[手写Promise](../../demos/handwritten-promise-demo/README.md)
