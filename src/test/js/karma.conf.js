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
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/jquery-ui/jquery-ui.js',
            'bower_components/angular-ui/build/angular-ui.js',
            'bower_components/angular-ui-utils/ui-utils.js',
            'external/OpenLayers2/OpenLayers.js',
            'bower_components/proj4/dist/proj4.js',
            'node_modules/openlayers/dist/ol-debug.js',
            'src/main/js/map services/*.js',
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
            type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
            dir: 'coverage/'
        },

        reporters: [ 'progress', 'coverage', 'coveralls'],

        htmlReporter: {
            outputDir: 'target/karma-reports'
        },

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
