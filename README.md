# Boar Tasks for client side

[![npm version](https://badge.fury.io/js/boar-tasks-client.svg)](http://badge.fury.io/js/boar-tasks-client)
[![Dependency Status](https://david-dm.org/emartech/boar-tasks-client.svg)](https://david-dm.org/emartech/boar-tasks-client)
[![devDependency Status](https://david-dm.org/emartech/boar-tasks-client/dev-status.svg)](https://david-dm.org/emartech/boar-tasks-client#info=devDependencies)

This repository contains Gulp-based tasks to make client-side applications easier. It can be used with any client side framework which
 supports the CommonJS or AMD pattern.

These tasks are helpers, you have to define your build tasks in your project's `gulpfile.js`. You can find examples in our existing services or workshop material.

Usually we create a `tasks.config.js` file which is for override the default task settings.

### Sample config file

```javascript
// tasks.config.js

module.exports = {
  staticServer: {
    port: 8081
  },

  client: {
    app: {
      buildPattern: 'client/app/app.js',
      testPattern: 'client/app/**/*.spec.js'
    },
    stylesheets: {
      buildPattern: 'client/stylesheets/app.styl'
    }
  }
};
```

### Sample gulpfile

```javascript
// gulpfile.js

let gulp = require('gulp');
let runSequence = require('run-sequence');

let config = require('./tasks.config.js');
let tasks = require('boar-tasks-client').getTasks(gulp, config);

gulp.task('build', function(cb) {
  runSequence('build-clean', 'client-build', cb);
});

gulp.task('start', ['build'], function() {
  gulp.run('server');
  gulp.run('assets-watch');
  gulp.run('client-watch');
});

gulp.task('test', tasks.client.test);
gulp.task('code-style', ['client-jscs', 'check-tests', 'check-logs']);
gulp.task('build-clean', tasks.build.clean);
gulp.task('server', tasks.client.staticServer);
gulp.task('client-build', tasks.client.buildScripts);
gulp.task('client-watch', tasks.client.buildScriptsDenyErrors);
gulp.task('reload-static-server', tasks.client.reloadStaticServer);
gulp.task('assets-watch', function() {
  gulp.watch('dist/**/*', ['reload-static-server']);
});

```

## Available tasks

### Build tasks

#### Clean
It is used to remove files from the build target directory.

#### Deploy
Pushes the current codebase to the production branch. Usually it initiate a deploying process.

### Redirector tasks

#### Save
Saves the given revision to the Emarsys Redirector service - allowing to control user caches above Amazon S3 and Cloudfront.

*Default configuration*

```javascript
Config.redirector = {
  url: argv.redirectorUrl || process.env.REDIRECTOR_URL,
  name: argv.redirectorName || process.env.REDIRECTOR_NAME,
  target: argv.redirectorTarget || process.env.REDIRECTOR_TARGET,
  apiSecret: argv.redirectorApiSecret || process.env.REDIRECTOR_API_SECRET
};
```

*Usage*

```javascript
gulp.task('publish-redirector', tasks.redirector.save);

// Revision can be calculated before the task run
gulp.task('publish-redirector', function() { return tasks.redirector.save('myLatestRevision'); });
```

### S3 tasks

#### Publish
It gzip the current codebase and pushes to Amazon S3

*Default configuration*

```javascript
Config.s3 = {
  copyPattern: 'dist/**/*',
  bucket: argv.s3Bucket || process.env.S3_BUCKET,
  withGzip: true,
  headers: {
    'Cache-Control': 'max-age=315360000, no-transform, public',
    'x-amz-acl': 'bucket-owner-full-control'
  }
};
```

*Usage*

```javascript
gulp.task('publish-s3', tasks.s3.publish);
```

### Client tasks

#### Copy static
Copy static files into the `dist` folder.

*Default configuration*

```javascript
Config.client = {
  static: {
    copyPattern: 'client/static/**/*',
    target: Config.build.assetsPath
  }
}
```

*Usage*

```javascript
gulp.task('client-build-static', tasks.client.copyStatic);
```



#### Build stylesheets
Copying and pre-processing stylesheets using stylus.

*Default configuration*

```javascript
Config.client = {
  stylesheets: {
    buildPattern: 'client/stylesheets/*.styl',
    watchPattern: 'client/stylesheets/**/*',
    target: Config.build.assetsPath + 'stylesheets/',
    plugins: [],
    includeCSS: true,
    autoprefixer: {
      browsers: ['ie 9', 'ie 10', 'last 2 versions'],
      cascade: false
    }
  }
}
```

*Usage*

```javascript
gulp.task('client-build-stylesheets', tasks.client.buildStylesheets);
```



#### Build stylesheets with denying errors
It is the same as the `buildStylesheets` task but it is not exiting on stylesheet error. It is suggested to use for smooth development experience.

*Usage*

```javascript
gulp.task('client-build-stylesheets-continously', tasks.client.buildStylesheetsDenyErrors);
```



#### Build scripts
It is used to build JavaScript files. It uses Webpack and Babel to compile ES6 code to ES5. Finally it creates a single JavaScript file with all of required files.

*Default configuration*

```javascript
Config.client = {
  app: {
    path: 'client/app/',
    extensions: ['.js'],
    buildPattern: 'client/app/!(*.spec).js',
    testPattern: 'client/app/**/*.spec.js',
    testModules: [],
    watchPattern: 'client/app/**/*',
    viewPattern: 'client/app/views/**/*.jade',
    vendorPattern: 'client/vendors.js',
    target: Config.build.assetsPath + 'scripts/',
    vendors: [],
    codeStylePattern: 'client/app/**/*.js',
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: /(node_modules)/ },
      { test: /\.jade$/, loader: 'jade-loader?self' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
}
```

*Usage*

```javascript
gulp.task('client-build-scripts', tasks.client.buildScripts);
```



#### Build scripts with denying errors
It is the same as the `buildScripts` task but it is not exiting on script compilation error. It is suggested to use for smooth development experience.

*Usage*

```javascript
gulp.task('client-build-scripts-continously', tasks.client.buildScriptsDenyErrors);
```



#### Concatenate vendors
It concatenates all of the listed vendor files and create a `vendors.js` on the `client.app.target` path from the configuration.

*Default configuration*

```javascript
Config.client = {
  app: {
    target: Config.build.assetsPath + 'scripts/',
  }
  vendors: []
}
```

*Usage*

```javascript
gulp.task('client-concat-vendors', tasks.client.concatVendors);
```



#### Building an app with multiple entry points

If you have an app with multiple entry points, you can configure `buildPattern` as an array of strings.

```javascript
Config.client = {
  app: {
    buildPattern: [
      'client/app/!(*.spec).js',
      'other/dir/!(*.spec).js'
    ]
  }
};
```

If you have entry points used somewhere else where `vendors.js` is not available - eg. a web worker -, you can configure `buildPattern` to build those entry points with the webpack module loading logic included.

```javascript
Config.client = {
  app: {
    buildPattern: [
      'client/app/!(*.spec).js',
      {
        pattern: 'client/workers/!(*.spec).js',
        splitVendor: false
      }
    ]
  }
};
```




#### Test
Run all the tests found in the codebase using Karma.

*Default configuration*

```javascript
Config.client = {
  testConfigPath: process.cwd() + '/karma.conf.js'
}
```

*Usage*

```javascript
gulp.task('client-test', tasks.client.test);
```



#### Code style
Check code style using ESLint on the selected JavaScript files.

*Default configuration*

```javascript
Config.client = {
  app: {
    codeStylePattern: 'client/app/**/*.js'
  }
}
```

*Usage*

```javascript
gulp.task('client-codestyle', tasks.client.codeStyle);
```



#### Stylesheets code style
Check code style on the selected stylesheets using Stylint.

*Default configuration*

```javascript
Config.client = {
  stylesheets: {
    codeStyle: {
      pattern: 'client/stylesheets/**/*.styl',
      config: {
        rules: {
          depthLimit: 3,
          efficient: false,
          indentPref: 2,
          namingConvention: 'lowercase-dash',
          noImportant: true,
          quotePref: 'double',
          sortOrder: 'alphabetical',
          valid: false
        }
      }
    }
  }
}
```

*Usage*

```javascript
gulp.task('client-stylesheet-codestyle', tasks.client.stylesheetCodeStyle);
```



#### Jade code style
Check code style on the selected jade files using jade-lint.

*Default configuration*

```javascript
Config.client = {
  app: {
    jadeCodeStylePattern: 'client/app/**/*.jade'
  }
}
```

*Code style rules*

Install `jade-lint-config-emarsys` to your project and create a file in your project's root called `.jade-lintrc` with the following content:

```
{
  "extends": "emarsys"
}
```

*Usage*

```javascript
gulp.task('client-jade-code-style', tasks.client.jadeCodeStyle);
```



#### Dummy server to provide assets
It is for development purposes - serving static asset files.

*Default configuration*

```javascript
Config.staticServer = {
  port: process.env.PORT || 8080
};
```

*Usage*

```javascript
gulp.task('client-static-server', tasks.client.staticServer);

// It can be reloaded with reloadStaticServer
gulp.task('reload-static-server', tasks.client.reloadStaticServer);
```
