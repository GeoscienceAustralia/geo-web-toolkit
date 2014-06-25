// Karma configuration
// Generated on Wed Mar 19 2014 12:48:17 GMT+1100 (AUS Eastern Daylight Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'jasmine' ],

        //      proxies:  {
        //          '/': 'http://localhost:8080/gamaps/'
        //      },

        // list of files / patterns to load in the browser
        files: [
            'target/dependencies/META-INF/resources/webjars/jquery/1.10.1/jquery.min.js',
            'target/dependencies/META-INF/resources/webjars/angularjs/1.2.8/angular.js',
            'target/dependencies/META-INF/resources/webjars/angularjs/1.2.8/angular-route.js',
            'target/dependencies/META-INF/resources/webjars/angularjs/1.2.8/angular-mocks.js',
            'target/dependencies/META-INF/resources/webjars/modernizr/2.6.2/modernizr.js',
            'target/dependencies/META-INF/resources/webjars/webshim/1.14.2/minified/polyfiller.js',
            'target/dependencies/META-INF/resources/webjars/webshim/1.14.2/minified/shims/range-ui.js',
            'target/dependencies/META-INF/resources/webjars/bootstrap/3.0.3/js/bootstrap.min.js',
            'target/dependencies/META-INF/resources/webjars/jquery-ui/1.10.2/ui/jquery-ui.js',
            'target/dependencies/META-INF/resources/webjars/angular-ui-bootstrap/0.10.0/ui-bootstrap-tpls.js',
            'target/dependencies/META-INF/resources/webjars/angular-ui-utils/0.1.0/ui-utils.js',
            'target/dependencies/META-INF/resources/webjars/openlayers/2.13.1/OpenLayers.js',
            'src/main/js/**/*.js',
            'src/test/js/**/*.js'],

        // list of files to exclude
        exclude: [ 'src/test/js/karma*.js' ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/main/js/**/*.js': [ 'coverage' ]
        },
        coverageReporter: {
            type: 'html',
            dir: 'target/coverage/'
        },

        reporters: [ 'progress', 'coverage' ],

        htmlReporter: {
            outputDir: 'target/karma-reports'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

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
            'karma-coverage' ]

    });
};
