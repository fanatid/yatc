module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      src: ['Gruntfile.js', 'src/*.js', 'test/*.js'],
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      }
    },
    jscs: {
      src: ['Gruntfile.js', 'src/*.js', 'test/*.js'],
      options: {
        config: '.jscsrc'
      }
    },
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    mocha_istanbul: {
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      coverage: {
        src: 'test',
        options: {
          mask: '*.js',
          reporter: 'spec'
        }
      },
      coveralls: {
        src: 'test',
        options: {
          mask: '*.js',
          reporter: 'spec'
        }
      }
    },
    mochaTest: {
      test: {
        src: ['test/*.js'],
        options: {
          reporter: 'spec'
        }
      }
    }
  })

  grunt.event.on('coverage', function (lcov, done) {
    require('coveralls').handleInput(lcov, function (error) {
      if (error && !(error instanceof Error)) {
        error = new Error(error)
      }

      done(error)
    })
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-mocha-istanbul')
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.registerTask('coverage', ['mocha_istanbul:coverage'])
  grunt.registerTask('coveralls', ['mocha_istanbul:coveralls'])
  grunt.registerTask('test', ['mochaTest'])
  grunt.registerTask('default', ['jshint', 'jscs', 'test'])
}
