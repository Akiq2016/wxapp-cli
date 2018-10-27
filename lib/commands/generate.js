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
  filePathTpl = (0, _path.join)(cwd, 'src', filePathTpl);

  if (
    fileTypes.every(function(v) {
      return !(0, _fsExtra.existsSync)(filePathTpl.replace('*', v));
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
      var destPath = filePathTpl.replace('*', ext);
      (0, _fsExtra.outputFileSync)(destPath, fileTplt);
      console.log('[ok] generate '.concat(destPath));
    });
  } else {
    console.error('[error] '.concat(filePathTpl, ' already existed'));
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
      console.log(''.concat(value, ' already in app.json pages property'));
      return;
    }

    appJson.pages.push(value);
    (0, _fsExtra.writeFileSync)(appJsonPath, JSON.stringify(appJson, null, 2));
  } else if (type === 'subpage') {
    var root = argv.root.startsWith('/')
      ? argv.root.slice(1)
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
          console.log(''.concat(value, ' already in app.json pages property'));
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
  var filePathTpl = getFilePathTpl(
    'pages',
    ''.concat(argv.root, '/').concat(argv.name)
  );

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

var generateBuilder = function generateBuilder(yargs) {
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

exports.generateBuilder = generateBuilder;

var generateHandler = (function() {
  var _ref6 = (0, _asyncToGenerator2.default)(
    _regenerator.default.mark(function _callee(argv) {
      var cwd, config, fileTypes;
      return _regenerator.default.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                cwd = process.cwd();

                if (
                  (0, _fsExtra.existsSync)(
                    (0, _path.join)(cwd, 'wxa.config.js')
                  )
                ) {
                  _context.next = 4;
                  break;
                }

                console.error('[error] please run command at project root dir');
                return _context.abrupt('return');

              case 4:
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

              case 7:
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

  return function generateHandler(_x) {
    return _ref6.apply(this, arguments);
  };
})();

exports.generateHandler = generateHandler;
