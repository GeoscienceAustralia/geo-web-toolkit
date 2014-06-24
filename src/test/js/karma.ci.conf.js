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
      plugins : [ 'karma-jasmine', 'karma-phantomjs-launcher', 'karma-junit-reporter', 'karma-coverage' ],
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
        //overriding file paths can be done here.
		if(config.files[i].lastIndexOf('src/main/js/', 0) === 0)
		{
			config.files[i] = 'target/classes/META-INF/resources/**/*min.js'; //Testing minified version
		}
	}
}