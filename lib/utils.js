'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.consoleCreate = exports.consoleWarn = exports.consoleErr = void 0;

var _chalk = _interopRequireDefault(require('chalk'));

var consoleErr = function consoleErr(content) {
  console.log(_chalk.default.bold.red('FAILED '), content);
};

exports.consoleErr = consoleErr;

var consoleWarn = function consoleWarn(content) {
  console.log(_chalk.default.bold.keyword('orange')('WARNING '), content);
};

exports.consoleWarn = consoleWarn;

var consoleCreate = function consoleCreate(content) {
  console.log(_chalk.default.bold.green('CREATE '), content);
};

exports.consoleCreate = consoleCreate;
