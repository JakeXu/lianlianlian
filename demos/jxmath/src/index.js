function JXMath(num) {
  return new JXMath.fn.init(num)
}

JXMath.fn = JXMath.prototype = {
  constructor: JXMath,
  valueOf: function () {
    const { decimal = 0 } = this
    return decimal.toString()
  }
}

JXMath.fn.init = function (num) {
  if (num === undefined) {
    return this
  }
  this.decimal = BigInt(num)
}

JXMath.fn.init.prototype = JXMath.fn

JXMath.fn.add = function (num) {
  const { decimal = 0 } = this
  this.decimal = BigInt(decimal) + BigInt(num)
  return this
}

export default JXMath
