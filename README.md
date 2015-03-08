# yatc

[![Version](http://img.shields.io/npm/v/yatc.svg?style=flat-square)](https://www.npmjs.org/package/yatc)
[![build status](https://img.shields.io/travis/fanatid/yatc.svg?branch=master&style=flat-square)](http://travis-ci.org/fanatid/yatc)
[![Coverage Status](https://img.shields.io/coveralls/fanatid/yatc.svg?style=flat-square)](https://coveralls.io/r/fanatid/yatc)

Yet another type checker for JavaScript.

Inspired by [check-types](https://github.com/philbooth/check-types.js) and type checks in [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib).

Based on [type-check](https://github.com/gkz/type-check)

* Used native JavaScript
* No dependencies
* 1.2x faster than type-check
* 15k source code, 5.9k minified, 2.3k gzipped (type-check: 38k, 19k, 5.8k)

## Quick Examples

``` javascript
var yatc = require('yatc');

// Basic types:
yatc.is('Number', 1);                       // true
yatc.verify('Number', 'str');               // throw TypeError
yatc.create('Error').is(new Error);         // true
yatc.create('Undefined').verify(undefined); // nothing

// Comment
yatc('count::Number', 1);        // true

// One type OR another type:
yatc.verify('Number | String', 2);     // nothing
yatc.verify('Number | String', 'str'); // nothing
yatc.verify('Number | String', null);  // throw TypeError

// Wildcard, matches all types:
yatc.is('*', 2); // true

// Array, all elements of a single type:
yatc.is('[Number]', [1, 2, 3]);             // true
yatc.is('[Number]', [1, 'str', 3]);         // false

// Tuples, or fixed length arrays with elements of different types:
yatc.is('(String, Number)', ['str', 2]);       // true
yatc.is('(String, Number)', ['str']);          // false
yatc.is('(String, Number)', ['str', 2, 5]);    // false

// Object properties:
yatc.is('{x: Number, y: Boolean}',      {x: 2, y: false});        // true
yatc.is('{x: Number, y: Boolean}',      {x: 2});                  // false
yatc.is('{x: Number, y: Maybe Boolean}',{x: 2});                  // true
yatc.is('{x: Number, y: Boolean}',      {x: 2, y: false, z: 3});  // false
yatc.is('{x: Number, y: Boolean, ...}', {x: 2, y: false, z: 3});  // true

// A particular type AND object properties:
yatc.is('RegExp{source: String, ...}', /re/i);          // true
yatc.is('RegExp{source: String, ...}', {source: 're'}); // false

// Custom types:
var HiStringType = {
  typeOf: 'String',
  validate: function (x) { return x === 'Hi'; }
};
yatc.is('HiString', 'Hi', {HiString: HiStringType});        // true
yatc.create('HiString', {HiString: HiStringType}).is('Hi'); // true
yatc.extend({HiString: HiStringType});
yatc.is('HiString', 'Hi');                                  // true

// Nested:
var type = '{a: (String, [Number], {y: Array, ...}), b: Error{message: String, ...}}';
yatc.is(type, {a: ['hi', [1, 2, 3], {y: [1, 'ms']}], b: new Error('oh no')}); // true

// Disable checks
yats.isEnabled();            // true
yats.enable(false);
yats.isEnabled();            // false
yats.is('Number', 1);        // true
yats.verify('Number', '');   // nothing
yats.enable(true);
yats.verify('Number', '');   // throw TypeError
```

## Usage

`require('yatc');` returns an object that exposes seven properties. Functions `isEnabled`, `enable`, `extend`, `is`, `verify`, `create` and object [defaultTypes](#default-types).

### isEnabled()
`isEnabled` return current [enable status](#enable-status).

##### returns
`Boolean`

### enable(isEnabled)
`enable` set current [enable status](#enable-status).

##### arguments
* isEnabled `Boolean`

### extend(customTypes)
`extend` add customTypes to [default types](#default-types).

##### arguments
* customTypes - `Maybe Object` - an optional parameter specifying additional [custom types](#custom-types)

### is(type, input, customTypes)
`is` checks a JavaScript value `input` against `type` written in the [type format](#type-format) (and taking account the optional `customTypes`) and returns whether the `input` matches the `type`.

##### arguments
* type - `String` - the type written in the [type format](#type-format) which to check against
* input - `*` - any JavaScript value, which is to be checked against the type
* customTypes - optional parametr, see [custom types](#custom-types)

##### returns
`Boolean` - whether the input matches the type

##### example
```js
is('Number', 2); // true
```

### verify(type, input, customTypes)
`verify` working as `is` except that this function throw `TypeError` when `is` return false or return undefined otherwise.

##### example
```js
verify('Number', 2);  // nothing
verify('Number', ''); // throw TypeError
```

### create(type, customTypes)
`create` returns `Object` that have two properties. Functions `is` and `verify`.

##### arguments
* type - `String` - the type written in the [type format](#type-format) which to check against
* customTypes - optional parametr, see [custom types](#custom-types)

##### return
`Object`

##### example
```js
var isPoint = yats.create('(Int, Float)').is;
isPoint([1, 0.1]) // true
isPoint([1.1, 1]) // false
```

<a name="enable-status" />
## Enable Status
By default it's `true` and this means that `verify` will be throw `TypeError` when `input` not matches the `type`. You can use this for speed-up you scripts.

For disable type cheks you can use:

* `enable` function
* run with env variable YATC: `YATC=DISABLED node index.js`

<a name="type-format" />
## Type Format

### Syntax

White space is ignored. The root node is a __Types__.

* __Identifier__ = `[\$\w]+` - a group of any lower or upper case letters, numbers, underscores, or dollar signs - eg. `String`
* __Type__ = an `Identifier`, an `Identifier` followed by a `Structure`, just a `Structure`, or a wildcard `*` - eg. `String`, `Object{x: Number}`, `{x: Number}`, `Array{0: String, 1: Boolean, length: Number}`, `*`
* __Types__ = optionally a comment (an `Indentifier` followed by a `::`), optionally the identifier `Maybe`, one or more `Type`, separated by `|` - eg. `Number`, `String | Date`, `Maybe Number`, `Maybe Boolean | String`
* __Structure__ = `Fields`, or a `Tuple`, or an `Array` - eg. `{x: Number}`, `(String, Number)`, `[Date]`
* __Fields__ = a `{`, followed one or more `Field` separated by a comma `,` (trailing comma `,` is permitted), optionally an `...` (always preceded by a comma `,`), followed by a `}` - eg. `{x: Number, y: String}`, `{k: Function, ...}`
* __Field__ = an `Identifier`, followed by a colon `:`, followed by `Types` - eg. `x: Date | String`, `y: Boolean`
* __Tuple__ = a `(`, followed by one or more `Types` separated by a comma `,` (trailing comma `,` is permitted), followed by a `)` - eg `(Date)`, `(Number, Date)`
* __Array__ = a `[` followed by exactly one `Types` followed by a `]` - eg. `[Boolean]`, `[Boolean | Null]`

### Guide

`yatc` uses `Object.toString` to find out the basic type of a value. Specifically,

```js
Object.property.toString.call(VALUE).slice(8, -1)
Object.property.toString.call(true).slice(8, -1) // 'Boolean'
```
A basic type, eg. `Number`, uses this check. This is much more versatile than using `typeof` - for example, with `document`, `typeof` produces `'object'` which isn't that useful, and our technique produces `'HTMLDocument'`.

You may check for multiple types by separating types with a `|`. The checker proceeds from left to right, and passes if the value is any of the types - eg. `String | Boolean` first checks if the value is a string, and then if it is a boolean. If it is none of those, then it returns false.

Adding a `Maybe` in front of a list of multiple types is the same as also checking for `Null` and `Undefined` - eg. `Maybe String` is equivalent to `Undefined | Null | String`.

You may add a comment to remind you of what the type is for by following an identifier with a `::` before a type (or multiple types). The comment is simply thrown out.

The wildcard `*` matches all types.

There are three types of structures for checking the contents of a value: 'fields', 'tuple', and 'array'.

If used by itself, a 'fields' structure will pass with any type of object as long as it is an instance of `Object` and the properties pass - this allows for duck typing - eg. `{x: Boolean}`.

To check if the properties pass, and the value is of a certain type, you can specify the type - eg. `Error{message: String}`.

If you want to make a field optional, you can simply use `Maybe` - eg. `{x: Boolean, y: Maybe String}` will still pass if `y` is undefined (or null).

If you don't care if the value has properties beyond what you have specified, you can use the 'etc' operator `...` - eg. `{x: Boolean, ...}` will match an object with an `x` property that is a boolean, and with zero or more other properties.

For an array, you must specify one or more types (separated by `|`) - it will pass for something of any length as long as each element passes the types provided - eg. `[Number]`, `[Number | String]`.

A tuple checks for a fixed number of elements, each of a potentially different type. Each element is separated by a comma - eg. `(String, Number)`.

An array and tuple structure check that the value is of type `Array` by default, but if another type is specified, they will check for that instead - eg. `Int32Array[Number]`. You can use the wildcard `*` to search for any type at all.

<a name="default-types" />
### Default Types
Except types that can be recognized by Object.prototype.toString, `yatc` offers additional types:

* `NaN`
* `Infinity`
* `Int`
* `Float`
* `EmptyObject`
* `Odd`
* `Even`
* `PositiveNumber`
* `NegativeNumber`
* `HexString`

<a name="custom-types" />
### Custom Types
__Example:__

```js
var customTypes= {
  Five: {
    typeOf: 'Number',
    validate: function(x) { return x === 5; }
  }
};
is('Five', 5, customTypes); // true
is('Five', 4, customTypes); // false
```

`customTypes` allows you to set up custom types for validation. The value of this is an object. The keys of the object are the types you will be matching. Each value of the object will be an object having a `typeOf` property - a string, and `validate` property - a function.

The `typeOf` property is the type the value should be, and `validate` is a function which should return true if the value is of that type. `validate` receives one parameter, which is the value that we are checking.

## License
This library is free and open-source software released under the MIT license.
