'use strict';

var _ = require('lodash');

module.exports = function(config) {
  var defaults = {
    basePath: '',
    frameworks: ['mocha', 'sinon', 'sinon-chai'],
    exclude: [],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  };

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
  configHash.webpackMiddleware = { noInfo: true };

  configHash.plugins = [
    require('karma-webpack'),
    require('karma-mocha'),
    require('karma-sinon'),
    require('karma-sinon-chai'),
    require('karma-phantomjs-launcher')
  ];

  if (config.client.app.testWithCoverage === true) {
    configHash.withCoverage = true;

    configHash.plugins = configHash.plugins.concat(['karma-coverage']);

    configHash.webpack.module.preLoaders = [
      {
        test: /\.js$/,
        exclude: /(node_modules|resources\/js\/vendor|spec)/,
        loader: 'istanbul-instrumenter'
      }
    ];

    defaults.reporters = defaults.reporters.concat(['coverage']);

    defaults.coverageReporter = {
      reporters: [
        {
          type: 'text-summary'
        },
        {
          type : 'html',
          dir : 'coverage/'
        }
      ]
    };

  }

  return _.extend({}, configHash, defaults);
};
