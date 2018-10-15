import { resolve, join } from 'path';
import mkdirp from 'mkdirp';
import inquirer from 'inquirer';
import { copySync, existsSync, readFileSync, writeFileSync } from 'fs-extra';
import { template } from 'lodash';
import { execSync } from 'child_process';
import esformatter from 'esformatter';

const cwd = process.cwd();
let projectDir;

const getProjectDir = dir => resolve(cwd, dir);
// todo: configuration files
const presetDirs = ['bin', 'build', 'src'];

const getNewPromptItems = options => [
  // todo: custom webpack config, e.g. scripts/style
  {
    type: 'list',
    name: 'pkg',
    message: 'Select your package manager:',
    default: 0, // todo: store in a user config file
    choices: ['npm', 'yarn'],
  },
  {
    type: 'list',
    name: 'scripts',
    message: 'Select your project script type:',
    default: 0,
    choices: ['JavaScript', 'TypeScript'],
    filter: value => {
      return value === 'JavaScript' ? 'js' : 'ts';
    },
  },
  {
    type: 'list',
    name: 'style',
    message: 'Select your project CSS pre-processor:',
    default: 0,
    choices: ['scss', 'less', 'No thanks, I use wxss!'],
    filter: value => {
      return value === 'No thanks, I use wxss!' ? 'wxss' : value;
    },
  },
];

// This function is executed with a yargs instance,
// and can be used to provide advanced command specific help:
export const newBuilder = yargs => {
  yargs
    .usage('\n wxa new [args]')
    .options({
      yes: {
        alias: 'y',
        desc: 'use default setting',
        type: 'boolean',
      },
    })
    .help().argv;
};

// handler function, which will be executed with the parsed argv object:
export const newHandler = async argv => {
  let options;
  // todo quick generate project using default setting
  if (argv.y) {
  } else {
    options = Object.assign(
      argv,
      await inquirer.prompt(getNewPromptItems(argv))
    );
  }

  options.projectdir = projectDir;

  newProject(options);
};

export function newProject(options) {
  const projectName = options._[1];

  // get project name, mkdir this project, initial templates
  try {
    if (projectName) {
      projectDir = getProjectDir(projectName);

      if (!existsSync(projectDir)) {
        mkdirp.sync(projectDir);
      } else {
        projectDir = null;
        // todo: maybe should not throw error
        throw new Error(`[failed] ${projectDir} existed`);
      }

      // todo: global template dir < local template dir
      // todo: don't copy unuse template.
      // initial local templates store path
      copySync(
        join(__dirname, '..', 'templates'),
        join(projectDir, '.templates')
      );
    }
  } catch (error) {
    console.error(error);
    return;
  }

  // save user project setting
  writeFileSync(
    join(projectDir, 'wxa.config.js'),
    esformatter.format(`module.exports = ${JSON.stringify(options)};\n`)
  );

  // start creating project according to options
  const tplPkg = readFileSync(
    join(projectDir, '.templates/package.json'),
    'utf8'
  );

  // todo: add rules validation
  // todo: (the name of the package: String does not match the pattern of "^(?:@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$".)
  writeFileSync(
    join(projectDir, 'package.json'),
    template(tplPkg)({ projectName })
  );

  // copy files to project root dir
  copySync(join(projectDir, '.templates/projectcfg'), projectDir);

  // copy dirs to project root dir
  // todo: some dirs' files need to be selected by user, the others can be output directly
  // todo: only move component page (subpage) dir to .template
  // todo: template files ext should use user config
  presetDirs.forEach(dir => {
    copySync(join(projectDir, `.templates/${dir}`), join(projectDir, dir));
  });

  // todo: should put at the last step
  // todo: template should have yarn.lock or package.lock
  process.chdir(projectDir);
  const installCmd = options.pkg === 'npm' ? 'npm install' : 'yarn';
  try {
    // todo: https://github.com/angular/angular-cli/blob/master/packages/angular/cli/tasks/npm-install.ts
    execSync(installCmd, { stdio: [0, 1, 2] });
  } catch (e) {
    // todo: add chalk
    console.warn(`${installCmd} has failed, you can run it youself later.`);
  }
}
