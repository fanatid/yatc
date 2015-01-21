var toString = Object.prototype.toString

/**
 * @param {*} obj
 * @return {boolean}
 */
function isNumber(obj) {
  return toString.call(obj) === '[object Number]'
}

/**
 * @param {*} obj
 * @return {boolean}
 */
function isUndefined(obj) {
  return obj === void 0
}


module.exports = {
  toString: toString,
  isNumber: isNumber,
  isUndefined: isUndefined
}
