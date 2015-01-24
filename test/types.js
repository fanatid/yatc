var expect = require('chai').expect

var yatc = require('../src')


describe('types', function () {
  it('Number', function () {
    expect(yatc.is('Number', 0)).to.be.true
    expect(yatc.is('Number', '0')).to.be.false
  })

  it('Infinity', function () {
    expect(yatc.is('Infinity', 0)).to.be.false
    expect(yatc.is('Infinity', '')).to.be.false
    expect(yatc.is('Infinity', 1 / 0)).to.be.true
    expect(yatc.is('Infinity', -1 / 0)).to.be.true
  })

  it('NaN', function () {
    expect(yatc.is('NaN', parseInt('', 10))).to.be.true
    expect(yatc.is('NaN', parseInt('0', 10))).to.be.false
  })

  it('Int', function () {
    expect(yatc.is('Int', 0)).to.be.true
    expect(yatc.is('Int', 0.1)).to.be.false
    expect(yatc.is('Int', '0')).to.be.false
  })

  it('Float', function () {
    expect(yatc.is('Float', 0)).to.be.true
    expect(yatc.is('Float', 0.1)).to.be.true
    expect(yatc.is('Float', '0')).to.be.false
  })

  it('Date', function () {
    expect(yatc.is('Date', new Date('2015-01-22'))).to.be.true
    expect(yatc.is('Date', void 0)).to.be.false
  })

  it('EmptyObject', function () {
    expect(yatc.is('EmptyObject', {})).to.be.true
    expect(yatc.is('EmptyObject', {a: 0})).to.be.false
  })

  it('Odd', function () {
    expect(yatc.is('Odd', true)).to.be.false
    expect(yatc.is('Odd', 0)).to.be.false
    expect(yatc.is('Odd', 1)).to.be.true
  })

  it('Even', function () {
    expect(yatc.is('Even', true)).to.be.false
    expect(yatc.is('Even', 0)).to.be.true
    expect(yatc.is('Even', 1)).to.be.false
  })

  it('PositiveNumber', function () {
    expect(yatc.is('PositiveNumber', true)).to.be.false
    expect(yatc.is('PositiveNumber', 1)).to.be.true
    expect(yatc.is('PositiveNumber', 0)).to.be.false
    expect(yatc.is('PositiveNumber', -1)).to.be.false
  })

  it('NegativeNumber', function () {
    expect(yatc.is('NegativeNumber', true)).to.be.false
    expect(yatc.is('NegativeNumber', 1)).to.be.false
    expect(yatc.is('NegativeNumber', 0)).to.be.false
    expect(yatc.is('NegativeNumber', -1)).to.be.true
  })

  it('HexString', function () {
    expect(yatc.is('HexString', true)).to.be.false
    expect(yatc.is('HexString', '')).to.be.true
    expect(yatc.is('HexString', '0')).to.be.false
    expect(yatc.is('HexString', '0g')).to.be.false
    expect(yatc.is('HexString', '01')).to.be.true
  })
})
