import yargs from 'yargs';
import { newBuilder, newHandler } from './commands/new';
import { generateBuilder, generateHandler } from './commands/generate';
import { version } from '../package.json';

try {
  yargs
    .usage('\n wxa <command> [args]')
    .command({
      command: 'new',
      builder: newBuilder,
      handler: newHandler,
      desc: 'new a wxapp project',
    })
    .command({
      command: 'generate [name]',
      aliases: ['g', 'gen'],
      builder: generateBuilder,
      handler: generateHandler,
      desc: 'generate a new page/subPage/component',
    })
    .alias('h', 'help')
    .alias('v', 'version')
    .help()
    .version(version).argv;
} catch (error) {
  console.error('[错误]', error.message);
}
