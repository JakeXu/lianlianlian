# Object.prototype.toString.call()

## Object.prototype.toString() 的调用

- `toString()`未被重写

    ```javascript
    ({}).toString();     // => "[object Object]"
    ```

- `toString()`被重写
  ```javascript
  var reWriteObj = { toString() { return "X"; }, };
  
  reWriteObj.toString(); // => "X"
  
  Object.prototype.toString.call(reWriteObj); // => "[object Object]"
  
  Reflect.apply(Object.prototype.toString, reWriteObj, []); // => "[object Object]"
  ```

## Object.prototype.toString() 的处理逻辑

- `null`或`undefined`, 直接返回结果

  ```javascript
  Object.prototype.toString.call(null);       // => "[object Null]"
  
  Object.prototype.toString.call(undefined);  // => "[object Undefined]"
  ```

- 非`null`和`undefined`, 则将参数转为对象再作判断

  > 对于原始类型, 转为对象的方法即[装箱](#拆箱装箱), 转为对象后, 取得该对象的`"[object " + 对象[Symbol.toStringTag] + "]"`

  ```javascript
  // Boolean 类型，tag 为 "Boolean"
  Object.prototype.toString.call(true);            // => "[object Boolean]"
  
  // Number 类型，tag 为 "Number"
  Object.prototype.toString.call(1);               // => "[object Number]"
  
  // String 类型，tag 为 "String"
  Object.prototype.toString.call("");              // => "[object String]"
  
  // Array 类型，tag 为 "String"
  Object.prototype.toString.call([]);              // => "[object Array]"
  
  // Arguments 类型，tag 为 "Arguments"
  Object.prototype.toString.call((function () {
    return arguments;
  })());                                           // => "[object Arguments]"
  
  // Function 类型， tag 为 "Function"
  Object.prototype.toString.call(function () {
  });    // => "[object Function]"
  
  // Error 类型（包含子类型），tag 为 "Error"
  Object.prototype.toString.call(new Error());     // => "[object Error]"
  
  // RegExp 类型，tag 为 "RegExp"
  Object.prototype.toString.call(/\d+/);           // => "[object RegExp]"
  
  // Date 类型，tag 为 "Date"
  Object.prototype.toString.call(new Date());      // => "[object Date]"
  
  // 其他类型，tag 为 "Object"
  Object.prototype.toString.call(new class {
  });    // => "[object Object]"
  ```

## 部署了此属性的内置对象

### 用作命名空间的对象(容器对象)

```javascript
// 都是静态方法
JSON[Symbol.toStringTag];         // => "JSON"

Math[Symbol.toStringTag];         // => "Math"

Atomics[Symbol.toStringTag];      // => "Atomics"

Reflect[Symbol.toStringTag];      // => "Reflect"
```

### 使用键的集合对象

```javascript
Set.prototype[Symbol.toStringTag];         // => "Set"

Map.prototype[Symbol.toStringTag];         // => "Map"

WeakSet.prototype[Symbol.toStringTag];     // => "WeakSet"

WeakMap.prototype[Symbol.toStringTag];     // => "WeakMap"
```

### ArrayBuffer 及其视图对象

```javascript
ArrayBuffer.prototype[Symbol.toStringTag];       // => "ArrayBuffer"

SharedArrayBuffer.prototype[Symbol.toStringTag]; // => "SharedArrayBuffer"

DataView.prototype[Symbol.toStringTag];          // => "DataView"
```

### 拆箱装箱

#### 装箱

> 把基本数据类型转换为对应的引用类型的操作(`number`, `string`, `boolean`)

  ```javascript
  // false ==> Boolean(false)
  // 1024  ==> Number(1024)
  // 字符串 ==> String('字符串')
  ```

#### 拆箱

##### ToPrimitive调用规则及顺序

> 1. 检查对象中是否有显式定义的`[Symbol.toPrimitive]`方法, 有则直接调用
> 2. 如果没有则执行原内部函数`ToPrimitive`，然后判断传入的`hint`值，如果其值为`string`，顺序调用对象的`toString`和`valueOf`方法（其中`toString`方法一定会执行, 如果其返回一个基本类型值, 则返回并终止运算, 否则继续调用`valueOf`方法）
> 3. 如果判断传入的`hint`值不为`string`, 则就可能为`number`或者`default`了, 均会顺序调用对象的`valueOf`和`toString`方法（其中`valueOf`方法一定会执行, 如果其返回一个基本类型值, 则返回并终止运算, 否则继续调用`toString`方法）

- [Object to primitive conversion](https://zh.javascript.info/object-toprimitive)
- [ToPrimitive](https://tc39.es/ecma262/#sec-toprimitive)

##### 逻辑运算符

> `null`、`undefined`、`''`、`NaN`、`0`和`false` 以外都是 true

##### 算术运算符

- 两端均为`number`类型的数据, 直接进行计算
- 两端存在非`number`的基本数据类型, 则对非`number`的运算数使用`Number()`进行装箱, 然后对返回值进行拆箱为`number`类型参与计算
- 两端存在引用数据类型, 则先对引用类型进行拆箱操作, 如果结果为非`number`类型, 则根据`条件2`执行，否则执行`条件1`

##### 字符串连接符

- 两端均为`string`类型的数据, 直接进行计算
- 两端存在非`string`的基本数据类型, 则对非`string`的运算数使用`String()`进行装箱, 然后对返回值进行拆箱为`string`类型参与拼接
- 两端存在引用数据类型, 则先对引用类型进行拆箱操作, 如果结果为非`string`类型, 则根据`条件2`执行，否则执行`条件1`

##### 关系运算符

- `NaN`和其他任何类型做关系运算始终返回`false`
- `null == undefined`结果是`true`, 其他情况皆为`false`
- 逻辑参考[算术运算符](#算术运算符)

##### 例子

- a==1 && a== 2 && a ==3

  ```javascript
  const a = { value: 0 };
  a.valueOf = function () {
    return this.value += 1;
  };
  
  console.log(a == 1 && a == 2 && a == 3); //true
  ```
- a === 1 && a === 2 && a === 3

```javascript
// 严格匹配相等没有转化的过程
var value = 0; //window.value
Object.defineProperty(window, 'a', {
  get: function () {
    return this.value += 1;
  }
});

console.log(a === 1 && a === 2 && a === 3) // true
```

## 资料

- [从深入到通俗：Object.prototype.toString.call()](https://zhuanlan.zhihu.com/p/118793721)
- [JavaScript 标准内置对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects)
- [JS对象](https://blog.csdn.net/chaopicrawl/article/details/119220919)
- [原来JS还存在这样的拆箱转换](https://juejin.cn/post/6844903769365282824)
- [JavaScript 隐式类型转换，一篇就够了！](https://chinese.freecodecamp.org/news/javascript-implicit-type-conversion/)
