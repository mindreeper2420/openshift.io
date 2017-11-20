var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/**',
  ' * <%= pkg.name %> - <%=pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * Copyright 2016-' + (new Date()).getFullYear(), 
  ' * <%= pkg.author %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Minify JS
gulp.task('minify-js', function () {
  return gulp.src('js/osio.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Lint styles
gulp.task('lint-less', function lintCssTask() {
  const gulpStylelint = require('gulp-stylelint');

  return gulp
    .src('less/**/*.less')
    .pipe(gulpStylelint({
      failAfterError: false,
      reporters: [
        { formatter: 'string', console: true }
      ]
    }));
});

// Process Less files
gulp.task('less', function () {
  return gulp.src('./less/osio.less')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(less({
      paths: [path.join('node_modules')],
      sourceMap: {
        sourceMapRootpath: '/'
      }

    }))
    .pipe(header(banner, { pkg: pkg }))
    // .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
  })
});

// Watch for changes to .less files
gulp.task('less-watch', ['less'], function (done) {
  browserSync.reload();
  done();
});

// Run local serve with watches for changes to .js, .less and .html files
gulp.task('serve', ['less'], function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch('js/*.js', ['js-watch']);
  gulp.watch('less/**/*.less', ['less-watch']);
  gulp.watch('*.html').on('change', browserSync.reload);
});
