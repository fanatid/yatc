/**
 * @license
 * Based on <https://github.com/gkz/type-check 0.3.1>
 * Copyright George Zahariev
 * Available under MIT license <https://raw.github.com/gkz/type-check/master/LICENSE>
 */
var checker = require('./checker')
var parser = require('./parser')


/**
 * @param {string} type
 * @param {*} input
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
function is(type, input, customTypes) {
  var parsedType = parser(type)
  return checker.check(parsedType, input, customTypes)
}

/**
 * @param {string} type
 * @param {*} input
 * @param {CheckedTypes} customTypes
 * @throws {TypeError}
 */
function verify(type, input, customTypes) {
  if (is(type, input, customTypes) === false) {
    throw new TypeError('Expected \'' + type + '\', got \'' + input + '\'.')
  }
}

/**
 * @param {string} type
 * @return {Object}
 */
function create(type) {
  var parsedType = parser(type)

  function is(input, customTypes) {
    return checker.check(parsedType, input, customTypes)
  }

  function verify(input, customTypes) {
    if (is(input, customTypes) === false) {
      throw new TypeError('Expected \'' + type + '\', got \'' + input + '\'.')
    }
  }

  return {is: is, verify: verify}
}


module.exports = {
  defaultTypes: checker.types,
  extend: checker.extend,

  is: is,
  verify: verify,

  create: create
}
