// 先定义三个常量表示状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError('循环引用'))
    return
  }

  if (x instanceof XPromise) {
    switch (x.state) {
      case PENDING:
        x.then((value) => {
          resolvePromise(promise, value, resolve, reject)
        }, reject)
        break
      case FULFILLED:
        resolve(x.value)
        break
      case REJECTED:
        reject(x.reason)
        break
    }
  } else if (x && ['object', 'function'].includes(typeof x)) {
    let firstRun = false
    try {
      const then = x.then

      if (typeof then === 'function') {
        const resolvePromise = (y) => {
          if (firstRun) return
          firstRun = true
          resolvePromise(promise, y, resolve, reject)
        }

        const rejectPromise = (r) => {
          if (firstRun) return
          firstRun = true
          reject(r)
        }

        then.call(x, resolvePromise, rejectPromise)
      } else {
        resolve(x) // 2.3.3.4 如果then不是函数，用x来完成promise
      }
    } catch (e) {
      if (firstRun) return
      firstRun = true
      reject(e)
    }
  } else {
    resolve(x) // 2.3.4 如果x不是对象或者函数，用x来完成promise
  }
}

class XPromise {
  constructor(fn) {
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

    // 为了代码整洁度，可以把 setTimeout 统一放到 then 方法里
    // 执行的方法
    const resolve = (value) => {
      // 需要异步，这里使用宏任务
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = FULFILLED
          this.value = value
          // 等待态->执行态
          // 需要调用执行回调队列的所有方法
          this.onFulfilledCallbacks.forEach((f) => f(this.value))
        }
      }, 0)
    }

    // 拒绝的方法
    const reject = (reason) => {
      // 需要异步，这里使用宏任务
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = REJECTED
          this.reason = reason
          // 等待态->拒绝态
          // 需要调用拒绝回调队列的所有方法
          this.onRejectedCallbacks.forEach((f) => f(this.reason))
        }
      }, 0)
    }

    // 如果报错，就调用拒绝方法
    try {
      fn(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    let promise2

    const isFuncFulfilled = typeof onFulfilled === 'function'
    const isFuncRejected = typeof onRejected === 'function'

    if (this.state === PENDING) {
      promise2 = new XPromise((resolve, reject) => {
        this.onFulfilledCallbacks.push((value) => {
          try {
            // 是否函数判断、写到里面一层
            if (isFuncFulfilled) {
              const x = onFulfilled(value)
              resolvePromise(promise2, x, resolve, reject)
            } else {
              // 在构造函数里，如果状态完成或失败了，会执行相应的回调队列。
              // 在这个方法内部，肯定是状态完成了，才执行的。
              // 而且value也是this.value
              resolve(value)
            }
          } catch (e) {
            reject(e)
          }
        })

        this.onRejectedCallbacks.push((reason) => {
          try {
            // 与上面同理
            if (isFuncRejected) {
              const x = onRejected(reason)
              resolvePromise(promise2, x, resolve, reject)
            } else {
              reject(reason)
            }
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    if (this.state === FULFILLED) {
      promise2 = new XPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            // 是否函数判断、写到里面一层
            if (isFuncFulfilled) {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } else {
              // 看看45行，状态是完成的了
              resolve(this.value)
            }
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
    }

    if (this.state === REJECTED) {
      promise2 = new XPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            // 与上面同理
            if (isFuncRejected) {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } else {
              reject(this.reason)
            }
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    return promise2
  }
}

XPromise.deferred = function () {
  var result = {}
  result.promise = new XPromise(function (resolve, reject) {
    result.resolve = resolve
    result.reject = reject
  })

  return result
}

module.exports = XPromise

// ### 参考 https://www.hxin.link/javascript/promise.html
