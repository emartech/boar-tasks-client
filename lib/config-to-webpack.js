'use strict';

var glob = require('glob');
var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');

module.exports = function(config) {
  var vendorChunck = 'vendors';
  var context = path.resolve(config.client.app.path);

  var filesToEntries = function(files) {
    var entries = _.transform(files, function(entries, file) {
      entries[path.parse(file).name] = './' + path.relative(context, file);
    }, {});
    if (config.client.app.vendors && config.client.app.vendors.length) {
      entries[vendorChunck] = config.client.app.vendors;
    }
    return entries;
  };

  var webpackConfig = {
    context: context,
    entry: filesToEntries(glob.sync(config.client.app.buildPattern)),
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
      new webpack.optimize.CommonsChunkPlugin(vendorChunck, 'vendors.js')
    );
  }

  return webpackConfig;
};
