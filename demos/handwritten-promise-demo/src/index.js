// 先定义三个常量表示状态
var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  // 这是为了防止死循环
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'))
  }

  if (x instanceof JPromise) {
    // 如果 x 为 Promise ，则使 promise 接受 x 的状态
    // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
    // 这个if跟下面判断then然后拿到执行其实重复了，可有可无
    x.then(function (y) {
      resolvePromise(promise, y, resolve, reject)
    }, reject)
  }
  // 如果 x 为对象或者函数
  else if (typeof x === 'object' || typeof x === 'function') {
    // 这个坑是跑测试的时候发现的，如果x是null，应该直接resolve
    if (x === null) {
      return resolve(x)
    }

    try {
      // 把 x.then 赋值给 then
      var then = x.then
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error)
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      var called = false
      // 将 x 作为函数的作用域 this 调用之
      // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
      // 名字重名了，我直接用匿名函数了
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          function (y) {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量called
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          function (r) {
            if (called) return
            called = true
            reject(r)
          })
      } catch (error) {
        // 如果调用 then 方法抛出了异常 e：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
        if (called) return

        // 否则以 e 为据因拒绝 promise
        reject(error)
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x)
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x)
  }
}

function JPromise(fn) {
  // 状态
  this.state = PENDING
  // 终值
  this.value = undefined
  // 拒因
  this.reason = undefined
  // 执行回调队列
  this.onFulfilledCallbacks = []
  // 拒绝回调队列
  this.onRejectedCallbacks = []

  // 存一下this,以便resolve和reject里面访问
  var that = this

  // resolve方法参数是value
  function resolve(value) {
    if (that.state === PENDING) {
      that.state = FULFILLED
      that.value = value

      // resolve里面将所有成功的回调拿出来执行
      that.onFulfilledCallbacks.forEach(callback => {
        callback(that.value)
      })
    }
  }

  // reject方法参数是reason
  function reject(reason) {
    if (that.state === PENDING) {
      that.state = REJECTED
      that.reason = reason

      // resolve里面将所有失败的回调拿出来执行
      that.onRejectedCallbacks.forEach(callback => {
        callback(that.reason)
      })
    }
  }

  try {
    fn(resolve, reject)
  } catch (error) {
    reject(error)
  }
}

JPromise.prototype.then = function (onFulfilled, onRejected) {
  var that = this   // 保存一下this
  var promise2
  var isFuncFulfilled = typeof onFulfilled === 'function'
  var isFuncRejected = typeof onRejected === 'function'

  // 如果还是PENDING状态，将回调保存下来
  if (this.state === PENDING) {
    promise2 = new JPromise(function (resolve, reject) {
      that.onFulfilledCallbacks.push(function () {
        setTimeout(function () {
          try {
            if (isFuncFulfilled) {
              var x = onFulfilled(that.value)
              resolvePromise(promise2, x, resolve, reject)
            } else {
              resolve(that.value)
            }
          } catch (error) {
            reject(error)
          }
        }, 0)
      })
      that.onRejectedCallbacks.push(function () {
        setTimeout(function () {
          try {
            if (isFuncRejected) {
              var x = onRejected(that.reason)
              resolvePromise(promise2, x, resolve, reject)
            } else {
              reject(that.reason)
            }
          } catch (error) {
            reject(error)
          }
        }, 0)
      })
    })

    return promise2
  }

  if (this.state === FULFILLED) {
    promise2 = new JPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (isFuncFulfilled) {
            var x = onFulfilled(that.value)
            resolvePromise(promise2, x, resolve, reject)
          } else {
            resolve(that.value)
          }
        } catch (error) {
          reject(error)
        }
      }, 0)
    })

    return promise2
  }

  if (this.state === REJECTED) {
    promise2 = new JPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (isFuncRejected) {
            var x = onRejected(that.reason)
            resolvePromise(promise2, x, resolve, reject)
          } else {
            reject(that.reason)
          }
        } catch (error) {
          reject(error)
        }
      }, 0)
    })

    return promise2
  }
}

JPromise.deferred = function () {
  var result = {}
  result.promise = new JPromise(function (resolve, reject) {
    result.resolve = resolve
    result.reject = reject
  })

  return result
}

JPromise.resolve = function (parameter) {
  if (parameter instanceof JPromise) {
    return parameter
  }

  return new JPromise(function (resolve) {
    resolve(parameter)
  })
}

JPromise.reject = function (reason) {
  return new JPromise(function (resolve, reject) {
    reject(reason)
  })
}

JPromise.all = function (promiseList) {
  return new JPromise(function (resolve, reject) {
    var count = 0
    var result = []
    var length = promiseList.length

    if (length === 0) {
      return resolve(result)
    }

    promiseList.forEach(function (promise, index) {
      JPromise.resolve(promise).then(function (value) {
        count++
        result[index] = value
        if (count === length) {
          resolve(result)
        }
      }, function (reason) {
        reject(reason)
      })
    })
  })
}

JPromise.race = function (promiseList) {
  return new JPromise(function (resolve, reject) {
    var length = promiseList.length

    if (length === 0) {
      return resolve()
    } else {
      for (var i = 0; i < length; i++) {
        JPromise.resolve(promiseList[i]).then(function (value) {
          return resolve(value)
        }, function (reason) {
          return reject(reason)
        })
      }
    }
  })
}

JPromise.prototype.catch = function (onRejected) {
  this.then(null, onRejected)
}

JPromise.prototype.finally = function (fn) {
  return this.then(function (value) {
    return JPromise.resolve(fn()).then(function () {
      return value
    })
  }, function (error) {
    return JPromise.resolve(fn()).then(function () {
      throw error
    })
  })
}

JPromise.allSettled = function (promiseList) {
  return new JPromise(function (resolve) {
    var length = promiseList.length
    var result = []
    var count = 0

    if (length === 0) {
      return resolve(result)
    } else {
      for (var i = 0; i < length; i++) {

        (function (i) {
          var currentPromise = JPromise.resolve(promiseList[i])

          currentPromise.then(function (value) {
            count++
            result[i] = {
              state: 'fulfilled',
              value: value
            }
            if (count === length) {
              return resolve(result)
            }
          }, function (reason) {
            count++
            result[i] = {
              state: 'rejected',
              reason: reason
            }
            if (count === length) {
              return resolve(result)
            }
          })
        })(i)
      }
    }
  })
}

module.exports = JPromise
