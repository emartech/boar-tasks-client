'use strict';

var extend = require('deep-extend');
var config = require('./tasks/config');
var revision = require('./lib/revision');

var clientTasks = require('./tasks/client');
var serverTasks = require('./tasks/server');
var e2eTasks = require('./tasks/e2e');
var buildTasks = require('./tasks/build');
var packageTasks = require('./tasks/package');
var s3Tasks = require('./tasks/s3');
var redirectorTasks = require('./tasks/redirector');

var defaultKarmaConfig = require('./karma.conf.js');


module.exports.getKarmaConfig = function(customConfig) {
  var finalConfig = extend(config, customConfig);
  return defaultKarmaConfig(finalConfig);
};


module.exports.getTasks = function(gulp, customConfig) {
  var finalConfig = extend(config, customConfig);

  return {
    config: finalConfig,
    client: clientTasks(gulp, finalConfig),
    server: serverTasks(gulp, finalConfig),
    e2e: e2eTasks(gulp, finalConfig),
    build: buildTasks(gulp, finalConfig),
    package: packageTasks(gulp, finalConfig),
    s3: s3Tasks(gulp, finalConfig),
    redirector: redirectorTasks(gulp, finalConfig)
  };
};

module.exports.lib = {
  revision: revision
};
