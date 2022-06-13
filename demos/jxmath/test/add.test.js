import jxm from '../src'

describe('JXMath instance', () => {
  it('pass integer while init', () => {
    expect(jxm(1)).toEqual({ decimal: 1n })
  })
  it('add 1 and get result string', () => {
    expect(jxm(1).add(2).valueOf()).toEqual('3')
  })
  it('get result string', () => {
    expect(jxm().add(2).valueOf()).toEqual('2')
  })
  it('JXMath.fn.init1', () => {
    expect(new jxm.fn.init()).toEqual(jxm())
  })
  it('JXMath.fn.init2', () => {
    expect(new jxm.fn.init().valueOf()).toEqual('0')
  })
})
