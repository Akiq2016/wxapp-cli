import { join } from 'path';
import {
  existsSync,
  outputFileSync,
  readFileSync,
  writeFileSync,
} from 'fs-extra';
import inquirer from 'inquirer';
import { consoleErr, consoleCreate } from '../utils';

/**
 * give params to generate a files relative path (path.*)
 *
 * @param {string} type default type: page / component
 * @param {string} name relative / absolute path
 */
function getFilePathTpl(type, name) {
  if (name.startsWith('/')) {
    return `${name.slice(1)}.*`;
  } else {
    const paths = name.split('/').filter(t => !!t);
    return `${type}/${paths.join('/')}.*`;
  }
}

/**
 * write files
 *
 * @param {string[]} fileTypes default value: ['json', 'js', 'wxml', 'wxss']
 * @param {string} filePathTpl e.g. value: index.*
 * @param {string} cwd current exec root
 * @param {string} tplDirname get template from ./.template/${tplDirname}/
 */
function writeFiles({ fileTypes, filePathTpl, cwd, tplDirname }) {
  const path = join(cwd, 'src', filePathTpl);

  if (fileTypes.every(v => !existsSync(path.replace('*', v)))) {
    fileTypes.forEach(ext => {
      const fileTplt = readFileSync(
        `${cwd}/.templates/${tplDirname}/template.${ext}`,
        'utf8'
      );
      const destPath = path.replace('*', ext);
      outputFileSync(destPath, fileTplt);
      consoleCreate(`${join('src', filePathTpl).replace('*', ext)}`);
    });
  } else {
    consoleErr(`${path} already existed`);
  }
}

function writeAppJson({ type, cwd, filePathTpl, argv }) {
  const appJsonPath = `${cwd}/src/app.json`;
  const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  let value = filePathTpl.replace('.*', '');

  if (type === 'page') {
    if (!Array.isArray(appJson.pages)) {
      appJson.pages = [];
    }

    if (appJson.pages.indexOf(value) >= 0) {
      consoleErr(`${value} already in app.json pages property`);
      return;
    }

    appJson.pages.push(value);
    writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  } else if (type === 'subpage') {
    const root =
      argv.root.startsWith('/') || argv.name.startsWith('/')
        ? argv.root.startsWith('/')
          ? argv.root.slice(1)
          : argv.root
        : `pages/${argv.root}`;
    value = value.split(`${root}/`)[1];

    if (!Array.isArray(appJson.subPackages)) {
      appJson.subPackages = [];
    }

    const subPackage = appJson.subPackages.find(v => v.root === root);

    if (subPackage) {
      // check if is already in app.json
      if (Array.isArray(subPackage.pages)) {
        if (subPackage.pages.indexOf(value) !== -1) {
          consoleErr(`${value} already in app.json pages property`);
          return;
        }
      } else {
        subPackage.pages = [];
      }

      subPackage.pages.push(value);
    } else {
      appJson.subPackages.push({
        root: root,
        pages: [value],
      });
    }

    writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  }
}

function createPage({ cwd, argv, fileTypes }) {
  // get new page path
  const tplDirname = 'page';
  const filePathTpl = getFilePathTpl('pages', argv.name);

  // write files
  writeFiles({ fileTypes, filePathTpl, cwd, tplDirname });

  // update app.json
  writeAppJson({ type: 'page', cwd, filePathTpl });
}

function createSubPage({ cwd, argv, fileTypes }) {
  // get new subpage path
  let tplDirname = 'subpage';
  const filePathTpl = getFilePathTpl('pages', `${argv.name}`);

  if (!existsSync(`${cwd}/.templates/${tplDirname}`)) {
    tplDirname = 'page';
  }

  // write files
  writeFiles({ fileTypes, filePathTpl, cwd, tplDirname });

  // update app.json
  writeAppJson({ type: 'subpage', cwd, filePathTpl, argv });
}

function createComponent({ cwd, argv, fileTypes }) {
  // get new component path
  const tplDirname = 'component';
  const filePathTpl = getFilePathTpl('components', argv.name);

  // write files
  writeFiles({ fileTypes, filePathTpl, cwd, tplDirname });
}

const completeOptionalPositional = async argv => {
  const res = {};

  // get type
  if (!argv.type) {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type would you like to generate?',
        choices: ['page', 'subpackage', 'component'],
        filter: value => {
          return value === 'page'
            ? 'page'
            : value === 'subpackage'
              ? 'spage'
              : 'cpn';
        },
      },
    ]);

    res.type = type;
  }

  // get filename
  if (!argv.name) {
    const { name } = await inquirer.prompt([
      {
        name: 'name',
        message: 'What name would you like to use for the files?',
        validate: val => {
          if (!val || /[^\w/]/.test(val)) {
            return 'file name available input: [A-Za-z0-9_] or slash(/).';
          }

          return true;
        },
      },
    ]);

    res.name = name;
  }

  // get root if type is spage
  if ((argv.type === 'spage' || res.type === 'spage') && !argv.root) {
    const { root } = await inquirer.prompt([
      {
        name: 'root',
        message: 'What root would you like to use for the subpackage?',
        validate: val => {
          if (val.endsWith('/')) {
            return 'root should not end with slash(/)';
          }

          if (!val || /[^\w/]/.test(val)) {
            return 'root available input: [A-Za-z0-9_] or slash(/).';
          }

          return true;
        },
      },
    ]);

    res.root = root;
  }

  return res;
};

export const generateBuilder = yargs => {
  yargs
    .usage('\n wxa gen [type] [name] [root]')
    .positional('type', {
      describe: '📓 Type to generate. (Available choices: [page, spage, cpn])',
    })
    .positional('name', {
      describe: '📒 Name used for files. (Path can be included in the name)',
    })
    .positional('root', {
      describe:
        '📖 Root used for subpackage files. (Only available for [spage] type)',
    })
    .help().argv;
};

export const generateHandler = async argv => {
  const cwd = process.cwd();

  if (!existsSync(join(cwd, 'wxa.config.js'))) {
    consoleErr('Please run command at project root dir');
    return;
  }

  Object.assign(argv, await completeOptionalPositional(argv));

  // get user setting
  const config = require(`${cwd}/wxa.config.js`);
  const fileTypes = ['json', 'wxml', config.scripts, config.style];

  if (argv.type === 'page') {
    createPage({ cwd, argv, fileTypes });
  } else if (argv.type === 'spage') {
    createSubPage({ cwd, argv, fileTypes });
  } else if (argv.type === 'cpn') {
    createComponent({ cwd, argv, fileTypes });
  }
};
