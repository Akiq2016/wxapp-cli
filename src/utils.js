import chalk from 'chalk';

export const consoleErr = content => {
  console.log(chalk.bold.red('FAILED '), content);
};
export const consoleWarn = content => {
  console.log(chalk.bold.keyword('orange')('WARNING '), content);
};
export const consoleCreate = content => {
  console.log(chalk.bold.green('CREATE '), content);
};
