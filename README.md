# yatc

[![build status](https://secure.travis-ci.org/fanatid/yatc.png)](http://travis-ci.org/fanatid/yatc)
[![Coverage Status](https://coveralls.io/repos/fanatid/yatc/badge.png)](https://coveralls.io/r/fanatid/yatc)
[![Version](http://img.shields.io/npm/v/yatc.svg)](https://www.npmjs.org/package/yatc)

Yet another type checker for JavaScript.

Inspired by [type-check](https://github.com/gkz/type-check), [check-types](https://github.com/philbooth/check-types.js) and type checks in [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib).

## Quick Examples

``` javascript
var yatc = require('yatc')

// Basic types:
yatc.is('Number', 1)                      // true
yatc.check('Number', 'str')               // throw TypeError
yatc.create('Error').is(new Error)        // true
yatc.create('Undefined').check(undefined) // nothing

// Comment
yatc('count::Number', 1)        // true

// One type OR another type:
yatc('Number | String', 2)      // nothing
yatc('Number | String', 'str')  // nothing
yatc('Number | String', null)   // throw TypeError

// Wildcard, matches all types:
yatc.is('*', 2) // true

// Array, all elements of a single type:
yatc.is('[Number]', [1, 2, 3])                // true
yatc.is('[Number]', [1, 'str', 3])            // false

// Tuples, or fixed length arrays with elements of different types:
yatc.is('(String, Number)', ['str', 2])       // true
yatc.is('(String, Number)', ['str'])          // false
yatc.is('(String, Number)', ['str', 2, 5])    // false

// Object properties:
yatc.is('{x: Number, y: Boolean}',      {x: 2, y: false})        // true
yatc.is('{x: Number, y: Boolean}',      {x: 2})                  // false
yatc.is('{x: Number, y: Maybe Boolean}',{x: 2})                  // true
yatc.is('{x: Number, y: Boolean}',      {x: 2, y: false, z: 3})  // false
yatc.is('{x: Number, y: Boolean, ...}', {x: 2, y: false, z: 3})  // true

// A particular type AND object properties:
yatc.is('RegExp{source: String, ...}', /re/i)          // true
yatc.is('RegExp{source: String, ...}', {source: 're'}) // false

// Custom types:
var EvenType = {typeOf: 'Number', validate: function (x) { return x % 2 === 0 }}
yatc.is('Even', 2, {Even: EvenType})        // true
yatc.create('Even', {Even: EvenType}).is(2) // true
yatc.extend({Even: EvenType})
yatc.is('Even', 2)                          // true

// Nested:
var type = '{a: (String, [Number], {y: Array, ...}), b: Error{message: String, ...}}'
yatc.is(type, {a: ['hi', [1, 2, 3], {y: [1, 'ms']}], b: new Error('oh no')}) // true

// Disable checks
yats.isEnabled()         // true
yats.enable(false)
yats.isEnabled()         // false
yats.is('Number', 1)     // true
yats.check('Number', '') // nothing
yats.enable(true)
yats.check('Number', '') // throw TypeError
```

## License

This library is free and open-source software released under the MIT license.
