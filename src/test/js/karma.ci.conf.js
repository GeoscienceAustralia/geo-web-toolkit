var baseConfig = require('./karma.conf.js');

module.exports = function (config) {
    // Load base config
    baseConfig(config);

    // Override base config
    config.set({
        singleRun: true,
        autoWatch: false,
        reporters: ['coverage', 'coveralls'],
        browsers: ['PhantomJS'],
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-ng-html2js-preprocessor',
            'karma-coverage',
            'karma-coveralls'
        ]
    });
};