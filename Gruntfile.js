module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ngdocs: {
			options: {
				dest: 'docs',
				scripts: ['angular.js',
                                'https://code.angularjs.org/1.2.8/angular-route.js',
                                'http://maps.google.com/maps/api/js?sensor=false&.js',
                                'https://code.jquery.com/jquery-1.11.0.js',
                                'http://code.jquery.com/ui/1.10.4/jquery-ui.js',
                                'http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js',
                                'src/main/js/map services/layer-openlayersv2.js',
                                'src/main/js/map services/map-openlayersv2.js',
                                'src/main/js/map services/data-openlayersv2.js',
                                'src/main/js/map services/mapservices.js',
                                'src/main/js/map services/map-control-openlayersv2.js',
                                'src/main/js/core/map-services.js',
                                'src/main/js/core/map-directives.js',
                                'src/main/js/core/map-config.js',
                                'src/main/js/core/control-directives.js',
                                'src/main/js/core/feature-directives.js',
                                'src/main/js/core/layer-services.js',
                                'src/main/js/core/layer-directives.js',
                                'src/main/js/core/marker-directives.js',
                                'src/main/js/core/core.js',
                                'src/main/js/core/services.js',
                                'src/main/js/ui/ui-directives.js',
                                'src/main/js/config/directives.js'],
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