import yargs from 'yargs';
import { newBuilder, newHandler } from './commands/new';
import { generateBuilder, generateHandler } from './commands/generate';
import { version } from '../package.json';
import { consoleErr } from './utils';

try {
  yargs
    .usage('\n wxa <command> [args]')
    .command({
      command: 'new [projectname] [templaterepo]',
      builder: newBuilder,
      handler: newHandler,
      desc: '🍎 New a mini program project',
    })
    .command({
      command: 'gen [type] [name] [root]',
      aliases: ['g', 'generate'],
      builder: generateBuilder,
      handler: generateHandler,
      desc: '🍐 Generate specific type files.',
    })
    .demandCommand()
    .alias('h', 'help')
    .alias('v', 'version')
    .help()
    .version(version).argv;
} catch (error) {
  consoleErr(error.message);
}
