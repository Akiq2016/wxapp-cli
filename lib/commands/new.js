'use strict';

var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard');

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.newProject = newProject;
exports.newHandler = exports.newBuilder = void 0;

var _defineProperty2 = _interopRequireDefault(
  require('@babel/runtime/helpers/defineProperty')
);

var _objectSpread3 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectSpread')
);

var _regenerator = _interopRequireDefault(
  require('@babel/runtime/regenerator')
);

var _asyncToGenerator2 = _interopRequireDefault(
  require('@babel/runtime/helpers/asyncToGenerator')
);

var _path = require('path');

var _mkdirp = _interopRequireDefault(require('mkdirp'));

var _inquirer = _interopRequireDefault(require('inquirer'));

var _fsExtra = require('fs-extra');

var _child_process = require('child_process');

var _config = _interopRequireWildcard(require('../config'));

var _utils = require('../utils');

var cwd = process.cwd();

var getProjectDir = function getProjectDir(dir) {
  return (0, _path.resolve)(cwd, dir);
};

var getNewPromptItems = function getNewPromptItems(_) {
  return [
    {
      type: 'list',
      name: 'pkg',
      message: 'Select your package manager:',
      default: 0,
      choices: _config.default.createdChoicesDict['pkg'],
    },
    {
      type: 'list',
      name: 'scripts',
      message: 'Select your project script type:',
      default: 0,
      choices: _config.default.createdChoicesDict['scripts'],
      filter: _config.default.createdChoicesFilterDict['scripts'],
    },
    {
      type: 'list',
      name: 'style',
      message: 'Select your project CSS pre-processor:',
      default: 0,
      choices: _config.default.createdChoicesDict['style'],
      filter: _config.default.createdChoicesFilterDict['style'],
    },
  ];
};

var completeOptionalPositional = (function() {
  var _ref = (0, _asyncToGenerator2.default)(
    _regenerator.default.mark(function _callee(argv) {
      var res, _ref2, projectname;

      return _regenerator.default.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                res = {};

                if (argv.projectname) {
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return _inquirer.default.prompt([
                  {
                    name: 'projectname',
                    message: 'What name would you like to use for the project?',
                    validate: function validate(val) {
                      if (!val || /[^\w]/.test(val)) {
                        return 'project name available input: [A-Za-z0-9_]';
                      }

                      return true;
                    },
                  },
                ]);

              case 4:
                _ref2 = _context.sent;
                projectname = _ref2.projectname;
                res.projectname = projectname;

              case 7:
                return _context.abrupt('return', res);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        },
        _callee,
        this
      );
    })
  );

  return function completeOptionalPositional(_x) {
    return _ref.apply(this, arguments);
  };
})();

