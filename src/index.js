import yargs from 'yargs';
import { createBuilder, createHandler } from './commands/create';
import { version } from '../package.json';

try {
    yargs
        .usage('\n wxa <command> [args]')
        .command({
            command: 'create',
            builder: createBuilder,
            handler: createHandler,
            desc: 'create a new wxapp project'
        })
        .alias('h', 'help')
        .alias('v', 'version')
        .help()
        .version(version)
        .argv
} catch (error) {
    console.error('[错误]', error.message)
}
