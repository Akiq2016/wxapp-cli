'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(
  require('@babel/runtime/helpers/defineProperty')
);

var _toConsumableArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/toConsumableArray')
);

var _xdgBasedir = _interopRequireDefault(require('xdg-basedir'));

var _path = require('path');

var createdChoicesDict = {
  pkg: ['npm', 'yarn'],
  scripts: ['JavaScript', 'TypeScript'],
  style: ['scss', 'less', 'No thanks, I use wxss!'],
};
var createdChoicesFilterDict = {
  scripts: function scripts(value) {
    return value === 'JavaScript' ? 'js' : 'ts';
  },
  style: function style(value) {
    return value === 'No thanks, I use wxss!' ? 'wxss' : value;
  },
};
var config = {
  createdChoicesDict: createdChoicesDict,
  createdChoicesFilterDict: createdChoicesFilterDict,
  defaultChoiceDict: Object.assign.apply(
    Object,
    [{}].concat(
      (0, _toConsumableArray2.default)(
        Object.keys(createdChoicesDict).map(function(key) {
          return (0,
          _defineProperty2.default)({}, key, createdChoicesFilterDict[key] ? createdChoicesFilterDict[key](createdChoicesDict[key][0]) : createdChoicesDict[key][0]);
        })
      )
    )
  ),
  projectTplPath: 'feiwuteam/quickstart-miniprogram',
  customConfigDir: (0, _path.join)(_xdgBasedir.default.config, 'wxapp'),
};
var _default = config;
exports.default = _default;