var newBuilder = function newBuilder(yargs) {
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

exports.newBuilder = newBuilder;

var newHandler = (function() {
  var _ref3 = (0, _asyncToGenerator2.default)(
    _regenerator.default.mark(function _callee2(argv) {
      var options;
      return _regenerator.default.wrap(
        function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                _context2.t0 = Object;
                _context2.t1 = argv;
                _context2.next = 4;
                return completeOptionalPositional(argv);

              case 4:
                _context2.t2 = _context2.sent;

                _context2.t0.assign.call(
                  _context2.t0,
                  _context2.t1,
                  _context2.t2
                );

                argv.projectDir = getProjectDir(argv.projectname);

                if ((0, _fsExtra.existsSync)(argv.projectDir)) {
                  _context2.next = 11;
                  break;
                }

                _mkdirp.default.sync(argv.projectDir);

                _context2.next = 14;
                break;

              case 11:
                (0, _utils.consoleErr)(
                  ''.concat(argv.projectDir, ' already existed')
                );
                delete argv.projectDir;
                return _context2.abrupt('return');

              case 14:
                if (!argv.y) {
                  _context2.next = 18;
                  break;
                }

                options = Object.assign(
                  argv,
                  _config.default.defaultChoiceDict
                );
                _context2.next = 24;
                break;

              case 18:
                _context2.t3 = Object;
                _context2.t4 = argv;
                _context2.next = 22;
                return _inquirer.default.prompt(getNewPromptItems(argv));

              case 22:
                _context2.t5 = _context2.sent;
                options = _context2.t3.assign.call(
                  _context2.t3,
                  _context2.t4,
                  _context2.t5
                );

              case 24:
                if (process.env.ENV === 'development') {
                  console.log(options);
                }

                _context2.prev = 25;
                _context2.next = 28;
                return newProject(options);

              case 28:
                _context2.next = 34;
                break;

              case 30:
                _context2.prev = 30;
                _context2.t6 = _context2['catch'](25);
                (0, _utils.consoleErr)(_context2.t6);
                process.exit(1);

              case 34:
              case 'end':
                return _context2.stop();
            }
          }
        },
        _callee2,
        this,
        [[25, 30]]
      );
    })
  );

  return function newHandler(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

exports.newHandler = newHandler;

function newProject(options) {
  return new Promise(function(resolve, reject) {
    try {
      process.chdir(options.projectDir);
      var projectTplPath =
        options.templaterepo || _config.default.projectTplPath;
      (0,
      _child_process.execSync)(''.concat((0, _path.join)(__dirname, '..', '..', 'node_modules/.bin/sao'), ' ').concat(projectTplPath, ' --clone=false'), {
        stdio: [0, 1, 2],
      });

      try {
        var tplDir = (0, _fsExtra.existsSync)(_config.default.customConfigDir)
          ? _config.default.customConfigDir
          : null;
        generateTpls(options, tplDir);
      } catch (error) {
        (0, _utils.consoleErr)(error);
        return;
      }

      (0,
      _fsExtra.writeFileSync)((0, _path.join)(options.projectDir, 'wxa.config.js'), 'module.exports = '.concat(JSON.stringify(options, null, 2), ';\n'));
      var installCmd = options.pkg === 'npm' ? 'npm install' : 'yarn';

      try {
        (0, _child_process.execSync)(installCmd, {
          stdio: [0, 1, 2],
        });
      } catch (e) {
        (0,
        _utils.consoleWarn)(''.concat(installCmd, ' has failed, you can run it youself later.'));
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function generateTpls(options, tplDir) {
  var dirPathDict = ['component', 'page'].reduce(function(acc, key) {
    return (0, _objectSpread3.default)(
      {},
      acc,
      (0, _defineProperty2.default)(
        {},
        key,
        [options.scripts, options.style, 'json', 'wxml'].map(function(
          ext,
          index
        ) {
          var path = tplDir
            ? (0, _path.join)(tplDir, key, 'template.'.concat(ext))
            : null;
          return {
            path: path && (0, _fsExtra.existsSync)(path) ? path : null,
            folder: key,
            ext: ext,
            type: index === 0 ? 'scripts' : index === 1 ? 'style' : null,
          };
        })
      )
    );
  }, {});
  Object.keys(dirPathDict).forEach(function(key) {
    var items = dirPathDict[key];
    items.forEach(function(item) {
      if (item.path) {
        (0, _fsExtra.copySync)(
          item.path,
          (0, _path.join)(options.projectDir, '.templates', folder)
        );
      } else {
        var dirPath = (0, _path.join)(
          options.projectDir,
          '.templates',
          item.folder,
          'template.'.concat(item.ext)
        );

        if (item.ext === 'json' || item.type === 'scripts') {
          (0, _fsExtra.ensureFileSync)(dirPath);
          (0, _fsExtra.writeFileSync)(
            dirPath,
            _config.TPLS[
              ''
                .concat(item.folder)
                .concat(item.ext === 'json' ? 'json' : 'scripts')
            ]
          );
        } else if (item.ext === 'wxml' || item.type === 'style') {
          (0, _fsExtra.closeSync)((0, _fsExtra.openSync)(dirPath, 'w'));
        }
      }
    });
  });
}
