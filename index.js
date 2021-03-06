var gulp = require('gulp');
var Elixir = require('laravel-elixir');
var ngAnnotate = require('gulp-ng-annotate');
var html2js = require('gulp-html2js');
var jshint = require('gulp-jshint');
var babel = require("gulp-babel");
var templateCache = require('gulp-angular-templatecache');
var insert = require('gulp-insert');
var stylish = require('jshint-stylish');

var Task = Elixir.Task;
var $ = Elixir.Plugins;

Elixir.extend('angular', function (src, output, outputFilename) {
  var config = Elixir.config;
  var baseDir = src || config.assetsPath + '/angular';

  new Task('angular', function () {

    return gulp.src([
      baseDir + '/*.module.js',
      baseDir + '/**/*.module.js',
      baseDir + '/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .pipe($.if(config.sourcemaps, $.sourcemaps.init()))
    .pipe($.concat(outputFilename || 'application.js'))
    .pipe(babel())
    .pipe(ngAnnotate())
    .on('error', function (e) {
      new Elixir.Notification().error(e, 'Angular compilation failed!');
      this.emit('end');
    })
    .pipe($.if(config.production, $.uglify()))
    .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
    .pipe(gulp.dest(output || config.get('public.js.outputFolder') + '/app/'))
    .pipe(new Elixir.Notification('Angular compiled!'));
  }).watch(baseDir + '/**/*.js');
});

Elixir.extend("angulartemplatecache", function (options, from, to, wrap) {
  new Task('angulartemplatecache', function () {
    if (wrap) {
      return gulp.src(from)
        .pipe(templateCache(options))
        .pipe(insert.wrap('(function(angular) {', '})(angular);'))
        .pipe(gulp.dest(to));
    }
    else {
      return gulp.src(from)
        .pipe(templateCache(options))
        .pipe(gulp.dest(to));
    }
  }).watch(from);
});
