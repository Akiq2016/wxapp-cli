import { join } from 'path';
import {
  existsSync,
  outputFileSync,
  readFileSync,
  writeFileSync,
} from 'fs-extra';

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
 * @param {string} filePathTpl default value: index.*
 * @param {string} cwd current exec root
 * @param {string} tplDirname get template from ./.template/${tplDirname}/
 */
function writeFiles({ fileTypes, filePathTpl, cwd, tplDirname }) {
  filePathTpl = join(cwd, 'src', filePathTpl);

  if (fileTypes.every(v => !existsSync(filePathTpl.replace('*', v)))) {
    fileTypes.forEach(ext => {
      const fileTplt = readFileSync(
        `${cwd}/.templates/${tplDirname}/template.${ext}`,
        'utf8'
      );
      const destPath = filePathTpl.replace('*', ext);
      outputFileSync(destPath, fileTplt);
      console.log(`[ok] generate ${destPath}`);
    });
  } else {
    console.error(`[error] ${filePathTpl} already existed`);
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
      console.log(`${value} already in app.json pages property`);
      return;
    }

    appJson.pages.push(value);
    writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  } else if (type === 'subpage') {
    const root = argv.root.startsWith('/')
      ? argv.root.slice(1)
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
          console.log(`${value} already in app.json pages property`);
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
  const filePathTpl = getFilePathTpl('pages', `${argv.root}/${argv.name}`);

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

export const generateBuilder = yargs => {
  yargs
    .default({
      type: 'page',
      name: 'index',
    })
    .positional('type', {
      describe: 'define the files type: page/subpage/component',
      choices: ['page', 'spage', 'cpn'],
    })
    .help().argv;

  if (yargs.argv._[1] === 'spage') {
    yargs.options({
      root: {
        describe: 'root of sub packages',
        type: 'string',
        demandOption: true,
      },
    });
  }
};

export const generateHandler = async argv => {
  const cwd = process.cwd();

  if (!existsSync(join(cwd, 'wxa.config.js'))) {
    console.error('[error] please run command at project root dir');
    return;
  }

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
