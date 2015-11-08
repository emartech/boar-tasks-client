var argv = require('yargs').argv;

var Config = {};

Config.package = {
  path: process.cwd()
};

Config.build = {
  distPath: 'dist/',
  assetsPath: 'dist/assets/'
};

Config.e2e = {
  configPath: process.cwd() + '/protractor.conf.js'
};

Config.server = {
  path: 'server/',
  runnable: Config.build.distPath + 'server.js',
  filePattern: ['server/**/!(*.spec).{jade,js}', 'package.json'],
  watchPattern: 'server/**/*.js',
  environmentVariables: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_ROOT_PATH: process.cwd() + '/' + Config.build.distPath,
    IP: process.env.IP || undefined,
    PORT: process.env.PORT || 9100,
    BASE_URL: process.env.BASE_URL || 'http://localhost:9100'
  },
  test: {
    requires: ['co-mocha'],
    flags: ['reporter dot', 'harmony', 'colors'],
    environmentVariables: {
      NODE_ENV: process.env.NODE_ENV || 'test',
      APP_ROOT_PATH: process.cwd() + '/' + Config.build.distPath
    }
  },
  codeStylePattern: 'server/**/*.js'
};

Config.client = {
  testConfigPath: process.cwd() + '/karma.conf.js',
  externalSourceMap: true,

  'static': {
    copyPattern: 'client/static/**/*',
    watchPattern: 'client/static/**/*',
    target: Config.build.assetsPath
  },
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
    loaders: []
  },
  stylesheets: {
    buildPattern: 'client/stylesheets/*.styl',
    watchPattern: 'client/stylesheets/**/*',
    target: Config.build.assetsPath + 'stylesheets/',
    plugins: [],
    includeCSS: true,
    autoprefixer: {
      browsers: ['ie 9', 'ie 10', 'last 2 versions'],
      cascade: false
    },
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
  },
  vendors: []
};

Config.s3 = {
  copyPattern: 'dist/**/*',
  bucket: argv.s3Bucket || process.env.S3_BUCKET,
  withGzip: true,
  headers: {
    'Cache-Control': 'max-age=315360000, no-transform, public',
    'x-amz-acl': 'bucket-owner-full-control'
  }
};

Config.redirector = {
  url: argv.redirectorUrl || process.env.REDIRECTOR_URL,
  name: argv.redirectorName || process.env.REDIRECTOR_NAME,
  target: argv.redirectorTarget || process.env.REDIRECTOR_TARGET,
  apiSecret: argv.redirectorApiSecret || process.env.REDIRECTOR_API_SECRET
};

Config.revision = {
  /**
   * Generating a revision can be a type of 'timestamp', 'package' or can be set by --revision argument.
   */
  type: 'timestamp'
};

module.exports = Config;
