var gulp = require('gulp');
var cs   = require('gulp-coffee');

var cffeeSrc = './coffee/**/*.coffee';

gulp.task('default', function () {
    gulp.src(cffeeSrc)
        .pipe(cs())
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    gulp.watch(cffeeSrc, ['default']);
});
