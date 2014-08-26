'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var exorcist = require('exorcist');
var transform = require('vinyl-transform');
var wrap = require('gulp-wrap-umd');
var mkdirp = require('mkdirp');

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src('./src/**/*.js')
    .pipe(concat('interceptor.min.js'))
    .pipe(wrap({
      namespace: 'Interceptor'
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    // Exorcist requires a vinyl transform to work with gulp
    .pipe(transform(function() {
      // We need to ensure the target path first, there is an open pull request with exorcist to do that for us
      // https://github.com/thlorenz/exorcist/pull/8
      mkdirp.sync('./dist');
      return exorcist('./dist/interceptor.min.js.map');
    }))
    .pipe(gulp.dest('./dist'));
});