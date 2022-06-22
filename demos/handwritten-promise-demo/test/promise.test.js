const JPromise = require('../src/index')
// https://jestjs.io/docs/asynchronous
describe('JPromise instance', () => {
  it('equals resolve value is 1', () => {
    return expect(JPromise.resolve(1)).resolves.toBe(1)
  })
})
