// Karma configuration
// Generated on Wed Mar 19 2014 12:48:17 GMT+1100 (AUS Eastern Daylight Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'jasmine' ],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-route/angular-route.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/bootstrap/dist/js/bootstrap.js',
            'node_modules/jquery-ui-bundle/jquery-ui.min.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
            'external/OpenLayers2/OpenLayers.js',
            'node_modules/proj4/dist/proj4.js',
            'node_modules/openlayers/dist/ol-debug.js',
            'src/main/js/map_services/*.js',
            'src/main/js/config/*.js',
            'src/main/js/core/core.js',
            'src/main/js/core/*.js',
            'src/main/js/vendor/*.js',
            'src/main/js/ui/components/**/*.js',
            'src/main/js/toolkit-templates.js',
            'src/main/js/ui/components/components.js',
            'src/main/js/ui/ui-directives.js',
            'http://maps.google.com/maps/api/js?.js&libraries=places',
            'src/test/js/**/*.js'],

        // list of files to exclude
        exclude: [
            'src/test/js/karma*.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/main/js/**/*.js': [ 'coverage' ]
        },
        coverageReporter: {
            type : 'lcovonly',
            dir: 'coverage/',
            file: 'lcov.info'
        },

        reporters: [ 'progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'PhantomJS' ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        plugins: [ 'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-ie-launcher',
            'karma-html-reporter',
            'karma-coverage']

    });
};
