'use strict';

var webpack = require('webpack');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

var WebpackCompiler = function(webpackConfig) {
  EventEmitter.call(this);
  this._config = webpackConfig;
};

util.inherits(WebpackCompiler, EventEmitter);

WebpackCompiler.prototype = _.extend(WebpackCompiler.prototype, {

  addProductionPlugins: function() {
    this._config.plugins.push(new webpack.optimize.DedupePlugin());
    var uglifyJsOptions = {
      minimize: true,
      mangle: false
    };
    this._config.plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyJsOptions));
  },


  buildOnce: function() {
    this._compiler().run(this._afterBuild.bind(this));
  },


  buildContinuously: function() {
    this._compiler().watch({ aggregateTimeout: 300, poll: true }, this._afterBuild.bind(this));
  },


  _afterBuild: function(err, stats) {
    if (err) return this.emit('error', [err]);
    stats = stats.toJson();
    if (stats.errors.length > 0) return this.emit('error', stats.errors);
    this.emit('success', stats);
  },


  _compiler: function() {
    return webpack(this._config);
  }


});





module.exports = WebpackCompiler;
