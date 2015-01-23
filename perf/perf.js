/**
 * @license
 * Based on https://github.com/lodash/lodash/blob/master/perf/perf.js
 * Available under MIT license <https://lodash.com/license>
 */
var Benchmark = require('benchmark')
var formatNumber = Benchmark.formatNumber
var tcParser = require('type-check').parseType
var tcChecker = require('type-check').parsedTypeCheck
var yatcParser = require('../src/parser')
var yatcChecker = require('../src/checker').check

var score = {a: [], b: []}
var suites = []


function getGeometricMean(array) {
  return Math.pow(Math.E, array.reduce(function(sum, x) {
    return sum + Math.log(x)
  }, 0) / array.length) || 0
}

function getHz(bench) {
  var result = 1 / (bench.stats.mean + bench.stats.moe)
  return isFinite(result) ? result : 0
}

Benchmark.extend(Benchmark.Suite.options, {
  'onStart': function () {
    console.log('\n' + this.name + ':')
  },
  'onCycle': function (event) {
    console.log(event.target.toString())
  },
  'onComplete': function () {
    var errored = Object.keys(this).some(function (index) {
      return !!this[index].error
    }.bind(this))

    if (errored) {
      console.log('There was a problem, skipping...')

    } else {
      var fastest = this.filter('fastest')
      var fastestHz = getHz(fastest[0])
      var slowest = this.filter('slowest')
      var slowestHz = getHz(slowest[0])
      var aHz = getHz(this[0])
      var bHz = getHz(this[1])
      var percent = ((fastestHz / slowestHz) - 1) * 100
      percent = percent < 1 ? percent.toFixed(2) : Math.round(percent)
      percent = formatNumber(percent)

      if (fastest.length > 1) {
        console.log('It\'s too close to call.')
        aHz = bHz = slowestHz

      } else {
        console.log(fastest[0].name + ' is ' + percent + '% faster.')

      }

      score.a.push(aHz)
      score.b.push(bHz)
    }

    suites.shift()
    if (suites.length > 0) {
      suites[0].run()

    } else {
      var aMeanHz = getGeometricMean(score.a)
      var bMeanHz = getGeometricMean(score.b)
      var fastestMeanHz = Math.max(aMeanHz, bMeanHz)
      var slowestMeanHz = Math.min(aMeanHz, bMeanHz)
      var xFaster = fastestMeanHz / slowestMeanHz
      var percentFaster = formatNumber(Math.round((xFaster - 1) * 100))
      xFaster = xFaster === 1 ? '' : '(' + formatNumber(xFaster.toFixed(2)) + 'x)'
      var message = 'is ' + percentFaster + '% ' + xFaster + ' faster than'

      if (aMeanHz > bMeanHz) {
        console.log('\nyatc ' + message + ' type-check.')

      } else {
        console.log('\ntype-check ' + message + ' yatc.')

      }
    }
  }
})


function addSuite(benchType, type, input, customTypes) {
  var tcFn, yatcFn

  if (benchType === 'parse') {
    tcFn = function () { tcParser(type) }
    yatcFn = function () { yatcParser(type) }

  } else {
    var tcType = tcParser(type)
    tcFn = function () { tcChecker(tcType, customTypes) }

    var yatcType = yatcParser(type)
    yatcFn = function () { yatcChecker(yatcType, customTypes) }

  }

  suites.push(
    Benchmark.Suite(benchType + ' ' + type)
      .add('yatc', yatcFn)
      .add('type-check', tcFn)
  )
}

addSuite('parse', 'Number')
addSuite('check', 'Number', 1)
addSuite('parse', 'Number|String')
addSuite('check', 'Number|String', '')
addSuite('parse', 'Maybe Number')
addSuite('check', 'Maybe Number', null)
addSuite('parse', '[Number]')
addSuite('check', '[Number]', [1, 2])
addSuite('parse', '(Int, Float)')
addSuite('check', '(Int, Float)', [1, 0.1])
addSuite('parse', '{a: String}')
addSuite('check', '{a: String}', {a: 'hi'})
addSuite('parse', '{a: (Number), ...}')
addSuite('check', '{a: (Number), ...}', {a: [0], b: 0.1})
addSuite('parse', '[{lat: Float, long: Float}]')
addSuite('check', '[{lat: Float, long: Float}]', [{lat: 15.42, long: 42.15}])


console.log('Make a cup of tea and relax')
suites[0].run()
