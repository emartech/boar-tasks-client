var argv = require('yargs').argv;

var Config = {};

Config.package = {
  path: process.cwd()
};

Config.build = {
  assetsPath: 'dist/'
};

Config.staticServer = {
  port: process.env.PORT || 8080
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
    jadeCodeStylePattern: 'client/app/**/*.jade',
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: /(node_modules)/ },
      { test: /\.jade$/, loader: 'jade-loader?self' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
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
