var _ = require('./util')

var identifierRegex = /[\$\w]+/
var tokenRegex = /\.\.\.|::|[\$\w]+|\S/g


/**
 * @typedef {string} Token
 */

/**
 * @typedef {Token[]} Tokens
 */

/**
 * @typedef {Object} SimpleType
 * @property {string} type Type identifier eg. String, Number
 */

/**
 * @typedef {Object} ArrayType
 * @property {string} structure Always equal `array`
 * @property {ParsedTypes} of Followed by exactly one `ParsedTypes`
 */

/**
 * @typedef {Object} TupleType
 * @property {string} structure Always equal `tuple`
 * @property {ParsedTypes[]} of Followed by one or more `ParsedTypes`
 */

/**
 * @typedef {Object} FieldsType
 * @property {string} structure Always equal `fields`
 * @property {{string: ParsedTypes}} of
 * @property {boolean} subset Allow etc properties
 */

/**
 * @typedef {(SimpleType|ArrayType|TupleType|FieldsType)} ParsedType
 */

/**
 * @typedef {ParsedType[]} ParsedTypes
 */

/**
 * Throw `Error` if given `tokens` length equal zero
 *   unless return first `Token`
 *
 * @param {Tokens} tokens
 * @return {Token}
 * @throws {Error}
 */
function head(tokens) {
  if (tokens.length === 0) {
    throw new Error('Unexpected end of input.')
  }

  return tokens[0]
}

/**
 * Throw `Error` if first `Token` of given `tokens` is not identifier
 *   unless pop first `Token` from `tokens` and return it
 *
 * @param {Tokens} tokens
 * @return {Token}
 * @throws {Error}
 */
function consumeIdent(tokens) {
  if (identifierRegex.test(head(tokens))) {
    return tokens.shift()
  }

  throw new Error('Expected text, got \'' + tokens[0] + '\' instead.')
}

/**
 * Throw `error` if first `Token` of given `tokens` not equal given `op`
 *   unless pop first `Token` from `tokens` and return `op`
 *
 * @param {Tokens} tokens
 * @param {Token} op
 * @return {Token}
 * @throws {Error}
 */
function consumeOp(tokens, op) {
  if (head(tokens) === op) {
    return tokens.shift()
  }

  throw new Error('Expected ' + op + ', got \'' + tokens[0] + '\'')
}

/**
 * As `consumeOp`, but instead throwing `Error` return `null`
 *
 * @param {Tokens} tokens
 * @param {Token} op
 * @return {?Token}
 */
function maybeConsumeOp(tokens, op) {
  if (tokens[0] === op) {
    return tokens.shift()
  }

  return null
}

/**
 * @param {Tokens} tokens
 * @return {ArrayType}
 * @throws {Error}
 */
function consumeArray(tokens) {
  var struct = {structure: 'array'}

  consumeOp(tokens, '[')
  if (head(tokens) === ']') {
    throw new Error('Must specify type of Array - eg. [Type], got [] instead.')
  }

  struct.of = consumeTypes(tokens)
  consumeOp(tokens, ']')

  return struct
}

/**
 * @param {Tokens} tokens
 * @return {TupleType}
 * @throws {Error}
 */
function consumeTuple(tokens) {
  var struct = {structure: 'tuple', of: []}

  consumeOp(tokens, '(')
  if (head(tokens) === ')') {
    throw new Error('Tuple must be of at least length 1 - eg. (Type), got () instead.')
  }

  do {
    struct.of.push(consumeTypes(tokens))
    maybeConsumeOp(tokens, ',')

  } while (head(tokens) !== ')')
  consumeOp(tokens, ')')

  return struct
}

/**
 * @param {Tokens} tokens
 * @return {{key: string, value: ParsedTypes}}
 * @throws {Error}
 */
function consumeField(tokens) {
  var key = consumeIdent(tokens)
  consumeOp(tokens, ':')
  return {key: key, value: consumeTypes(tokens)}
}

/**
 * @param {Tokens} tokens
 * @return {FieldsType}
 * @throws {Error}
 */
function consumeFields(tokens) {
  var struct = {structure: 'fields', of: {}, subset: false}

  consumeOp(tokens, '{')
  while (true) {
    if (maybeConsumeOp(tokens, '...') !== null) {
      struct.subset = true
      break
    }

    var field = consumeField(tokens)
    struct.of[field.key] = field.value

    maybeConsumeOp(tokens, ',')
    if (head(tokens) === '}') {
      break
    }
  }
  consumeOp(tokens, '}')

  return struct
}

/**
 * @param {Tokens} tokens
 * @return {?(ArrayType|TupleType|FieldsType)}
 * @throws {Error}
 */
function maybeConsumeStructure(tokens) {
  switch (tokens[0]) {
    case '[':
      return consumeArray(tokens)

    case '(':
      return consumeTuple(tokens)

    case '{':
      return consumeFields(tokens)

    default:
      return null
  }
}

/**
 * @param {Tokens} tokens
 * @return {ParsedType}
 * @throws {Error}
 */
function consumeType(tokens) {
  var token = head(tokens)
  if (token === '*' || identifierRegex.test(token)) {
    var type = token === '*' ? consumeOp(tokens, '*') : consumeIdent(tokens)

    var structure = maybeConsumeStructure(tokens)
    if (structure === null) {
      return {type: type}
    }

    structure.type = type
    return structure
  }

  var struct = maybeConsumeStructure(tokens)
  if (struct === null) {
    throw new Error('Unexpected character: ' + token)
  }

  return struct
}

/**
 * @param {Tokens} tokens
 * @return {ParsedTypes}
 * @throws {Error}
 */
function consumeTypes(tokens) {
  if (head(tokens) === '::') {
    throw new Error('No comment before comment separator :: found.')
  }

  if (tokens.length > 1 && tokens[1] === '::') {
    tokens.splice(0, 2)
  }

  var types = {}
  if (head(tokens) === 'Maybe') {
    tokens.shift()
    types = {Undefined: {type: 'Undefined'}, Null: {type: 'Null'}}
  }

  do {
    var typeObj = consumeType(tokens)
    if (_.isUndefined(types[typeObj.type])) {
      types[typeObj.type] = typeObj
    }

  } while (maybeConsumeOp(tokens, '|') !== null)

  return Object.keys(types).map(function (key) { return types[key] })
}

/**
 * @param {string} input
 * @return {ParsedTypes}
 * @throws {Error}
 */
function parseString(input) {
  if (input.length === 0) {
    throw new Error('No type specified.')
  }

  var tokens = input.match(tokenRegex) || []
  return consumeTypes(tokens)
}


module.exports = parseString
