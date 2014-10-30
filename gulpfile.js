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
  src: {
    less: 'app/stylesheets/main.less',
    less_watch: 'app/stylesheets/**/*.less',
    js: 'app/javascripts/*'
  },
  dest: {
    css: 'public/stylesheets',
    js: 'public/javascripts'
  }
}

// compiling LESS > CSS
function makeScripts() {
  return gulp.src(path.src.js)
    .pipe(requireSugar())
    .pipe(coffee({}).on('error', gutil.log))
    .pipe(gulp.dest(path.dest.js));
}

// compiling Coffee > js
function makeStyles() {
  return gulp.src(path.src.less)
    .pipe(less())
    .pipe(gulp.dest(path.dest.css));
}


gulp.task('build', function() {
  runSequence(['clean', 'install-bower'], ['build-less', 'build-scripts'])
});

gulp.task('build-less', function() {
  return makeStyles();
});

gulp.task('build-scripts', function() {
  return makeScripts();
});

gulp.task('install-bower', function(callback) {
  exec('bower install', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('watch', function() {

});

gulp.task('clean', function() {
  return gulp.src([path.dest.js + '/*', path.dest.css + '/*'], {read: false})
    .pipe(clean());
});

// default task, will be executed by running `gulp`
gulp.task('default', ['build']);
