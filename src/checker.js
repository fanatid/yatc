var defaultTypes = require('./types')
var _ = require('./util')


function checkArray(input, typeObj, customTypes) {
  return input.every(function (val) {
    return checkMultiple(val, typeObj.of, customTypes)
  })
}

function checkTuple(input, typeObj, customTypes) {
  return typeObj.of.every(function (typeObj, index) {
    return checkMultiple(input[index], typeObj, customTypes)
  })
}

function checkFields(input, typeObj, customTypes) {
  var isGood = Object.keys(typeObj.of).every(function (key) {
    return checkMultiple(input[key], typeObj.of[key], customTypes)
  })

  if (!isGood) {
    return false
  }

  if (typeObj.subset === true) {
    return true
  }

  return Object.keys(input).length === Object.keys(typeObj.of).length
}

/**
 * @param {*} input
 * @param {Object} typeObj
 * @param {Object} customTypes
 * @return {boolean}
 */
function checkStructure(input, typeObj, customTypes) {
  if (!(input instanceof Object)) {
    return false
  }

  switch (typeObj.structure) {
  case 'fields':
    return checkFields(input, typeObj, customTypes)

  case 'array':
    return checkArray(input, typeObj, customTypes)

  case 'tuple':
    return checkTuple(input, typeObj, customTypes)

  default:
    return false
  }
}

/**
 * @param {*} input
 * @param {Object} typeObj
 * @param {Object} customTypes
 * @return {boolean}
 */
function check(input, typeObj, customTypes) {
  if (!_.isUndefined(typeObj.type)) {
    if (typeObj.type === '*') {
      return true
    }

    var inputType = _.toString.call(input).slice(8, -1)

    var setting = customTypes[typeObj.type] || defaultTypes[typeObj.type]
    if (!_.isUndefined(setting)) {
      return setting.typeOf === inputType && setting.validate(input)
    }

    if (typeObj.type !== inputType) {
      return false
    }

    return _.isUndefined(typeObj.structure) || checkStructure(input, typeObj, customTypes)
  }

  if (!_.isUndefined(typeObj.structure)) {
    if (['array', 'tuple'].indexOf(typeObj.structure) !== -1) {
      if (_.toString.call(input) !== '[object Array]') {
        return false
      }
    }

    return checkStructure(input, typeObj, customTypes)
  }

  throw new Error('No type defined. Input: ' + input + '.')
}

function checkMultiple(input, parsedType, customTypes) {
  return parsedType.some(function (typeObj) {
    return check(input, typeObj, customTypes)
  })
}


module.exports = function (input, parsedType, customTypes) {
  return checkMultiple(input, parsedType, customTypes || {})
}
