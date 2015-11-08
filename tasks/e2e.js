'use strict';

var protractorHelper = require('gulp-protractor');
var path = require('path');
var child_process = require('child_process');
var forever = require('forever');

function getProtractorBinary(binaryName){
    var winExt = /^win/.test(process.platform)? '.cmd' : '';
    var pkgPath = require.resolve('protractor');
    var protractorDir = path.resolve(path.join(path.dirname(pkgPath), '..', 'bin'));
    return path.join(protractorDir, '/'+binaryName+winExt);
}

module.exports = function (gulp, config) {
  var monitor;

  return {

    test: function(done) {
      child_process.spawn(getProtractorBinary('protractor'), [config.e2e.configPath], {
          stdio: 'inherit'
      }).once('close', done);
    },

    updateWebDriver: function (done) {
      protractorHelper.webdriver_update(done);
    },

    startServer: function(done) {
      monitor = forever.start(config.server.runnable, {env: config.server.environmentVariables});
      monitor.on('start', function () {
        forever.startServer(monitor);
        done();
      });
    },

    stopServer: function(done) {
      if (!monitor) {
        done();
        return;
      }

      monitor.removeAllListeners('exit:code');
      var ending = forever.stop(monitor.childData.pid);
      ending.on('stop', function() {
        monitor = null;
        done();
      })
    }
  };
};
