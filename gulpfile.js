const gulp = require('gulp');
const plugins = require('gulp-load-plugins');
const critical = require('critical').stream;
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
const source = require('vinyl-source-stream');
const fs = require('fs');

const paths = {
  css: {
    src: './src/scss/',
    dest: './public/css/'
  },
  images: {
    src: './src/img/**/*',
    dest: './public/img/'
  }
};


/* ----------------- */
/* Development
/* ----------------- */

gulp.task('development', ['templates', 'styles'], () => {
  browserSync({
    server: {
      baseDir: './public/'
    },
    open: false,
    online: false,
    notify: false,
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: (snippet) => snippet
      }
    }
  });

  gulp.watch(paths.css.src + '**/*.scss', ['styles']);
  gulp.watch('./pages/**/*.html', ['templates']);
});


/* ----------------- */
/* Templates
/* ----------------- */
gulp.task('templates', () => {
  return gulp.src('./pages/**/*.+(html|nunjucks)')
    .pipe(plugins().data(function() {
      return require('./src/data.json')
    }))
    .pipe(plugins().nunjucksRender({
      path: ['./templates/']
    }))
    .pipe(gulp.dest('public'))
    .pipe(browserSync.stream());
});


/* ----------------- */
/* Styles
/* ----------------- */

gulp.task('styles', () => {
  return gulp.src(paths.css.src + '**/*.scss')
    .pipe(plugins().sassGlob())
    .pipe(plugins().sourcemaps.init())
    .pipe(plugins().postcss([
      autoprefixer({ browsers: ['last 2 versions'] })
    ], { syntax: require('postcss-scss') }))
    .pipe(plugins().sass().on('error', plugins().sass.logError))
    .pipe(plugins().sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.stream());
});


/* ----------------- */
/* Cssmin
/* ----------------- */

gulp.task('cssmin', () => {
  return gulp.src(paths.css.src + '**/*.scss')
    .pipe(plugins().sassGlob())
    .pipe(plugins().sass({
      'outputStyle': 'compressed'
    }).on('error', plugins().sass.logError))
    .pipe(gulp.dest(paths.css.dest));
});


// Generate & Inline Critical-path CSS
gulp.task('critical', function () {
  return gulp.src('public/*.html')
    .pipe(critical({base: 'public/', inline: true, minify: true, css: ['public/css/georgefoxalumni.css']}))
    .on('error', function(err) { gutil.log(gutil.colors.red(err.message)); })
    .pipe(gulp.dest('public'));
});

/* ----------------- */
/* Taks
/* ----------------- */

gulp.task('default', ['development']);
gulp.task('deploy', ['cssmin']);
gulp.task('crit', ['critical']);