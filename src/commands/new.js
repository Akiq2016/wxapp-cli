import { resolve, join } from 'path';
import mkdirp from 'mkdirp';
import inquirer from 'inquirer';
import {
  copySync,
  existsSync,
  writeFileSync,
  closeSync,
  openSync,
  ensureFileSync,
} from 'fs-extra';
import { execSync } from 'child_process';
import config, { TPLS } from '../config';
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

const completeOptionalPositional = async argv => {
  const res = {};

  // get project name
  if (!argv.projectname) {
    const { projectname } = await inquirer.prompt([
      {
        name: 'projectname',
        message: 'What name would you like to use for the project?',
        validate: val => {
          if (!val || /[^\w]/.test(val)) {
            return 'project name available input: [A-Za-z0-9_]';
          }

          return true;
        },
      },
    ]);

    res.projectname = projectname;
  }

  return res;
};
// This function is executed with a yargs instance,
// and can be used to provide advanced command specific help:
export const newBuilder = yargs => {
  yargs
    .usage('\n wxa new [projectname] [templaterepo]')
    .positional('projectname', {
      describe: '📓 Your project name',
    })
    .positional('templaterepo', {
      describe: '📒 Git repository or local directory',
    })
    .options({
      y: {
        alias: 'yes',
        desc: 'Use default setting',
        type: 'boolean',
      },
    })
    .help().argv;
};

// handler function, which will be executed with the parsed argv object:
export const newHandler = async argv => {
  Object.assign(argv, await completeOptionalPositional(argv));

  let options;

  // initial project dir
  argv.projectDir = getProjectDir(argv.projectname);
  if (!existsSync(argv.projectDir)) {
    mkdirp.sync(argv.projectDir);
  } else {
    consoleErr(`${argv.projectDir} already existed`);
    delete argv.projectDir;
    return;
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
      const projectTplPath = options.templaterepo || config.projectTplPath;
      // todo: warning Config file was not found
      // todo: if using default project template
      // some dirs' files need to be selected by user, the others can be output directly
      execSync(
        `${join(
          __dirname,
          '..',
          '..',
          'node_modules/.bin/sao'
        )} ${projectTplPath} --clone=false`,
        { stdio: [0, 1, 2] }
      );

      // 2. initial page/spage/cpn's templates: using custom tpl > using default tpl
      // todo: custom template
      try {
        const tplDir = existsSync(config.customConfigDir)
          ? config.customConfigDir
          : null;
        generateTpls(options, tplDir);
      } catch (error) {
        consoleErr(error);
        return;
      }

      // 3. save user project setting to wxa.config.js
      generateWxaConfig(options);

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

function generateTpls(options, tplDir) {
  const dirPathDict = ['component', 'page'].reduce(
    (acc, key) => ({
      ...acc,
      [key]: [options.scripts, options.style, 'json', 'wxml'].map(
        (ext, index) => {
          const path = tplDir ? join(tplDir, key, `template.${ext}`) : null;

          return {
            path: path && existsSync(path) ? path : null,
            folder: key,
            ext,
            type: index === 0 ? 'scripts' : index === 1 ? 'style' : null,
          };
        }
      ),
    }),
    {}
  );

  Object.keys(dirPathDict).forEach(key => {
    const items = dirPathDict[key];

    items.forEach(item => {
      if (item.path) {
        copySync(item.path, join(options.projectDir, '.templates', folder));
      } else {
        const dirPath = join(
          options.projectDir,
          '.templates',
          item.folder,
          `template.${item.ext}`
        );

        if (item.ext === 'json' || item.type === 'scripts') {
          ensureFileSync(dirPath);
          writeFileSync(
            dirPath,
            TPLS[`${item.folder}${item.ext === 'json' ? 'json' : 'scripts'}`]
          );
        } else if (item.ext === 'wxml' || item.type === 'style') {
          closeSync(openSync(dirPath, 'w'));
        }
      }
    });
  });
}

function generateWxaConfig(options) {
  const requiredFields = [
    'projectname',
    'projectDir',
    'pkg',
    'scripts',
    'style',
  ];
  const res = requiredFields.reduce(
    (acc, v) => ({
      ...acc,
      [v]: options[v],
    }),
    {}
  );

  writeFileSync(
    join(options.projectDir, 'wxa.config.js'),
    `module.exports = ${JSON.stringify(res, null, 2)};\n`
  );
}
