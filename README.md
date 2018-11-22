# wxapp-cli [![Build Status](https://travis-ci.org/Akiq2016/wxapp-cli.svg?branch=master)](https://travis-ci.org/Akiq2016/wxapp-cli)

A command line interface for Mini Program.

![wxa gen](./README.svg)

## Install
```bash
npm install -g @hzfe/wxapp-cli
```

## Usage
```
wxa <command> [args]

Commands:
  wxa new [projectname] [templaterepo]  🍎 New a mini program project
  wxa gen [type] [name] [root]          🍐 Generate specific type files.
                                                          [aliases: g, generate]

Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

### wxa new

Create new mini program with out-of-the-box support for Babel, ESLint, TypeScript, PostCSS, etc.

```
wxa new [projectname] [templaterepo]

Positionals:
  projectname   📓 Your project name
  templaterepo  📒 Git repository or local directory

Options:
  -y, --yes      Use default setting                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

### wxa gen

Generate pages, subPackages, components with a simple command.

```
wxa gen [type] [name] [root]

Positionals:
  type  📓 Type to generate. (Available choices: [page, spage, cpn])
  name  📒 Name used for files. (Path can be included in the name)
  root  📖 Root used for subpackage files. (Only available for [spage] type)

Options:
  -h, --help     Show help                                             [boolean]
```

### Advance[todo]

You can create a mini program using your customize project template.
