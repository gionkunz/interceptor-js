'use strict';

var requireDir = require('require-dir');
var gulp = require('gulp');
var del = require('del');

//TODO: Change to not use global object
global.pkg = require('../package.json');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./tasks', { recurse: true });

// Clean target directory
del(['dist/**'], { force: true });

gulp.task('default', ['watch', 'lint', 'scripts', 'test']);