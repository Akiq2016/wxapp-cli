'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.generateHandler = exports.generateBuilder = void 0;

var _regenerator = _interopRequireDefault(
  require('@babel/runtime/regenerator')
);

var _asyncToGenerator2 = _interopRequireDefault(
  require('@babel/runtime/helpers/asyncToGenerator')
);

var _path = require('path');

var _fsExtra = require('fs-extra');

var _inquirer = _interopRequireDefault(require('inquirer'));

var _utils = require('../utils');

function getFilePathTpl(type, name) {
  if (name.startsWith('/')) {
    return ''.concat(name.slice(1), '.*');
  } else {
    var paths = name.split('/').filter(function(t) {
      return !!t;
    });
    return ''.concat(type, '/').concat(paths.join('/'), '.*');
  }
}

function writeFiles(_ref) {
  var fileTypes = _ref.fileTypes,
    filePathTpl = _ref.filePathTpl,
    cwd = _ref.cwd,
    tplDirname = _ref.tplDirname;
  var path = (0, _path.join)(cwd, 'src', filePathTpl);

  if (
    fileTypes.every(function(v) {
      return !(0, _fsExtra.existsSync)(path.replace('*', v));
    })
  ) {
    fileTypes.forEach(function(ext) {
      var fileTplt = (0, _fsExtra.readFileSync)(
        ''
          .concat(cwd, '/.templates/')
          .concat(tplDirname, '/template.')
          .concat(ext),
        'utf8'
      );
      var destPath = path.replace('*', ext);
      (0, _fsExtra.outputFileSync)(destPath, fileTplt);
      (0,
      _utils.consoleCreate)(''.concat((0, _path.join)('src', filePathTpl).replace('*', ext)));
    });
  } else {
    (0, _utils.consoleErr)(''.concat(path, ' already existed'));
  }
}

