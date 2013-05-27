/**
 * @TODO: use Google closure compiler
 */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    clean: {
      test: ['build/profiler.test.js']
    },

    concat: {
      dev: {
        files: {
          'build/profiler.js': [
            'src/browser/supports.js',
            'src/lang/typeof.js',
            'src/lang/each.js',
            'src/lang/filter.js',
            'src/provider/http.js',
            'src/start.js',
            'src/record.js',
            'src/report.js',
            'src/profiler.js'
          ]
        }
      },
      test: {
        files: {
          'build/profiler.test.js': [
            'test/fixture/performance.js',
            'src/browser/supports.js',
            'src/lang/typeof.js',
            'src/lang/each.js',
            'src/lang/filter.js',
            'src/provider/http.js',
            'src/start.js',
            'src/record.js',
            'src/report.js',
            'src/profiler.js'
          ]
        }
      }
    },

    jasmine: {
      dev: {
        src: 'build/profiler.js',
        options: {
          specs: 'test/specs/profiler.spec.js',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'test/report/coverage.json',
            report: [
              {
                type: 'html',
                options: {
                  dir: 'test/report/html'
                }
              }
            ]
          }
        }
      },
      prod: {
        src: 'build/profiler.min.js',
        options: {
          specs: 'test/specs/profiler.spec.js',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'test/report/coverage.json',
            report: [
              {
                type: 'html',
                options: {
                  dir: 'test/report/html'
                }
              }
            ]
          }
        }
      }
    },

    jshint: {
      alldev: [
        'Gruntfile.js',
        'build/profiler.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      dev: {
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'src/*.js'
        ],
        tasks: ['default']
      }
    },

    wrap: {
      all: {
        src: ['build/profiler.js'],
        dest: '',
        wrapper: [
          ';(function (undefined) {\n\'use strict\';\n',
          '\n}());'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('build-dev', ['concat:dev', 'wrap']);
  grunt.registerTask('build-test', ['concat:test', 'wrap']);
  grunt.registerTask('build-prod', ['build-dev']);
  grunt.registerTask('test-dev', ['build-test', 'jasmine:dev']);
  grunt.registerTask('test-prod', ['build-prod', 'jasmine:prod']);

  grunt.registerTask('test', ['test-dev']);
  grunt.registerTask('prod', ['build-prod']);
  grunt.registerTask('hint', ['build-dev', 'jshint']);
  grunt.registerTask('default', ['build-dev']);
};