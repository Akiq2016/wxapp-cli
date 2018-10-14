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

function writeAppJson({ type, cwd, filePathTpl }) {
  const appJsonPath = `${cwd}/src/app.json`;
  const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));

  if (type === 'page') {
    const value = filePathTpl.slice(0, filePathTpl.indexOf('.*'));

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
  const filePathTpl = getFilePathTpl('pages', argv.name);

  if (!existsSync(`${cwd}/.templates/${tplDirname}`)) {
    tplDirname = 'page';
  }

  // write files
  writeFiles({ fileTypes, filePathTpl, cwd, tplDirname });

  // update app.json
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
    .usage('\n wxa generate [name]')
    .default({
      name: 'index',
    })
    .options({
      type: {
        alias: 't',
        desc: 'generate page/subpage/component type files',
        choices: ['p', 'sp', 'cpn'],
        demandOption: true,
      },
    })
    .help().argv;
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

  if (argv.type === 'p') {
    createPage({ cwd, argv, fileTypes });
  } else if (argv.type === 'sp') {
    createSubPage({ cwd, argv, fileTypes });
  } else if (argv.type === 'cpn') {
    createComponent({ cwd, argv, fileTypes });
  }
};
