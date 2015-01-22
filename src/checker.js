var defaultTypes = require('./types')
var _ = require('./util')


/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
function checkArray(input, typeObj, customTypes) {
  return input.every(function (item) {
    return checkMultiple(item, typeObj.of, customTypes)
  })
}

/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
function checkTuple(input, typeObj, customTypes) {
  var isGood = typeObj.of.every(function (typeObj, index) {
    return checkMultiple(input[index], typeObj, customTypes)
  })

  return isGood && input.length <= typeObj.of.length
}

/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
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

  return Object.keys(input).length <= Object.keys(typeObj.of).length
}

/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
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
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
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
    var isArrayStruct = ['array', 'tuple'].indexOf(typeObj.structure) !== -1
    if (isArrayStruct && _.toString.call(input) !== '[object Array]') {
      return false
    }

    return checkStructure(input, typeObj, customTypes)
  }

  throw new Error('No type defined. Input: ' + input + '.')
}

/**
 * @param {*} input
 * @param {ParsedTypes} parsedTypes
 * @param {CheckedTypes} customTypes
 */
function checkMultiple(input, parsedTypes, customTypes) {
  if (_.toString.call(parsedTypes) !== '[object Array]') {
    throw new Error('Types must be in an array. Input: ' + input  + '.')
  }

  return parsedTypes.some(function (parsedType) {
    return check(input, parsedType, customTypes)
  })
}

/**
 * @param {*} input
 * @param {ParsedTypes} parsedTypes
 * @param {CheckedTypes} customTypes
 */
function checkInput(input, parsedTypes, customTypes) {
  return checkMultiple(parsedTypes, input, customTypes || {})
}

/**
 * @param {{string: CheckedType}} types
 */
function extendDefaultTypes(types) {
  Object.keys(types).forEach(function (typeName) {
    defaultTypes[typeName] = types[typeName]
  })
}


module.exports = {
  check: checkInput,
  types: defaultTypes,
  extend: extendDefaultTypes
}
