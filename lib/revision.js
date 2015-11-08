'use strict';

var argv = require('yargs').argv;

var storedRevision;

var Revision = {
  get: function(type) {
    if (argv.revision) return argv.revision;

    if (!storedRevision) {
      switch (type) {
        case 'package':
          storedRevision = require(process.cwd() + '/package.json').version;
          break;

        case 'timestamp':
        default:
          storedRevision = Math.round(Date.now() / 1000);
      }
    }

    return storedRevision;
  },

  set: function(newRevision) {
    storedRevision = newRevision;
  }
};


module.exports = Revision;
