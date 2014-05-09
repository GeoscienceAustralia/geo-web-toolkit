// Karma configuration
// Generated on Wed Mar 19 2014 12:48:17 GMT+1100 (AUS Eastern Daylight Time)

module.exports = function(config) {
   config.set({

      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath : '../../../',

      // frameworks to use
      // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
      frameworks : [ 'jasmine' ],

      //      proxies:  {
      //          '/': 'http://localhost:8080/gamaps/'
      //      },

      // list of files / patterns to load in the browser
      files : [
            'http://localhost:8080/webjars/jquery/1.10.1/jquery.min.js',
            'http://localhost:8080/webjars/modernizr/2.6.2/modernizr.js',
            'http://localhost:8080/webjars/webshim/1.12.1/minified/polyfiller.js',
            'http://localhost:8080/webjars/webshim/1.12.1/minified/shims/range-ui.js',
            'http://localhost:8080/webjars/angularjs/1.2.8/angular.js',
            'http://localhost:8080/webjars/angularjs/1.2.8/angular-mocks.js',
            'http://localhost:8080/webjars/bootstrap/3.0.3/js/bootstrap.min.js',
            'http://localhost:8080/webjars/jquery-ui/1.10.2/ui/jquery-ui.js',
            'http://localhost:8080/webjars/angular-ui-bootstrap/0.10.0/ui-bootstrap-tpls.js',
            'http://localhost:8080/webjars/angular-ui-utils/0.1.0/ui-utils.js',
            'http://localhost:8080/webjars/angularjs/1.2.8/angular-route.js',
            'src/main/js/map services/layer-openlayersv2.js',
            'src/main/js/map services/map-openlayersv2.js',
            'src/main/js/map services/mapservices.js',
            'src/main/js/core/control-directives.js',
            'src/main/js/core/feature-directives.js',
            'src/main/js/core/layer-directives.js',
            'src/main/js/core/layer-services.js',
            'src/main/js/core/map-config.js',
            'src/main/js/core/map-directives.js',
            'src/main/js/core/map-services.js',
            'src/main/js/core/marker-directives.js',
            'src/main/js/core/core.js',
            'src/main/js/core/services.js',
            'src/main/js/ui/ui-directives.js',
            'src/main/js/config/directives.js',
            'http://localhost:8080/webjars/openlayers/2.13.1/OpenLayers.js',
            'src/test/js/unit/**/*.js'],

      // list of files to exclude
      exclude : [ 'src/test/js/karma*.js' ],

      // preprocess matching files before serving them to the browser
      // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors : {
         'src/main/js/geo-web-toolkit/GEO-WEB-TOOLKIT-VERSION/core/*.js' : [ 'coverage' ],
         'src/main/js/geo-web-toolkit/GEO-WEB-TOOLKIT-VERSION/config/*.js' : [ 'coverage' ],
         'src/main/js/geo-web-toolkit/GEO-WEB-TOOLKIT-VERSION/map services/*.js' : [ 'coverage' ],
         'src/main/js/geo-web-toolkit/GEO-WEB-TOOLKIT-VERSION/ui/*.js' : [ 'coverage' ]
      },
      coverageReporter : {
         type : 'html',
         dir : 'target/coverage/'
      },

      reporters : [ 'progress' ],

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

      plugins : [ 'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-ie-launcher',
            'karma-html-reporter',
            'karma-coverage' ]

   });
};
