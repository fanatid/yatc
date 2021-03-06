var toString = Object.prototype.toString

/**
 * @param {*} obj
 * @return {boolean}
 */
function isNumber(obj) {
  return toString.call(obj) === '[object Number]'
}


/**
 * @callback CheckedType~validate
 * @param {*} obj
 * @return {boolean}
 */

/**
 * @typedef {Object} CheckedType
 * @property {string} typeOf
 * @property {CheckedType~validate} validate
 */

/**
 * @typedef {Object} CheckedTypes
 * @property {string} CheckedType
 */


module.exports = {
  Number: {
    typeOf: 'Number',
    validate: isNumber
  },
  Infinity: {
    typeOf: 'Number',
    validate: function (obj) {
      return obj === Number.POSITIVE_INFINITY || obj === Number.NEGATIVE_INFINITY
    }
  },
  NaN: {
    typeOf: 'Number',
    validate: function (obj) {
      return isNumber(obj) && obj !== +obj
    }
  },
  Int: {
    typeOf: 'Number',
    validate: function (obj) {
      return isNumber(obj) && obj % 1 === 0
    }
  },
  Float: {
    typeOf: 'Number',
    validate: isNumber
  },
  Date: {
    typeOf: 'Date',
    validate: function (obj) {
      return toString.call(obj) === '[object Date]'
    }
  },
  EmptyObject: {
    typeOf: 'Object',
    validate: function (obj) {
      return Object.keys(obj).length === 0
    }
  },
  Odd: {
    typeOf: 'Number',
    validate: function (obj) {
      return isNumber(obj) && obj % 1 === 1
    }
  },
  Even: {
    typeOf: 'Number',
    validate: function (obj) {
      return isNumber(obj) && obj % 2 === 0
    }
  },
  PositiveNumber: {
    typeOf: 'Number',
    validate: function (obj) {
      return isNumber(obj) && obj > 0
    }
  },
  NegativeNumber: {
    typeOf: 'Number',
    validate: function (obj) {
      return isNumber(obj) && obj < 0
    }
  },
  HexString: {
    typeOf: 'String',
    validate: function (obj) {
      if (toString.call(obj) !== '[object String]' || obj.length % 2 !== 0) {
        return false
      }

      for (var i = obj.length; --i >= 0;) {
        if ('0123456789abcdefABCDEF'.indexOf(obj[i]) === -1) {
          return false
        }
      }

      return true
    }
  }
}
