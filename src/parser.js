var identifierRegex = /[\$\w]+/
var tokenRegex = /\.\.\.|::|[\$\w]+|\S/g


/**
 * @param {string[]} tokens
 * @return {string}
 * @throws {Error}
 */
function head(tokens) {
  if (tokens.length === 0) {
    throw new Error('Unexpected end of input.')
  }

  return tokens[0]
}

/**
 * @param {string[]} tokens
 * @return {string}
 * @throws {Error}
 */
function consumeIdent(tokens) {
  if (identifierRegex.test(head(tokens))) {
    return tokens.shift()
  }

  throw new Error('Expected text, got \'' + tokens[0] + '\' instead.')
}

/**
 * @param {string[]} tokens
 * @param {string} op
 * @return {string}
 * @throws {Error}
 */
function consumeOp(tokens, op) {
  if (head(tokens) === op) {
    return tokens.shift()
  }

  throw new Error('Expected ' + op + ', got \'' + tokens[0] + '\'')
}

/**
 * @param {string[]} tokens
 * @param {string} op
 * @return {?string}
 * @throws {Error}
 */
function maybeConsumeOp(tokens, op) {
  if (tokens[0] === op) {
    return tokens.shift()
  }

  return null
}

/**
 * @param {string[]} tokens
 * @return {Object}
 * @throws {Error}
 */
function consumeArray(tokens) {
  var struct = {structure: 'array'}

  consumeOp(tokens, '[')
  if (head(tokens) === ']') {
    throw new Error('Must specify type of Array - eg. [Type], got [] instead.')
  }

  struct.of = consumeType(tokens)
  consumeOp(tokens, ']')

  return struct
}

/**
 * @param {string[]} tokens
 * @return {Object}
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
 * @param {string[]} tokens
 * @return {Object}
 * @throws {Error}
 */
function consumeField(tokens) {
  var key = consumeIdent(tokens)
  consumeOp(tokens, ':')
  return {key: key, value: consumeTypes(tokens)}
}

/**
 * @param {string[]} tokens
 * @return {Object}
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
 * @param {string[]} tokens
 * @return {?Object}
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
 * @param {string[]} tokens
 * @return {Object}
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
 * @param {string[]} tokens
 * @return {Object}
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
    if (typeof types[typeObj.type] === 'undefined') {
      types[typeObj.type] = typeObj
    }

  } while (maybeConsumeOp(tokens, '|') !== null)

  return Object.keys(types).map(function (key) { return types[key] })
}

/**
 * @param {string} input
 * @return {Object}
 * @throws {Error}
 */
function typeParser(input) {
  var tokens = input.match(tokenRegex) || []
  return consumeTypes(tokens)
}

module.exports = typeParser
