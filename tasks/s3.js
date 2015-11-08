'use strict';

var awsPublish = require('gulp-awspublish');
var rename = require('gulp-rename');
var parallelize = require('concurrent-transform');
var argv = require('yargs').argv;
var clone = require('gulp-clone');
var es = require('event-stream');
var Revision = require('../lib/revision');

module.exports = function(gulp, config) {
  return {
    publish: function(revision) {
      if (!revision) {
        revision = Revision.get(config.revision.type);
      }

      var publisher = awsPublish.create({
        params: {
          Bucket: config.s3.bucket
        },
        logger: argv.production ? null : console
      });

      var stream = gulp.src(config.s3.copyPattern)
        .pipe(rename(function(path) {
          path.dirname = '/' + revision + '/' + path.dirname;
          return path;
        }));

      if (config.s3.withGzip) {
        var gzipStream = stream
          .pipe(clone())
          .pipe(awsPublish.gzip({ ext: '.gz' }));

        stream = es.merge(stream, gzipStream);
      }

      return stream
        .pipe(parallelize(publisher.publish(config.s3.headers), 10))
        .pipe(awsPublish.reporter());
    }
  };
};
