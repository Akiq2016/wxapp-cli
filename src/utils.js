import chalk from 'chalk';

export const consoleErr = content => {
  console.log(chalk.bold.red('[failed] '), content);
};
export const consoleWarn = content => {
  console.log(chalk.bold.keyword('orange')('[warning] '), content);
};
