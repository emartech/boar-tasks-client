'use strict';

module.exports = function(gulp, config) {
  return {
    watch: function() {
      gulp.watch(config.package.path + '/package.json').on('change', this.install);
    },

    install: function() {
      console.log('Installing NPM packages');
      require('gulp-install')();
    }
  };
};
