var _ = require('./util')


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


/** @todo Add other types */
module.exports = {
  Number: {
    typeOf: 'Number',
    validate: _.isNumber
  },
  NaN: {
    typeOf: 'Number',
    validate: function (obj) {
      return _.isNumber(obj) && obj !== +obj
    }
  },
  Int: {
    typeOf: 'Number',
    validate: function (obj) {
      return _.isNumber(obj) && obj % 1 === 0
    }
  },
  Float: {
    typeOf: 'Number',
    validate: _.isNumber
  },
  Date: {
    typeOf: 'Date',
    validate: function (obj) {
      return _.toString.call(obj) === '[object Date]'
    }
  }
}
