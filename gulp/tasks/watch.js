'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');

// Rerun the task when a file changes
gulp.task('watch', function() {

  watch({
    glob: ['./src/**/*.js', './test/spec/**/*.js']
  }, ['lint', 'test', 'scripts']);
});