function writeAppJson(_ref2) {
  var type = _ref2.type,
    cwd = _ref2.cwd,
    filePathTpl = _ref2.filePathTpl,
    argv = _ref2.argv;
  var appJsonPath = ''.concat(cwd, '/src/app.json');
  var appJson = JSON.parse((0, _fsExtra.readFileSync)(appJsonPath, 'utf8'));
  var value = filePathTpl.replace('.*', '');

  if (type === 'page') {
    if (!Array.isArray(appJson.pages)) {
      appJson.pages = [];
    }

    if (appJson.pages.indexOf(value) >= 0) {
      (0, _utils.consoleErr)(
        ''.concat(value, ' already in app.json pages property')
      );
      return;
    }

    appJson.pages.push(value);
    (0, _fsExtra.writeFileSync)(appJsonPath, JSON.stringify(appJson, null, 2));
  } else if (type === 'subpage') {
    var root =
      argv.root.startsWith('/') || argv.name.startsWith('/')
        ? argv.root.startsWith('/')
          ? argv.root.slice(1)
          : argv.root
        : 'pages/'.concat(argv.root);
    value = value.split(''.concat(root, '/'))[1];

    if (!Array.isArray(appJson.subPackages)) {
      appJson.subPackages = [];
    }

    var subPackage = appJson.subPackages.find(function(v) {
      return v.root === root;
    });

    if (subPackage) {
      if (Array.isArray(subPackage.pages)) {
        if (subPackage.pages.indexOf(value) !== -1) {
          (0, _utils.consoleErr)(
            ''.concat(value, ' already in app.json pages property')
          );
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

    (0, _fsExtra.writeFileSync)(appJsonPath, JSON.stringify(appJson, null, 2));
  }
}

function createPage(_ref3) {
  var cwd = _ref3.cwd,
    argv = _ref3.argv,
    fileTypes = _ref3.fileTypes;
  var tplDirname = 'page';
  var filePathTpl = getFilePathTpl('pages', argv.name);
  writeFiles({
    fileTypes: fileTypes,
    filePathTpl: filePathTpl,
    cwd: cwd,
    tplDirname: tplDirname,
  });
  writeAppJson({
    type: 'page',
    cwd: cwd,
    filePathTpl: filePathTpl,
  });
}

function createSubPage(_ref4) {
  var cwd = _ref4.cwd,
    argv = _ref4.argv,
    fileTypes = _ref4.fileTypes;
  var tplDirname = 'subpage';
  var filePathTpl = getFilePathTpl('pages', ''.concat(argv.name));

  if (
    !(0, _fsExtra.existsSync)(''.concat(cwd, '/.templates/').concat(tplDirname))
  ) {
    tplDirname = 'page';
  }

  writeFiles({
    fileTypes: fileTypes,
    filePathTpl: filePathTpl,
    cwd: cwd,
    tplDirname: tplDirname,
  });
  writeAppJson({
    type: 'subpage',
    cwd: cwd,
    filePathTpl: filePathTpl,
    argv: argv,
  });
}

function createComponent(_ref5) {
  var cwd = _ref5.cwd,
    argv = _ref5.argv,
    fileTypes = _ref5.fileTypes;
  var tplDirname = 'component';
  var filePathTpl = getFilePathTpl('components', argv.name);
  writeFiles({
    fileTypes: fileTypes,
    filePathTpl: filePathTpl,
    cwd: cwd,
    tplDirname: tplDirname,
  });
}

var completeOptionalPositional = (function() {
  var _ref6 = (0, _asyncToGenerator2.default)(
    _regenerator.default.mark(function _callee(argv) {
      var res, _ref7, type, _ref8, name, _ref9, root;

      return _regenerator.default.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                res = {};

                if (argv.type) {
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return _inquirer.default.prompt([
                  {
                    type: 'list',
                    name: 'type',
                    message: 'What type would you like to generate?',
                    choices: ['page', 'subpackage', 'component'],
                    filter: function filter(value) {
                      return value === 'page'
                        ? 'page'
                        : value === 'subpackage'
                          ? 'spage'
                          : 'cpn';
                    },
                  },
                ]);

              case 4:
                _ref7 = _context.sent;
                type = _ref7.type;
                res.type = type;

              case 7:
                if (argv.name) {
                  _context.next = 13;
                  break;
                }

                _context.next = 10;
                return _inquirer.default.prompt([
                  {
                    name: 'name',
                    message: 'What name would you like to use for the files?',
                    validate: function validate(val) {
                      if (!val || /[^\w/]/.test(val)) {
                        return 'file name available input: [A-Za-z0-9_] or slash(/).';
                      }

                      return true;
                    },
                  },
                ]);

              case 10:
                _ref8 = _context.sent;
                name = _ref8.name;
                res.name = name;

              case 13:
                if (
                  !(
                    (argv.type === 'spage' || res.type === 'spage') &&
                    !argv.root
                  )
                ) {
                  _context.next = 19;
                  break;
                }

                _context.next = 16;
                return _inquirer.default.prompt([
                  {
                    name: 'root',
                    message:
                      'What root would you like to use for the subpackage?',
                    validate: function validate(val) {
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

              case 16:
                _ref9 = _context.sent;
                root = _ref9.root;
                res.root = root;

              case 19:
                return _context.abrupt('return', res);

              case 20:
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
    return _ref6.apply(this, arguments);
  };
})();

var generateBuilder = function generateBuilder(yargs) {
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

exports.generateBuilder = generateBuilder;

var generateHandler = (function() {
  var _ref10 = (0, _asyncToGenerator2.default)(
    _regenerator.default.mark(function _callee2(argv) {
      var cwd, config, fileTypes;
      return _regenerator.default.wrap(
        function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                cwd = process.cwd();

                if (
                  (0, _fsExtra.existsSync)(
                    (0, _path.join)(cwd, 'wxa.config.js')
                  )
                ) {
                  _context2.next = 4;
                  break;
                }

                (0, _utils.consoleErr)(
                  'Please run command at project root dir'
                );
                return _context2.abrupt('return');

              case 4:
                _context2.t0 = Object;
                _context2.t1 = argv;
                _context2.next = 8;
                return completeOptionalPositional(argv);

              case 8:
                _context2.t2 = _context2.sent;

                _context2.t0.assign.call(
                  _context2.t0,
                  _context2.t1,
                  _context2.t2
                );

                config = require(''.concat(cwd, '/wxa.config.js'));
                fileTypes = ['json', 'wxml', config.scripts, config.style];

                if (argv.type === 'page') {
                  createPage({
                    cwd: cwd,
                    argv: argv,
                    fileTypes: fileTypes,
                  });
                } else if (argv.type === 'spage') {
                  createSubPage({
                    cwd: cwd,
                    argv: argv,
                    fileTypes: fileTypes,
                  });
                } else if (argv.type === 'cpn') {
                  createComponent({
                    cwd: cwd,
                    argv: argv,
                    fileTypes: fileTypes,
                  });
                }

              case 13:
              case 'end':
                return _context2.stop();
            }
          }
        },
        _callee2,
        this
      );
    })
  );

  return function generateHandler(_x2) {
    return _ref10.apply(this, arguments);
  };
})();

exports.generateHandler = generateHandler;
