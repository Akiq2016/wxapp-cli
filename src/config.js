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

const componentscripts = `// https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/
Component({
  properties: {},
  data: {},
  created() {},
  attached() {},
  ready() {},
  moved() {},
  methods: {},
});
`;

const pagescripts = `// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html
Page({
  data: {},
  onLoad() {},
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
  onPageScroll() {},
});
`;

const componentjson = `{
  "component": true
}`;

const pagejson = `{}`;

export const TPLS = { componentscripts, componentjson, pagescripts, pagejson };
