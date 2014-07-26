var gulp = require('gulp');
var cs   = require('gulp-coffee');

gulp.task('default', function () {
    gulp.src('./coffee/**/*.coffee')
        .pipe(cs())
        .pipe(gulp.dest('./'));
});
