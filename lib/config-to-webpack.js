'use strict';

var glob = require('glob');
var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');

module.exports = function(config) {
  var vendorChunk = 'vendors';
  var context = path.resolve(config.client.app.path);
  if (_.isString(config.client.app.buildPattern)) {
    config.client.app.buildPattern = [
      config.client.app.buildPattern
    ];
  }

  var entries = _.reduce(config.client.app.buildPattern, function(memo, ruleSet) {
    if (_.isString(ruleSet)) {
      ruleSet = {
        pattern: ruleSet,
        splitVendor: true
      };
    }

    _.forEach(glob.sync(ruleSet.pattern), function(file) {
      var filename = path.parse(file).name;

      memo.all[filename] = './' + path.relative(context, file);
      if (ruleSet.splitVendor) {
        memo.split.push(filename);
      }
    });

    return memo;
  }, {
    all: {},
    split: []
  });

  if (config.client.app.vendors && config.client.app.vendors.length) {
    entries.all[vendorChunk] = config.client.app.vendors;
  }

  var webpackConfig = {
    context: context,
    entry: entries.all,
    devtool: 'source-map',
    output: {
      path: config.client.app.target,
      filename: '[name].js'
    },
    module: {
      loaders: config.client.app.loaders
    },
    resolveLoader: {
      root: [ path.join(process.cwd(), 'node_modules') ]
    },
    plugins: []
  };

  if (config.client.app.vendors && config.client.app.vendors.length) {
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin(vendorChunk, 'vendors.js', entries.split)
    );
  }

  return webpackConfig;
};
