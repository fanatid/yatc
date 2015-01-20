var toString = Object.prototype.toString

function isNumber(obj) {
  return toString.call(obj) === '[object Number]'
}


module.exports = {
  Number: {
    typeOf: 'Number',
    validate: isNumber
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
  }
}
