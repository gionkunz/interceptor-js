'use strict';

module.exports = function (config) {
  config.set({
    basePath: '../../',
    frameworks: [
      'jasmine'
    ],
    reporters: ['progress'],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS'],
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher'
    ]
  });
};