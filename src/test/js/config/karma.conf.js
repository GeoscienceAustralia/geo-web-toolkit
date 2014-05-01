// Karma configuration
// Generated on Wed Mar 19 2014 12:48:17 GMT+1100 (AUS Eastern Daylight Time)

module.exports = function(config) {
   config.set({

      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath : '../../../../../',

      // frameworks to use
      // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
      frameworks : [ 'jasmine' ],

      //      proxies:  {
      //          '/': 'http://localhost:8080/gamaps/'
      //      },

      // list of files / patterns to load in the browser
      files : [ 'http://localhost:8080/gamaps/webjars/jquery/1.10.1/jquery.min.js', 'http://localhost:8080/gamaps/webjars/modernizr/2.6.2/modernizr.js',
            'http://localhost:8080/gamaps/webjars/webshim/1.12.1/minified/polyfiller.js',
            'http://localhost:8080/gamaps/webjars/webshim/1.12.1/minified/shims/range-ui.js',
            'http://localhost:8080/gamaps/webjars/angularjs/1.2.8/angular.js', 'http://localhost:8080/gamaps/webjars/angularjs/1.2.8/angular-mocks.js',
            'http://localhost:8080/gamaps/webjars/bootstrap/3.0.3/js/bootstrap.min.js',
            'http://localhost:8080/gamaps/webjars/jquery-ui/1.10.2/ui/jquery-ui.js',
            'http://localhost:8080/gamaps/webjars/angular-ui-bootstrap/0.10.0/ui-bootstrap-tpls.js',
            'http://localhost:8080/gamaps/webjars/angular-ui-utils/0.1.0/ui-utils.js', 'http://localhost:8080/gamaps/webjars/angularjs/1.2.8/angular-route.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/map services/layer-openlayersv2.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/map services/map-openlayersv2.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/map services/mapservices.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/control-directives.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/feature-directives.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/layer-directives.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/layer-services.js', 'src/main/webapp/resources/assets/js/gawebtoolkit/core/map-config.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/map-directives.js', 'src/main/webapp/resources/assets/js/gawebtoolkit/core/map-services.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/marker-directives.js', 'src/main/webapp/resources/assets/js/gawebtoolkit/core/core.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/core/services.js', 'src/main/webapp/resources/assets/js/gawebtoolkit/ui/ui-directives.js',
            'src/main/webapp/resources/assets/js/gawebtoolkit/config/directives.js', 'http://localhost:8080/gamaps/webjars/openlayers/2.13.1/OpenLayers.js',
            'src/test/webapp/resources/js/*.js', 'src/test/webapp/resources/gawebtoolkit/*.js' ],

      // list of files to exclude
      exclude : [ 'src/test/webapp/resources/js/karma.*.js' ],

      // preprocess matching files before serving them to the browser
      // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors : {
         'src/main/webapp/resources/assets/js/gawebtoolkit/core/*.js' : [ 'coverage' ],
         'src/main/webapp/resources/assets/js/gawebtoolkit/config/*.js' : [ 'coverage' ],
         'src/main/webapp/resources/assets/js/gawebtoolkit/map services/*.js' : [ 'coverage' ],
         'src/main/webapp/resources/assets/js/gawebtoolkit/ui/*.js' : [ 'coverage' ]
      },
      coverageReporter : {
         type : 'html',
         dir : 'coverage/'
      },

      // test results reporter to use
      // possible values: 'dots', 'progress'
      // available reporters: https://npmjs.org/browse/keyword/karma-reporter
      reporters : [ 'progress', 'html' ],

      htmlReporter : {
         outputDir : 'target/karma-reports'
      },

      // web server port
      port : 9876,

      // enable / disable colors in the output (reporters and logs)
      colors : true,

      // level of logging
      // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
      logLevel : config.LOG_INFO,

      // enable / disable watching file and executing tests whenever any file changes
      autoWatch : true,

      // start these browsers
      // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
      browsers : [ 'PhantomJS' ],

      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun : false,

      plugins : [ 'karma-jasmine', 'karma-phantomjs-launcher', 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-ie-launcher', 'karma-html-reporter',
            'karma-coverage' ]

   });
};
