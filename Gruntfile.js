module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      production: {
        src: ['src/index.js'],
        dest: 'build/yatc.js',
        options: {
          browserifyOptions: {
            standalone: 'yatc'
          }
        }
      },
      test: {
        src: ['test/*.js', 'build/yatc.test.js'],
        dest: 'build/yatc.test.js'
      },
      perf: {
        src: ['perf/perf.js'],
        dest: 'build/yatc.perf.js'
      }
    },
    clean: {
      builds: {
        src: ['build']
      }
    },
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
          coverage: true,
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
    },
    uglify: {
      production: {
        files: {
          'build/yatc.min.js': 'build/yatc.js'
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

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-mocha-istanbul')
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.registerTask('build', ['browserify:production', 'uglify:production'])
  grunt.registerTask('coverage', ['mocha_istanbul:coverage'])
  grunt.registerTask('coveralls', ['mocha_istanbul:coveralls'])
  grunt.registerTask('test', ['mochaTest'])
}
