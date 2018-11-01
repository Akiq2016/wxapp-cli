'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

var _yargs = _interopRequireDefault(require('yargs'));

var _new = require('./commands/new');

var _generate = require('./commands/generate');

var _package = require('../package.json');

var _utils = require('./utils');

try {
  _yargs.default
    .usage('\n wxa <command> [args]')
    .command({
      command: 'new [projectname] [templaterepo]',
      builder: _new.newBuilder,
      handler: _new.newHandler,
      desc: '🍎 New a mini program project',
    })
    .command({
      command: 'gen [type] [name] [root]',
      aliases: ['g', 'generate'],
      builder: _generate.generateBuilder,
      handler: _generate.generateHandler,
      desc: '🍐 Generate specific type files.',
    })
    .demandCommand()
    .alias('h', 'help')
    .alias('v', 'version')
    .help()
    .version(_package.version).argv;
} catch (error) {
  (0, _utils.consoleErr)(error.message);
}
