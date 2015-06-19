
var gulp            = require('gulp');
var runSequence     = require('run-sequence');
var browserify      = require('browserify');
var babelify        = require('babelify');
var source          = require('vinyl-source-stream');
var glob            = require('glob');
var es              = require('event-stream');
var vulcanize       = require('gulp-vulcanize');
var minifyInline    = require('gulp-minify-inline');
var del             = require('del');

var sourceDir       = "source/elements/";

gulp.task('default', main);
gulp.task('html', html);
gulp.task('scripts', scripts);
gulp.task('vulcanizeAndMinify', vulcanizeAndMinify);
gulp.task('clean', clean);

function main() {
    var tasks = ['scripts', 'html'];
    runSequence('clean', tasks, 'vulcanizeAndMinify');
}

function clean(done) {
    del(['dist'], done);
}

function html() {
    return gulp.src('source/elements/**/*.html')
        .pipe(gulp.dest('dist/elements'));
}

function scripts() {
    return glob('**/*.js', { cwd: sourceDir }, function(err, files) {
        var tasks = files.map(function(entry) {
            return browserify(sourceDir + entry, {
                    transform: [babelify]
                })
                .bundle()
                .pipe(source(entry))
                .pipe(gulp.dest('dist/elements/'));
        });
        return es.merge.apply(null, tasks);
    });
}

function vulcanizeAndMinify() {
    return gulp.src('dist/elements/**/*.html')
        .pipe(vulcanize({
            inlineScripts: true,
            inlineCss: true,
            stripExcludes: false,
            excludes: ['bower_components/polymer/polymer.html']
        }))
        .pipe(minifyInline())
        .pipe(gulp.dest('dist/elements'));
}