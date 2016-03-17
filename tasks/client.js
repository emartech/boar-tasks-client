'use strict';

var argv = require('yargs').argv;
var isProduction = argv.production;
var boarTasksCommon = require('boar-tasks-common');

module.exports = function (gulp, config) {

  var lintTasks = boarTasksCommon.lint(gulp);

  var tasks = {
    copyStatic: function() {
      var _ = require('lodash');

      var staticConfig = config.client.static;
      if (!_.isArray(staticConfig)) {
        staticConfig = [staticConfig];
      }

      _.each(staticConfig, function(config) {
        gulp.src(config.copyPattern)
          .pipe(gulp.dest(config.target));
      });

      return gulp;
    },

    buildStylesheets: function (runContinuously) {
      var gulpif = require('gulp-if');
      var stylus = require('gulp-stylus');
      var plumber = require('gulp-plumber');
      var sourcemaps = require('gulp-sourcemaps');
      var autoprefixer = require('gulp-autoprefixer');
      var notifier = require('node-notifier');
      var path = require('path');

      return gulp.src(config.client.stylesheets.buildPattern)
        .pipe(gulpif(runContinuously, plumber({
          errorHandler: function(error) {
            notifier.notify({
              title: error.name,
              message: error.message,
              icon: path.join(__dirname, "boar.png"),
              time: 8000
            });

            console.log(`[BOAR TASKS ERROR] ${error}\n\n`);
          }
        })))
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(stylus({
          use: config.client.stylesheets.plugins,
          compress: isProduction,
          'include css': config.client.stylesheets.includeCSS
        }))
        .on('error', function() {
          if (!runContinuously) {
            console.log('Error happened on compiling Stylus! Aborting...');
            process.exit(1);
          }
        })
        .pipe(gulpif(
          config.client.stylesheets.autoprefixer,
          autoprefixer(config.client.stylesheets.autoprefixer)
        ))
        .pipe(gulpif(
          !isProduction,
          sourcemaps.write(config.client.externalSourceMap ? '.' : null)
        ))
        .pipe(plumber.stop())
        .pipe(gulp.dest(config.client.stylesheets.target));
    },

    buildStylesheetsDenyErrors: function () {
      return this.buildStylesheets(true);
    },

    buildScripts: function (cb, runContinuously) {
      var path = require('path');
      var gutil = require('gulp-util');
      var notifier = require('node-notifier');
      var configToWebpack = require('../lib/config-to-webpack');
      var WebpackCompiler = require('../lib/webpack-compiler');

      var compiler = new WebpackCompiler(configToWebpack(config));
      if (isProduction) compiler.addProductionPlugins();
      compiler.on('success', function() {
        gutil.log("webpack:build");
        notifier.notify({
          title: 'Boar tasks',
          message: 'Scripts regenerated',
          icon: path.join(__dirname, "boar.png"),
          timeout: 2000
        });
        if (!runContinuously) cb();
      });
      compiler.on('error', function(errors) {
        notifier.notify({
          title: errors.length + ' Boar tasks error',
          message: errors[0].toString().substr(-75),
          icon: path.join(__dirname, "boar.png"),
          time: 8000
        });
        errors.forEach(function(error) {
          console.log(`[BOAR TASKS ERROR] ${error}\n\n`);
        });
        if (!runContinuously) {
          throw new gutil.PluginError("webpack:build", errors[0]);
        }
      });
      runContinuously ? compiler.buildContinuously() : compiler.buildOnce();
    },

    buildScriptsDenyErrors: function (cb) {
      return tasks.buildScripts(cb, true);
    },

    concatVendors: function () {
      var gulpif = require('gulp-if');
      var plumber = require('gulp-plumber');
      var uglify = require('gulp-uglify');
      var concat = require('gulp-concat');
      var gStreamify = require('gulp-streamify');

      return gulp.src(config.client.vendors)
        .pipe(plumber())
        .pipe(concat('vendors.js'))
        .pipe(gulpif(isProduction, gStreamify(uglify({mangle: false}))))
        .pipe(gulp.dest(config.client.app.target));
    },

    test: function (done) {
      return tasks._test(done, false);
    },

    coverage: function (done) {
      return tasks._test(done, true);
    },

    _test: function (done, withCoverage) {
      config.client.app.testWithCoverage = withCoverage;
      var KarmaServer = require('karma').Server;

      var server = new KarmaServer({
        configFile: config.client.testConfigPath,
        singleRun: true
      }, done);
      server.start();
    },

    codeStyle: function() {
      return lintTasks.scripts(config.client.app.codeStylePattern);
    },

    stylesheetCodeStyle: function() {
      return lintTasks.stylesheets(config.client.stylesheets.codeStyle.pattern,
        config.client.stylesheets.codeStyle.config);
    },

    templateCodeStyle: function() {
      return lintTasks.templates(config.client.app.templateCodeStylePattern);
    },

    staticServer: function() {
      var httpPort = parseInt(config.staticServer.port);
      var root = config.build.distPath;

      this._startHTTPServer(httpPort, root);

      if (process.env.SERVE_HTTPS === 'true') {
        var httpsPort = httpPort + 10000;
        this._startHTTPSServer(httpsPort, root);
      }
    },

    _startHTTPServer: function(port, root) {
      var connect = require('gulp-connect');
      connect.server({ port: port, root: root });
    },

    _startHTTPSServer: function(port, root) {
      var fs = require('fs');
      var connect = require('gulp-connect');

      var httpsOptions = true;
      if (process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
        httpsOptions = {
          key: fs.readFileSync(process.env.HTTPS_KEY),
          cert: fs.readFileSync(process.env.HTTPS_CERT)
        }
      }

      connect.server({
        port: port,
        root: root,
        https: httpsOptions
      });
    },

    reloadStaticServer: function() {
      var connect = require('gulp-connect');

      return connect.reload();
    }
  };

  return tasks;
};
