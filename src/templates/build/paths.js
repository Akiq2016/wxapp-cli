'use strict';

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  app: resolveApp(''),
  appBuild: resolveApp('dist'),
  appSrc: resolveApp('src'),
  tsConfig: resolveApp('tsconfig.json'),
  appNodeModules: resolveApp('node_modules'),
  projectPackageJson: resolveApp('package.json'),
};
