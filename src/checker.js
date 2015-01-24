var toString = Object.prototype.toString
var defaultTypes = require('./types')


/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
function checkArray(input, typeObj, customTypes) {
  for (var i = 0, length = input.length; i < length; ++i) {
    if (!checkMultiple(input[i], typeObj.of, customTypes)) {
      return false
    }
  }

  return true
}

/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
function checkTuple(input, typeObj, customTypes) {
  var typeOf = typeObj.of
  for (var i = 0, length = typeOf.length; i < length; ++i) {
    if (!checkMultiple(input[i], typeOf[i], customTypes)) {
      return false
    }
  }

  return input.length <= length
}

/**
 * @param {*} input
 * @param {ParsedType} typeObj
 * @param {CheckedTypes} customTypes
 * @return {boolean}
 */
function checkFields(input, typeObj, customTypes) {
  var ofKeys = Object.keys(typeObj.of)
  for (var i = 0, length = ofKeys.length; i < length; ++i) {
    if (!checkMultiple(input[ofKeys[i]], typeObj.of[ofKeys[i]], customTypes)) {
      return false
    }
  }

  return typeObj.subset || Object.keys(input).length <= length
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
  if (!!typeObj.type) {
    if (typeObj.type === '*') {
      return true
    }

    var inputType = toString.call(input).slice(8, -1)

    var setting = customTypes[typeObj.type] || defaultTypes[typeObj.type]
    if (!!setting) {
      return setting.typeOf === inputType && setting.validate(input)
    }

    if (typeObj.type !== inputType) {
      return false
    }

    return !typeObj.structure || checkStructure(input, typeObj, customTypes)
  }

  if (!!typeObj.structure) {
    var isArrayStruct = ['array', 'tuple'].indexOf(typeObj.structure) !== -1
    if (isArrayStruct && toString.call(input) !== '[object Array]') {
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
  if (toString.call(parsedTypes) !== '[object Array]') {
    throw new Error('Types must be in an array. Input: ' + input  + '.')
  }

  for (var i = 0, length = parsedTypes.length; i < length; ++i) {
    if (check(input, parsedTypes[i], customTypes)) {
      break
    }
  }

  return i < length
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
