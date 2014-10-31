var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var less = require('gulp-less');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var path = require('path');
var requireSugar = require('require-sugar');
var exec = require('child_process').exec;
var runSequence = require('run-sequence')


var path = {
  // directories of coffee and less files
  src: {
    less: 'app/stylesheets/main.less', // `main.less` imports all other files
    less_watch: 'app/stylesheets/**/*.less', // all less files for watching on
    js: 'app/javascripts/*'
  },
  // directories where the compiled css and js files will be stored
  dest: {
    css: 'public/stylesheets',
    js: 'public/javascripts'
  }
}

// default task, will be executed by running `gulp`
gulp.task('default', ['build']);


//runs `bower install` and compiles coffee/less files
gulp.task('build', function() {
  runSequence(['install-bower'], ['build-styles', 'build-scripts']);
});

// compiling LESS > CSS
gulp.task('build-styles', ['clean-styles'], function() {
  return gulp.src(path.src.less)
    .pipe(less().on('error', gutil.log))
    .pipe(gulp.dest(path.dest.css));
});

// compiling Coffee > js
gulp.task('build-scripts', ['clean-scripts'], function() {
  return gulp.src(path.src.js)
    .pipe(requireSugar())
    .pipe(coffee({}).on('error', gutil.log))
    .pipe(gulp.dest(path.dest.js));
});


// watches the coffee and less files and compiles them on change
gulp.task('watch', function() {
  runSequence(['install-bower'], ['build-styles', 'build-scripts'], ['watch-less', 'watch-scripts']);
});

gulp.task('watch-less', function() {
  gulp.watch(path.src.less_watch, ['build-styles']);
});

gulp.task('watch-scripts', function() {
  gulp.watch(path.src.js, ['build-scripts']);
});


// deletes all compiled files
gulp.task('clean', ['clean-styles', 'clean-scripts']);

// deletes all compiled css files
gulp.task('clean-styles', function() {
  return gulp.src(path.dest.css + '/*', {read: false})
    .pipe(clean());
});

// deletes all compiled js files
gulp.task('clean-scripts', function() {
  return gulp.src(path.dest.js + '/*', {read: false})
    .pipe(clean());
});


// runs the command `bower install` on the shell
gulp.task('install-bower', function(callback) {
  exec('bower install', function(err, stdout, stderr) {
    if(stdout) { gutil.log(stdout); }
    if(stderr) { gutil.log(stderr); }
    callback(err);
  });
});
