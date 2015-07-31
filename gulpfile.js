// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
// var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var fixmyjs = require('gulp-fixmyjs');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var connect = require('gulp-connect');

// Lint Task
gulp.task('lint', function() {
    /*
     * Can take parameter from cmd:
     * > gulp lint --file <stub>
     * will only lint files containing <stub>
     */
    return gulp.src('js/**/'+(argv.file ? argv.file : '')+'*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Fix js then lint
gulp.task('flint', function() {
    /*
     * Can take parameter from cmd:
     * > gulp flint --file <stub>
     * will only flint files containing <stub>
     */
    return gulp.src('js/**/'+(argv.file ? argv.file : '')+'*.js')
        .pipe(fixmyjs())
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// // Compile Our Sass
// gulp.task('sass', function() {
//     return gulp.src('scss/*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('css'));
// });

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('js/**/*.js')
        .pipe(fixmyjs())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest('dist'));
});

// Try to Uglify without Minifying, to get specific location of errors
gulp.task('test-scripts', function() {
    return gulp.src('js/**/*.js')
        .pipe(fixmyjs())
        .pipe(uglify().on('error', gutil.log));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['flint', 'scripts']);
    // gulp.watch('scss/*.scss', ['sass']);
});

// Serve files
gulp.task('serve', function() {
    connect.server({
        port: 1337,
        host: '0.0.0.0'

        // , livereload: { port: 1337 }
        // TODO : Get this shit to work
    });
});

// Default Task
gulp.task('default', ['flint', /*'sass',*/ 'scripts', 'serve', 'watch']);