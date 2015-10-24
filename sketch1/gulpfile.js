var browserify = require('browserify');
var babelify = require('babelify');
var exec = require('child_process').exec;
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var fs = require("fs");

var config = {
  dist:   'dist',
  src:    'src',
  isProduction: gutil.env.production !== undefined,
  isWatching: false
};

function src() {
  return './' + config.src;
}

function dest() {
  return './' + config.dist;
}


function onError(err) {
  notify.onError({
    title:    "Gulp Error",
    subtitle: "",
    message:  "<%= error.message %>",
    sound:    "Beep"
  })(err);
  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src(src() + '/js/*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(jshint({asi: true}))
    .pipe(notify(function (file) {
      if (file.jshint.success) return false;
      var errors = file.jshint.results.map(function (data) {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }));
});

gulp.task('fonts', function(){
  return gulp.src(src() + '/fonts/*')
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(dest() + '/public/assets/fonts'))
    .pipe(notify({
      title: "Gulp",
      message: "Copied: <%= file.relative %>"})
    );
});

gulp.task('vendor', function(){
  return gulp.src(src() + '/js/vendor/**/*')
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(dest() + '/public/assets/js/vendor'))
    .pipe(notify({
      title: "Gulp",
      message: "Copied: <%= file.relative %>"})
    );
});

gulp.task('images', function(){
  return gulp.src(src() + '/img/*')
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(dest() + '/public/assets/img'))
    .pipe(notify({
      title: "Gulp",
      message: "Copied: <%= file.relative %>"}));
});

gulp.task('media', function(){
  return gulp.src(src() + '/media/*')
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(dest() + '/public/assets/media'))
    .pipe(notify({
      title: "Gulp",
      message: "Copied: <%= file.relative %>"}));
});

gulp.task('favicons', function(){
  return gulp.src(src() + '/favicons/*')
    .pipe(plumber({errorHandler: onError}))
    .pipe(gulp.dest(dest() + '/public/'))
    .pipe(notify({
      title: "Gulp",
      message: "Copied: <%= file.relative %>"}));
});

gulp.task('sass', function() {
  return gulp.src(src() + '/scss/main.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({ 
      style: 'compressed',
      includePaths: require('node-bourbon').includePaths
    }))
    .on('error', notify.onError(function (error) {
      return "Error: <%=error.message%>";
    }))
    .pipe(gulpif(config.isProduction, minifycss()))
    .pipe(gulp.dest(dest() + '/public/assets/css'))
    .pipe(notify({
      title: "Gulp SASS",
      message: "Generated: <%= file.relative %>"})
    );
});


function browserifyTask(entry, out) {
  var bundler = browserify({
    entries: [entry],
    extensions: ['js', 'jsx'],
    debug: !config.isProduction,
    cache: {},
    packageCache: {},
    fullPaths: !config.isProduction
  })
  .transform('browserify-handlebars')
  .transform(babelify.configure({ ignore: /libs.*/ }))
  .transform('glslify')
  .transform({ global: true }, config.isProduction ? 'uglifyify' : gutil.noop);

  if (config.isWatching) bundler = watchify(bundler);

  var rebundle = function() {
    return bundler
      .bundle()
      .on('error', notify.onError(function (error) {
        return "Error: <%=error.message%>";
      }))
      .pipe(source(out + 'tmp.js'))
      .pipe(rename(out))
      .pipe(gulp.dest(dest() + '/public/assets/js'))
      .pipe(notify({
        title: "Gulp " + (config.isWatching ? 'Watchify' : 'Browserify'),
        message: "Generated: <%= file.relative %>"})
      );
  };

  if (config.isWatching) bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('browserify', function() {
  browserifyTask(src() + '/js/main.js', 'bundle.js');
});

gulp.task('html', function(){
  gulp.src([src() + '/*.html', src() + '/*.php', src() + '/.htaccess'])
    .pipe(gulp.dest(dest() + '/public'));
});

gulp.task('watch', function() {
  config.isWatching = true;
  gulp.watch(src() + '/js/**/*.js', ['lint']);
  gulp.watch(src() + '/scss/**/*.scss', ['sass']);
  gulp.watch(src() + '/img/*', ['images']);
  gulp.watch(src() + '/js/vendor/**/*.js', ['vendor']);
  gulp.watch(src() + '/fonts/*', ['fonts']);
  gulp.watch([src() + '/*.html', src() + '/*.php'], ['html']);
  gulp.start('browserify');
});


gulp.task('default', ['fonts', 'images', 'media', 'favicons', 'vendor', 'html', 'lint', 'sass', 'browserify']);