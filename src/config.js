import xdgBasedir from 'xdg-basedir';
import { join } from 'path';

const createdChoicesDict = {
  pkg: ['npm', 'yarn'],
  scripts: ['JavaScript', 'TypeScript'],
  style: ['scss', 'less', 'No thanks, I use wxss!'],
};

const createdChoicesFilterDict = {
  scripts: value => {
    return value === 'JavaScript' ? 'js' : 'ts';
  },
  style: value => {
    return value === 'No thanks, I use wxss!' ? 'wxss' : value;
  },
};

// const customConfigDir = xdgBasedir.config; //

const config = {
  // for commands/new prompt items
  createdChoicesDict,
  createdChoicesFilterDict,
  defaultChoiceDict: Object.assign(
    {},
    ...Object.keys(createdChoicesDict).map(key => ({
      [key]: createdChoicesFilterDict[key]
        ? createdChoicesFilterDict[key](createdChoicesDict[key][0])
        : createdChoicesDict[key][0],
    }))
  ),
  // for commands/new sao [template]
  projectTplPath: 'feiwuteam/quickstart-miniprogram',
  // for custom template. e.g: '/Users/yourname/.config/wxapp',
  customConfigDir: join(xdgBasedir.config, 'wxapp'),
};

export default config;
