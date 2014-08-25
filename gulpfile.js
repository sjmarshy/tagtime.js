var gulp       = require('gulp');
var browserify = require('browserify');
var fs = require('fs');
var cs         = require('gulp-coffee');

var cffeeSrc  = './coffee/**/*.coffee';
var publicSrc = './public/js/index.js';
var publicDst = './public/js/build.js';

gulp.task('browserify', function (done) {
    var w = fs.createWriteStream(publicDst);
    var b;
    w.on('open', function () {
        var br = browserify();
        br.add(publicSrc);
        b = br.bundle();
        b.pipe(w);
        b.on('end', function () {
            w.end();
            done();
        });
    });
    w.on('error', function(error) {
        console.log(error);
        done();
    });
});

gulp.task('default', function () {
    gulp.src(cffeeSrc)
        .pipe(cs())
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    gulp.watch(cffeeSrc, ['default']);
    gulp.watch(publicSrc, ['browserify']);
});
