module.exports = function(grunt) {

	grunt.initConfig({
		clean: {
			test: ['build/profiler.test.js']
		},

		concat: {
			test: {
				files: {
					'build/profiler.test.js': [
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	grunt.registerTask('test', ['concat:test', 'jasmine', 'clean:test']);
};