var expect = require('chai').expect

var yatc = require('../src')


describe('yatc', function () {
  it('access to default types', function () {
    expect(yatc.defaultTypes).to.be.an('object')
  })

  it('access to extend', function () {
    expect(yatc.extend).to.be.a('function')
  })

  it('is', function () {
    expect(yatc.is('Boolean', true)).to.be.true
    expect(yatc.is('Boolean', 2)).to.be.false
  })

  it('verify', function () {
    expect(function () { yatc.verify('Boolean', true) }).to.not.throw(TypeError)
    expect(function () { yatc.verify('Boolean', 2) }).to.throw(TypeError)
  })

  describe('create', function () {
    var bool

    beforeEach(function () {
      bool = yatc.create('Boolean')
    })

    it('is', function () {
      expect(bool.is(true)).to.be.true
      expect(bool.is(2)).to.be.false
    })

    it('verify', function () {
      expect(function () { bool.verify(true) }).to.not.throw(TypeError)
      expect(function () { bool.verify(2) }).to.throw(TypeError)
    })
  })
})
