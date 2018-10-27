'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

var _yargs = _interopRequireDefault(require('yargs'));

var _new = require('./commands/new');

var _generate = require('./commands/generate');

var _package = require('../package.json');

try {
  _yargs.default
    .usage('\n wxa <command> [args]')
    .command({
      command: 'new <projectname> [tplpath]',
      builder: _new.newBuilder,
      handler: _new.newHandler,
      desc: 'new a wxapp project',
    })
    .command({
      command: 'generate [type] [name]',
      aliases: ['g', 'gen'],
      builder: _generate.generateBuilder,
      handler: _generate.generateHandler,
      desc: 'generate a new page/subPage/component',
    })
    .alias('h', 'help')
    .alias('v', 'version')
    .help()
    .version(_package.version).argv;
} catch (error) {
  console.error('[错误]', error.message);
}
