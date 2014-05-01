var baseConfig = require('./karma.conf.js');

module.exports = function(config) {
   // Load base config
   baseConfig(config);

	// Update Webjar dependency locations
	updateWebjarLocations(config);

   // Override base config
   config.set({
      singleRun : true,
      autoWatch : false,
      reporters : [ 'progress', 'junit' ],
      browsers : [ 'PhantomJS' ],
      plugins : [ 'karma-jasmine', 'karma-phantomjs-launcher', 'karma-junit-reporter' ],
      junitReporter : {
         outputFile : "target/surefire-reports/js-test-results.xml",
         suite : "jasmine-tests"
      }
   });
};

function updateWebjarLocations(config)
{
	"use strict";
	for (var i = 0; i < config.files.length; i++)
	{
		config.files[i] = config.files[i].replace('http://localhost:8080/gamaps/webjars', 'target/dependencies/META-INF/resources/webjars');
		config.files[i] = config.files[i].replace('src/main/webapp/resources/assets', 'target/dependencies/META-INF/resources/assets');
	}
}