'use strict';

module.exports = function(gulp, config) {
  return {
    publish: function(revision) {
      var Revision = require('../lib/revision');
      var argv = require('yargs').argv;
      var awsPublish = require('gulp-awspublish');

      if (!revision) {
        revision = Revision.get(config.revision.type);
      }

      var publisher = awsPublish.create({
        params: {
          Bucket: config.s3.bucket
        },
        logger: argv.production ? null : console
      });

      var rename = require('gulp-rename');

      var stream = gulp.src(config.s3.copyPattern)
        .pipe(rename(function(path) {
          path.dirname = '/' + revision + '/' + path.dirname;
          return path;
        }));

      if (config.s3.withGzip) {
        var gzipStream = stream
          .pipe(require('gulp-clone')())
          .pipe(awsPublish.gzip({ ext: '.gz' }));

        stream = require('event-stream').merge(stream, gzipStream);
      }

      var parallelize = require('concurrent-transform');

      return stream
        .pipe(parallelize(publisher.publish(config.s3.headers), 10))
        .pipe(awsPublish.reporter());
    }
  };
};
