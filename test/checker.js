var expect = require('chai').expect

var checker = require('../src/checker')
var parser = require('../src/parser')


function is(type, input, opts) {
  var parsedType = parser(type)
  return checker.check(parsedType, input, opts)
}

describe('checker', function () {
  it('Undefined', function () {
    expect(is('Undefined', void 0)).to.be.true
    expect(is('Undefined', null)).to.be.false
    expect(is('Undefined', false)).to.be.false
  })

  it('Undefined in field', function () {
    expect(is('{a: Undefined}', {})).to.be.true
    expect(is('{a: Undefined}', {a: 1})).to.be.false
  })

  it('Undefined in tuple', function () {
    expect(is('(Undefined, Number)', [void 0, 2])).to.be.true
    expect(is('(Undefined, Number)', [1, 2])).to.be.false
  })

  it('Null', function () {
    expect(is('Null', null)).to.be.true
    expect(is('Null', 1)).to.be.false
    expect(is('Null', void 0)).to.be.false
  })

  it('Boolean', function () {
    expect(is('Boolean', true)).to.be.true
    expect(is('Boolean', false)).to.be.true
    expect(is('Boolean', Boolean(true))).to.be.true
    expect(is('Boolean', 1)).to.be.false
  })

  it('String', function () {
    expect(is('String', 'h1')).to.be.true
    expect(is('String', String('h1'))).to.be.true
    expect(is('String', 2)).to.be.false
  })

  it('Number', function () {
    expect(is('Number', 1)).to.be.true
    expect(is('Number', Number(2))).to.be.true
    expect(is('Number', '')).to.be.false
  })

  it('NaN', function () {
    expect(is('NaN', NaN)).to.be.true
    expect(is('NaN', 1)).to.be.false
  })

  it('Int', function () {
    expect(is('Int', 1)).to.be.true
    expect(is('Int', 1.0)).to.be.true
    expect(is('Int', Number(1))).to.be.true
    expect(is('Int', 1.1)).to.be.false
  })

  it('Float', function () {
    expect(is('Float', 1)).to.be.true
    expect(is('Float', 1.0)).to.be.true
    expect(is('Float', 1.1)).to.be.true
    expect(is('Float', '')).to.be.false
  })

  it('Date', function () {
    expect(is('Date', new Date('2015-01-22'))).to.be.true
    expect(is('Date', new Date('2015-0122'))).to.be.true
  })

  it('Function', function() {
    expect(is('Function', function () {})).to.be.true
    expect(is('Function{length: Number}', function () {})).to.be.true
  })

  it('Wildcard', function () {
    expect(is('*', void 0)).to.be.true
    expect(is('*', null)).to.be.true
    expect(is('*', 2)).to.be.true
    expect(is('*', {})).to.be.true
    expect(is('*', new Error())).to.be.true
    expect(is('[*]', [1, null, void 0])).to.be.true
  })

  it('multiple', function () {
    expect(is('Number|String', 2)).to.be.true
    expect(is('Date|String', 2)).to.be.false
  })

  describe('Array', function () {
    it('bare', function () {
      expect(is('Array', [1, 2])).to.be.true
      expect(is('Array', [1, true])).to.be.true
      expect(is('Array', true)).to.be.false
    })

    it('simple', function () {
      expect(is('[Number]', [1, 2])).to.be.true
    })

    it('incorrect type', function () {
      expect(is('[Number]', true)).to.be.false
    })

    it('incorrect element type', function () {
      expect(is('[Number]', [1, '2'])).to.be.false
    })
  })

  describe('Tuple', function () {
    it('simple', function () {
      expect(is('(String, Number)', ['1', 2])).to.be.true
    })

    it('too long', function () {
      expect(is('(String, Number)', ['1', 2, 2])).to.be.false
    })

    it('too short', function () {
      expect(is('(String, Number)', [2])).to.be.false
    })

    it('incorrect type', function () {
      expect(is('(String, Number)', {})).to.be.false
    })

    it('incorrect elem type', function () {
      expect(is('(String, Number)', ['1', '2'])).to.be.false
    })
  })

  describe('Object', function () {
    it('bare', function () {
      expect(is('Object', {})).to.be.true
      expect(is('Object', {a: 1})).to.be.true
      expect(is('Object', 4)).to.be.false
    })
  })

  describe('Maybe', function () {
    it('simple', function () {
      expect(is('Maybe Number', 1)).to.be.true
      expect(is('Maybe Number', null)).to.be.true
      expect(is('Maybe Number', '')).to.be.false
    })

    it('with multiple', function () {
      expect(is('Maybe Number|String', 1)).to.be.true
      expect(is('Maybe Number|String', null)).to.be.true
      expect(is('Maybe Number|String', '')).to.be.true
    })

    it('in array', function () {
      expect(is('[Maybe Number]', [1, null, void 0])).to.be.true
    })

    it('in tuple', function () {
      expect(is('(Number, Maybe String)', [1, 'hi'])).to.be.true
      expect(is('(Number, Maybe String)', [1, null])).to.be.true
      expect(is('(Number, Maybe String)', [1])).to.be.true
      expect(is('(Number, Maybe String)', ['1', 'hi'])).to.be.false
    })

    it('in fields', function () {
      expect(is('{a: Maybe String}', {a: ''})).to.be.true
      expect(is('{a: Maybe String}', {a: null})).to.be.true
      expect(is('{a: Maybe String}', {})).to.be.true
      expect(is('{a: Maybe String}', {a: 2})).to.be.false
    })
  })

  describe('duck typing', function () {
    it('basic', function () {
      expect(is('{a: String}', {a: 'hi'})).to.be.true
    })

    it('property must by appropriate type', function () {
      expect(is('{a: String}', {a: 2})).to.be.false
    })

    it('key must be the same', function () {
      expect(is('{a: String}', {b: '2'})).to.be.false
    })

    it('not an object', function () {
      expect(is('{a: String}', 2)).to.be.false
    })

    it('non-enumerable properties', function () {
      expect(is('{parse: Function, stringify: Function}', JSON)).to.be.true
    })

    it('enumerable and non-enumerable properties', function () {
      expect(is('{0: Number, 1: Number, length: Number}', [1, 2])).to.be.true
    })

    it('using spread operator to check only a subset of the properties', function () {
      expect(is('{length: Number, ...}', [1, 2])).to.be.true
    })
  })

  describe('structures with type', function () {
    it('fields with Object', function () {
      expect(is('Object{a: String}', {a: 'hi'})).to.be.true
      expect(is('Object{a: String}', {a: 2})).to.be.false
    })

    it('fields with Array', function () {
      expect(is('Array{0:Number, 1:Number, 2:Number}', [1, 2, 3])).to.be.true
      expect(is('Array{0:Number, 1:String}', [1, 2])).to.be.false
      expect(is('Array{0:Number, 1:String}', [1, '2'])).to.be.true
    })

    it('fields with JSON', function () {
      expect(is('JSON{parse: Function, stringify: Function}', JSON)).to.be.true
      var obj = {parse: function () {}, stringify: function () {}}
      expect(is('JSON{parse: Function, stringify: Function}', obj)).to.be.false
    })

    it('fields with Math (using subset)', function () {
      expect(is('Math{PI: Float, ...}', Math)).to.be.true
    })

    it('array structure with Array', function () {
      expect(is('Array[Number]', [1, 2])).to.be.true
    })

    it('tuple structure with Array', function () {
      expect(is('Array(Number, String)', [1, '2'])).to.be.true
    })
  })

  describe('custom types', function () {
    it('access to default types', function () {
      expect(checker.types).to.be.an('object')
      expect(checker.types.Number.typeOf).to.equal('Number')
      expect(checker.types.Number.validate(4)).to.be.true
      expect(checker.types.Number.validate('4')).to.be.false
    })

    it('simple', function () {
      var EvenType = {
        typeOf: 'Number',
        validate: function (x) { return x % 2 === 0 }
      }
      expect(is('Even', 1, {Even: EvenType})).to.be.false
      expect(is('Even', 2, {Even: EvenType})).to.be.true
    })

    it('overwrite current', function () {
      var CustomString = {
        typeOf: 'String',
        validate: function (x) { return x === 'hi' }
      }
      expect(is('String', 'hi!', {String: CustomString})).to.be.false
      expect(is('String', 'hi', {String: CustomString})).to.be.true
    })

    it('extend default types', function () {
      var OddType = {
        typeOf: 'Number',
        validate: function (x) { return x % 2 === 1 }
      }
      checker.extend({Odd: OddType})
      expect(checker.types.Odd).to.deep.equal(OddType)
      expect(is('Odd', 1)).to.be.true
      expect(is('Odd', 2)).to.be.false
    })
  })

  it('nested', function () {
    var type = '{a: (String, [Number], {x: {a: Maybe Number}, y: Array, ...}), b: Error{message: String, ...}}'
    expect(is(type, {a: ['hi', [1, 2], {x: {a: 42}, y: [1, 'bye']}], b: new Error('message')})).to.be.true
    expect(is(type, {a: ['moo', [3], {x: {}, y: [], z: 999}], b: new Error('23')})).to.be.true
  })

  describe('errors', function () {
    it('no type defined', function () {
      function fn() { checker.check([{}], true) }
      expect(fn).to.throw(/No type defined\. Input: true/)
    })

    it('types must be in array', function () {
      function fn() { checker.check({}, true) }
      expect(fn).to.throw(/Types must be in an array\. Input: true/)
    })
  })
})
