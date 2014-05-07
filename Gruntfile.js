module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ngdocs: {
			options: {
				dest: 'docs',
				scripts: ['angular.js'],
				html5Mode: false
			},
			api: {
				src: ['src/**/*.js', '!src/**/*.spec.js'],
				title: 'API Documentation'
			}
		}
	});
	grunt.loadNpmTasks('grunt-ngdocs');
	grunt.registerTask('default',['ngdocs']);
};