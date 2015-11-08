'use strict';

var _ = require('lodash');

module.exports = function(config) {
  var configHash = {
    files: []
      .concat(config.client.app.testModules)
      .concat(config.client.vendors)
      .concat([config.client.app.testPattern]),
    preprocessors: {}
  };

  configHash.preprocessors[config.client.app.testPattern] = ['webpack'];
  configHash.webpack = {
    module: {
      loaders: config.client.app.loaders
    }
  };

  configHash.plugins = [
    require('karma-webpack'),
    require('karma-mocha'),
    require('karma-sinon'),
    require('karma-sinon-chai'),
    require('karma-phantomjs-launcher')
  ];

  return _.extend({}, configHash, {
    basePath: '',
    frameworks: ['mocha', 'sinon', 'sinon-chai'],
    exclude: [],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });

};
