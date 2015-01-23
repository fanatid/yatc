/**
 * @license
 * Based on <https://github.com/gkz/type-check>
 * Copyright George Zahariev
 * Available under MIT license <https://raw.github.com/gkz/type-check/master/LICENSE>
 */
var checker = require('./checker')
var parser = require('./parser')

var IS_ENABLED = process.env.YATC !== 'DISABLED'
console.log(process.env.YATC)


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
  if (!IS_ENABLED) {
    return
  }

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
    if (!IS_ENABLED) {
      return
    }

    if (is(input, customTypes) === false) {
      throw new TypeError('Expected \'' + type + '\', got \'' + input + '\'.')
    }
  }

  return {is: is, verify: verify}
}


module.exports = {
  isEnabled: function isEnabled() { return IS_ENABLED },
  enable: function enable(value) { IS_ENABLED = !!value },

  defaultTypes: checker.types,
  extend: checker.extend,

  is: is,
  verify: verify,

  create: create
}
