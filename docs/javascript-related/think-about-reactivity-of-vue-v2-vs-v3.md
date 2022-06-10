# Vue 2.x 和 3.x 响应式实现的一些思考

## 2.x

![](../imgs/vue-2.x.png)
> 当你把一个普通的 JavaScript 对象传入 Vue 实例作为 data 选项，Vue 将遍历此对象所有的 property，并使用 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 把这些 property 全部转为 [getter/setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects#%E5%AE%9A%E4%B9%89_getters_%E4%B8%8E_setters)

### Object.defineProperty

#### 语法

```javascript
Object.defineProperty(obj, prop, descriptor)
```

#### 描述

- configurable
    - 默认为`false`
    - 仅当该属性的 `configurable` 键值为 `true` 时, 该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除
- enumerable
    - 默认为`false`
    - 仅当该属性的 `enumerable` 键值为 `true` 时, 该属性才会出现在for...in 和 Object.keys()枚举
- value
    - 默认为`undefined`
    - 属性对应的值, 可以是任何有效的 JavaScript 值（数值, 对象, 函数等）
- writable
    - 默认为`false`
    - 仅当该属性的 writable 键值为 true 时, `value`，才能被赋值
- get
    - 默认为`undefined`
    - 当访问该属性时, 会调用此函数
- set
    - 默认为`undefined`
    - 当属性值被修改时, 会调用此函数

#### 实现

```javascript
function Vue() {
  this.$data = { age: 1 };
  this.el = document.getElementById('root');
  this.virtualDom = '';
  this.reactive(this.$data);
  this.render();
}

Vue.prototype.reactive = function (obj) {
  let value;
  const self = this;
  for (let key in obj) {  // 递归设置set和get
    value = obj[key];
    if (typeof value === 'object') {
      self.reactive(value);
    } else {
      Object.defineProperty(self.$data, key, {
        get: function () {
          return value;
        },
        set: function (newValue) {
          value = newValue;
          self.render();
        }
      });
    }
  }
}

Vue.prototype.render = function () {
  this.virtualDom = `I am ${this.$data.age} years old.`;
  this.el.innerHTML = this.virtualDom;
}
```

// 优化: 当前为全量更新, 可以加入 [dep](https://github.com/vuejs/vue/blob/dev/src/core/observer/dep.js) 来加以管理

##### 特殊处理数组

```javascript
var arrayPrototype = Array.prototype;             // 获取Array的原型
var obj = Object.create(arrayPrototype);          // 用Array的原型创建一个新对象，obj.__proto__ === arrayPrototype，免得污染原生Array;
const rewriteMethods = ['push', 'pop', 'shift'];  // 需要重写的方法
function def(obj, key, value) {
  Object.defineProperty(obj, key, {
    // 这里没有指定writeable, 默认为false，即不可修改
    enumerable: true,
    configurable: true,
    value: value,
  });
}

// 数组方法重写改为
rewriteMethods.forEach(function (method) {
  const self = this;
  def(obj, method, function () {
    arrayPrototype[method].apply(this, arguments);  // 重写时先调用原生方法
    self.render();                                  // 并且同时更新
  });
});
```

## 3.x

> `Proxy`和`Reflect`方法一一对应

### 语法

```javascript
const p = new Proxy(target, handler)
```

- target
- handler

###                  

### 优势

- `Proxy`可以直接监听整个对象, 不需要对多层嵌套的对象做递归监听
- `Proxy`的`get`方法会传入对象和属性, 可以直接在函数内部操作, 不需要外部变量
- `set`方法也一样
- `new Proxy()`会返回一个新对象, 不会污染源原对象
- `Proxy`可以监听数组, 不用单独处理数组

```javascript
Vue.prototype.reactive = function (obj) {
  const self = this;
  this.$data = new Proxy(this.$data, {
    get: function (target, key) {
      return Reflect.get(target, key);
    },
    set: function (target, key, newValue) {
      Reflect.set(target, key, newValue);
      self.render();
    }
  });
}
```

### 数据校验

```javascript
const target = {
  _id: '1024',
  name: 'vuejs'
}

const validators = {
  name(val) {
    return typeof val === 'string';
  },
  _id(val) {
    return typeof val === 'number' && val > 1024;
  }
}

const createValidator = (target, validator) => {
  return new Proxy(target, {
    _validator: validator,
    set(target, propkey, value, proxy) {
      let validator = this._validator[propkey](value)
      if (validator) {
        return Reflect.set(target, propkey, value, proxy)
      } else {
        throw Error(`Cannot set ${propkey} to ${value}. Invalid type.`)
      }
    }
  })
}

const proxy = createValidator(target, validators)

proxy.name = 'vue-js.com' // vue-js.com
proxy.name = 10086 // Uncaught Error: Cannot set name to 10086. Invalid type.
proxy._id = 1025 // 1025
proxy._id = 22  // Uncaught Error: Cannot set _id to 22. Invalid type
```

## 资料

- [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [通过Proxy和Reflect实现vue的响应式原理](https://segmentfault.com/a/1190000041102614)
