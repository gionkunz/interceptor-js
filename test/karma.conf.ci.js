'use strict';

var baseConfig = require('./karma.conf.js');
var pkg = require('../package.json');

module.exports = function (config) {
  // Load base config
  baseConfig(config);

  // Override base config
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-junit-reporter'
    ],
    reporters: ['progress', 'junit'],
    junitReporter: {
      outputFile: './test/test-results.xml',
      suite: pkg.name
    }
  });
};