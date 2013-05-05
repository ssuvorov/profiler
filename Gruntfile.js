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
            'src/lang/typeof.js',
            'src/lang/each.js',
            'src/lang/filter.js',
            'src/dom/event.js',
            'src/provider/http.js',
            'src/record.js',
            'src/profiler.js'
          ]
        }
      },
			test: {
				files: {
					'build/profiler.test.js': [
						'src/lang/typeof.js',
						'src/lang/each.js',
						'src/lang/filter.js',
						'src/dom/event.js',
            'src/provider/http.js',
						'src/record.js',
						'src/profiler.js'
					]
				}
			}
		},

		jasmine: {
			coverage: {
				src: 'build/profiler.test.js',
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
      dev: [
        'Gruntfile.js',
        'build/profiler.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    wrap: {
      dev: {
        src: ['build/profiler.js'],
        dest: '',
        wrapper: [
          ";(function (undefined) {\n'use strict';\n",
          '\n}());'
        ]
      }
    }
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-wrap');

	grunt.registerTask('test', ['concat:test', 'jasmine', 'clean:test']);
	grunt.registerTask('default', ['concat:dev', 'wrap:dev', 'jshint:dev']);
};