'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.consoleWarn = exports.consoleErr = void 0;

var _chalk = _interopRequireDefault(require('chalk'));

var consoleErr = function consoleErr(content) {
  console.log(_chalk.default.bold.red('[failed] '), content);
};

exports.consoleErr = consoleErr;

var consoleWarn = function consoleWarn(content) {
  console.log(_chalk.default.bold.keyword('orange')('[warning] '), content);
};

exports.consoleWarn = consoleWarn;
