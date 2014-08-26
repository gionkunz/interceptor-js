'use strict';

var gulp = require('gulp');
var karma = require('gulp-karma');
var args = require('yargs').argv;

gulp.task('test', ['scripts'], function () {
  // Be sure to return the stream
  return gulp.src(['./src/**/*.js', './dist/**/*.js', './test/spec/**/*.js'])
    .pipe(karma({
      configFile: args.ci ? './test/karma.conf.ci.js' : './test/karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      // In CI mode, make sure failed tests cause gulp to exit non-zero
      if(args.ci) {
        throw err;
      }
    });
});