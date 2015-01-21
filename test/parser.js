var expect = require('chai').expect

var parser = require('../src/parser')

var fixtures = require('./fixtures/parser.json')


function runTests(desc, fixtures) {
  describe(desc, function () {
    Object.keys(fixtures).forEach(function (desc) {
      var fixture = fixtures[desc]

      if (typeof fixture.src === 'undefined') {
        return runTests(desc, fixture)
      }

      it(desc, function () {
        function fn() { return parser(fixture.src) }

        if (typeof fixture.error !== 'undefined') {
          expect(fn).to.throw(new RegExp(fixture.error))

        } else {
          expect(fn()).to.deep.equal(fixture.result)

        }
      })
    })
  })
}

runTests('parser', fixtures)
