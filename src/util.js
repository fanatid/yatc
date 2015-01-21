var toString = Object.prototype.toString

function isNumber(obj) {
  return toString.call(obj) === '[object Number]'
}

function isUndefined(obj) {
  return obj === void 0
}


module.exports = {
  toString: toString,
  isNumber: isNumber,
  isUndefined: isUndefined
}
