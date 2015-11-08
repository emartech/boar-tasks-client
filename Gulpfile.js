var gulp = require('gulp');
var tasks = require('./index').getTasks(gulp, {});

gulp.task('publish', ['publish-s3', 'publish-redirector']);
gulp.task('publish-s3', function() { return tasks.s3.publish(); });
gulp.task('publish-redirector', function() { return tasks.redirector.save(); });
