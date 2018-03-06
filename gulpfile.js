const gulp = require('gulp');
const plugins = require('gulp-load-plugins');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const paths = {
  scss: 'src/scss/**/*.scss',
  css: 'public/css/',
  njk: 'templates/**/*.njk',
  html: 'pages/**/*.html',
  dist: 'public/'
}


/* ----------------- */
/* Development
/* ----------------- */

gulp.task('dev', ['scss', 'nunjucks'], () => {
  browserSync.init({
    server: './public/', open: false, online: false, notify: true
  });
  
  gulp.watch(paths.njk, ['nunjucks']);
  gulp.watch(paths.scss, ['scss']);
  gulp.watch(paths.html, ['nunjucks']).on('change', reload);
});


// Converting njk files to html
gulp.task('nunjucks', () => {
  return gulp.src(paths.html)
    .pipe(plugins().data(function() {
      return require('./src/data.json')
    }))
    .pipe(plugins().nunjucksRender({
      path: ['templates/']
    }))
    .pipe(gulp.dest('public'))
    .pipe(reload({stream: true }));
});


// HTML processing
gulp.task('html', () => {
  return gulp.src(paths.html)
    .pipe(newer(paths.html))
    .pipe(gulp.dest(paths.dist));
});


// Converting scss files to css files
gulp.task('scss', () => {
  return gulp.src(paths.scss)
    .pipe(plugins().sassGlob())
    .pipe(plugins().postcss([
      autoprefixer({ browsers: ['last 2 versions'] })
    ], { syntax: require('postcss-scss') }))
    .pipe(plugins().sass().on('error', plugins().sass.logError))
    .pipe(gulp.dest(paths.css))
    .pipe(reload({stream: true }));
});


// Minify the CSS for production
gulp.task('cssmin', () => {
  return gulp.src(paths.css.src + '**/*.scss')
    .pipe(plugins().sassGlob())
    .pipe(plugins().sass({
      'outputStyle': 'compressed'
    }).on('error', plugins().sass.logError))
    .pipe(gulp.dest(paths.css.dest));
});

/* ----------------- */
/* Taks
/* ----------------- */

gulp.task('default', ['dev']);
gulp.task('deploy', ['nunjucks', 'html', 'cssmin']);