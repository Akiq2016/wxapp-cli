import { resolve, join } from 'path';
import mkdirp from 'mkdirp';
import inquirer from 'inquirer';
import { copySync, existsSync, writeFileSync } from 'fs-extra';
import { execSync } from 'child_process';
import config from '../config';
import { consoleErr, consoleWarn } from '../utils';

const cwd = process.cwd();

const getProjectDir = dir => resolve(cwd, dir);

const getNewPromptItems = _ => [
  {
    type: 'list',
    name: 'pkg',
    message: 'Select your package manager:',
    default: 0,
    choices: config.createdChoicesDict['pkg'],
  },
  {
    type: 'list',
    name: 'scripts',
    message: 'Select your project script type:',
    default: 0,
    choices: config.createdChoicesDict['scripts'],
    filter: config.createdChoicesFilterDict['scripts'],
  },
  {
    type: 'list',
    name: 'style',
    message: 'Select your project CSS pre-processor:',
    default: 0,
    choices: config.createdChoicesDict['style'],
    filter: config.createdChoicesFilterDict['style'],
  },
];

// This function is executed with a yargs instance,
// and can be used to provide advanced command specific help:
export const newBuilder = yargs => {
  yargs
    .usage('\n wxa new [args]')
    .options({
      y: {
        alias: 'yes',
        desc: 'use default setting',
        type: 'boolean',
      },
    })
    .help().argv;
};

// handler function, which will be executed with the parsed argv object:
export const newHandler = async argv => {
  let options;

  // initial project dir
  if (argv.projectname) {
    argv.projectDir = getProjectDir(argv.projectname);

    if (!existsSync(argv.projectDir)) {
      mkdirp.sync(argv.projectDir);
    } else {
      consoleErr(`${argv.projectDir} already existed`);
      delete argv.projectDir;
      return;
    }
  }

  // get options
  if (argv.y) {
    options = Object.assign(argv, config.defaultChoiceDict);
  } else {
    options = Object.assign(
      argv,
      await inquirer.prompt(getNewPromptItems(argv))
    );
  }

  // todo: [debug mode] start generate project by options
  console.log(options);

  try {
    await newProject(options);
  } catch (error) {
    consoleErr(error);
    process.exit(1);
  }
};

export function newProject(options) {
  return new Promise((resolve, reject) => {
    try {
      process.chdir(options.projectDir);

      // 1. generate project using projectTplPath
      const projectTplPath = options.tplpath || config.projectTplPath;
      // todo: warning Config file was not found
      // todo: if using default project template
      // some dirs' files need to be selected by user, the others can be output directly
      execSync(`sao ${projectTplPath} --clone`, { stdio: [0, 1, 2] });

      // 2. initial page/spage/cpn's templates: using custom tpl > using default tpl
      // todo: template files ext should use user config
      try {
        const defaultTplDir = join(__dirname, '..', 'templates');
        const tplDir = existsSync(config.customConfigDir)
          ? config.customConfigDir
          : defaultTplDir;

        copySync(tplDir, join(options.projectDir, '.templates'));

        // check page template
        if (!existsSync(join(tplDir, 'page'))) {
          copySync(
            join(defaultTplDir, 'page'),
            join(options.projectDir, '.templates/page')
          );
        }

        // check component template
        if (!existsSync(join(tplDir, 'component'))) {
          copySync(
            join(defaultTplDir, 'component'),
            join(options.projectDir, '.templates/component')
          );
        }
      } catch (error) {
        consoleErr(error);
        return;
      }

      // 3. save user project setting to wxa.config.js
      writeFileSync(
        join(options.projectDir, 'wxa.config.js'),
        `module.exports = ${JSON.stringify(options, null, 2)};\n`
      );

      // todo 4. generate webpack config and package.json
      const installCmd = options.pkg === 'npm' ? 'npm install' : 'yarn';
      try {
        // todo: https://github.com/angular/angular-cli/blob/master/packages/angular/cli/tasks/npm-install.ts
        execSync(installCmd, { stdio: [0, 1, 2] });
      } catch (e) {
        consoleWarn(`${installCmd} has failed, you can run it youself later.`);
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
