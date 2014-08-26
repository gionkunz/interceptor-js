'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var exorcist = require('exorcist');
var transform = require('vinyl-transform');
var wrap = require('gulp-wrap-umd');
var mkdirp = require('mkdirp');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @author Gion Kunz',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * Free to use under the WTFPL license.',
  ' * http://www.wtfpl.net/',
  ' */',
  ''].join('\n');

var pkg = require('../../package.json');

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src('./src/**/*.js')
    .pipe(concat('interceptor.js'))
    .pipe(wrap({
      namespace: 'Interceptor'
    }))
    .pipe(header(banner, pkg))
    .pipe(gulp.dest('./dist'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(header(banner, pkg))
    .pipe(rename('interceptor.min.js'))
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