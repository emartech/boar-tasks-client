'use strict';

module.exports = function (gulp, config) {

  return {

    clean: function (cb) {
      require('del')([config.build.distPath + '**/*'], cb);
    },

    deploy: function() {
      var prompt = require('gulp-prompt');
      var exec = require('gulp-exec');

      return gulp.src('gulpfile.js')
        .pipe(prompt.confirm({
          message: 'Do you really want to deploy to production?',
          default: false
        }))
        .pipe(exec('git pull origin master; git push origin master;git push origin master:production'))
        .pipe(exec.reporter({ err: true, stderr: true, stdout: true }));
    }

  };

};
