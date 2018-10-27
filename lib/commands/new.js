'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.newProject = newProject;
exports.newHandler = exports.newBuilder = void 0;

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

var _config = _interopRequireDefault(require('../config'));

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

var newBuilder = function newBuilder(yargs) {
  yargs
    .usage('\n wxa new [args]')
    .options({
      y: {
        alias: 'yes',
        desc: 'use default setting',
        type: 'boolean',
      },
    })
    .help().argv;
};

exports.newBuilder = newBuilder;

var newHandler = (function() {
  var _ref = (0, _asyncToGenerator2.default)(
    _regenerator.default.mark(function _callee(argv) {
      var options;
      return _regenerator.default.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                if (!argv.projectname) {
                  _context.next = 9;
                  break;
                }

                argv.projectDir = getProjectDir(argv.projectname);

                if ((0, _fsExtra.existsSync)(argv.projectDir)) {
                  _context.next = 6;
                  break;
                }

                _mkdirp.default.sync(argv.projectDir);

                _context.next = 9;
                break;

              case 6:
                (0, _utils.consoleErr)(
                  ''.concat(argv.projectDir, ' already existed')
                );
                delete argv.projectDir;
                return _context.abrupt('return');

              case 9:
                if (!argv.y) {
                  _context.next = 13;
                  break;
                }

                options = Object.assign(
                  argv,
                  _config.default.defaultChoiceDict
                );
                _context.next = 19;
                break;

              case 13:
                _context.t0 = Object;
                _context.t1 = argv;
                _context.next = 17;
                return _inquirer.default.prompt(getNewPromptItems(argv));

              case 17:
                _context.t2 = _context.sent;
                options = _context.t0.assign.call(
                  _context.t0,
                  _context.t1,
                  _context.t2
                );

              case 19:
                console.log(options);
                _context.prev = 20;
                _context.next = 23;
                return newProject(options);

              case 23:
                _context.next = 29;
                break;

              case 25:
                _context.prev = 25;
                _context.t3 = _context['catch'](20);
                (0, _utils.consoleErr)(_context.t3);
                process.exit(1);

              case 29:
              case 'end':
                return _context.stop();
            }
          }
        },
        _callee,
        this,
        [[20, 25]]
      );
    })
  );

  return function newHandler(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.newHandler = newHandler;

function newProject(options) {
  return new Promise(function(resolve, reject) {
    try {
      process.chdir(options.projectDir);
      var projectTplPath = options.tplpath || _config.default.projectTplPath;
      (0, _child_process.execSync)('sao '.concat(projectTplPath, ' --clone'), {
        stdio: [0, 1, 2],
      });

      try {
        var defaultTplDir = (0, _path.join)(__dirname, '..', 'templates');
        var tplDir = (0, _fsExtra.existsSync)(_config.default.customConfigDir)
          ? _config.default.customConfigDir
          : defaultTplDir;
        (0,
        _fsExtra.copySync)(tplDir, (0, _path.join)(options.projectDir, '.templates'));

        if (!(0, _fsExtra.existsSync)((0, _path.join)(tplDir, 'page'))) {
          (0, _fsExtra.copySync)(
            (0, _path.join)(defaultTplDir, 'page'),
            (0, _path.join)(options.projectDir, '.templates/page')
          );
        }

        if (!(0, _fsExtra.existsSync)((0, _path.join)(tplDir, 'component'))) {
          (0, _fsExtra.copySync)(
            (0, _path.join)(defaultTplDir, 'component'),
            (0, _path.join)(options.projectDir, '.templates/component')
          );
        }
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
