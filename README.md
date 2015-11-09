# Boar Tasks for Client side
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

*Configuration*

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

#### S3 tasks

#### Publish
It gzip the current codebase and pushes to Amazon S3

*Configuration*

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








