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
  if (identifierRegex.test(tokens[0])) {
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
  if (tokens[0] === op) {
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
  consumeOp(tokens, '[')
  if (tokens[0] === ']') {
    throw new Error('Must specify type of Array - eg. [Type], got [] instead.')
  }

  var types = consumeTypes(tokens)
  consumeOp(tokens, ']')

  return {structure: 'array', of: types}
}

/**
 * @param {Tokens} tokens
 * @return {TupleType}
 * @throws {Error}
 */
function consumeTuple(tokens) {
  consumeOp(tokens, '(')
  if (tokens[0] === ')') {
    throw new Error('Tuple must be of at least length 1 - eg. (Type), got () instead.')
  }

  var types = []
  for (;;) {
    types.push(consumeTypes(tokens))
    maybeConsumeOp(tokens, ',')

    if (head(tokens) === ')') {
      break
    }
  }
  consumeOp(tokens, ')')

  return {structure: 'tuple', of: types}
}

/**
 * @param {Tokens} tokens
 * @return {FieldsType}
 * @throws {Error}
 */
function consumeFields(tokens) {
  var fields = {}
  var subset = false

  consumeOp(tokens, '{')
  if (tokens[0] !== '}') {
    for (;;) {
      if (maybeConsumeOp(tokens, '...') !== null) {
        subset = true
        break
      }

      var key = consumeIdent(tokens)
      consumeOp(tokens, ':')
      fields[key] = consumeTypes(tokens)

      maybeConsumeOp(tokens, ',')
      if (head(tokens) === '}') {
        break
      }
    }
  }
  consumeOp(tokens, '}')

  return {structure: 'fields', of: fields, subset: subset}
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
  var token = tokens[0]
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
  if (tokens[0] === '::') {
    throw new Error('No comment before comment separator :: found.')
  }

  if (tokens.length > 1 && tokens[1] === '::') {
    tokens.shift()
    tokens.shift()
  }

  var types = []
  var typesDict = {}
  if (tokens[0] === 'Maybe') {
    tokens.shift()
    types = [{type: 'Undefined'}, {type: 'Null'}]
    typesDict = {Undefined: true, Null: true}
  }

  for (;;) {
    var typeObj = consumeType(tokens)
    if (typesDict[typeObj.type] !== true) {
      types.push(typeObj)
      typesDict[typeObj.type] = true
    }

    if (maybeConsumeOp(tokens, '|') === null) {
      break
    }
  }

  return types
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
  head(tokens)
  return consumeTypes(tokens)
}


module.exports = parseString
