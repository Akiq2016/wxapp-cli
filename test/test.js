import { execSync } from 'child_process';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  removeSync,
  ensureDirSync,
} from 'fs-extra';
import { join, resolve } from 'path';
import inquirer from 'inquirer';
import { newHandler } from '../src/commands/new';

function getPageValInAppJson(appJsonPages, pagePath) {
  if (pagePath.indexOf('\\') >= 0) {
    pagePath = pagePath.split('\\').join('/');
  }

  const page = pagePath.split('newproject/src/')[1].replace('.wxml', '');
  return appJsonPages.find(v => v === page);
}

function getSubPageRootInAppJson({ subpackages, root }) {
  const res = root.startsWith('/')
    ? subpackages.find(v => v.root === root.slice(1))
    : subpackages.find(v => v.root === `pages/${root}`);

  return res ? res.root : '';
}

function getSubPageValInAppJson({ subpackages, root, page }) {
  const subPageRoot = getSubPageRootInAppJson({ subpackages, root });

  if (subPageRoot) {
    const subpackage = subpackages.find(v => v.root === subPageRoot);
    return subpackage.pages.find(v => v === page);
  }
}

beforeAll(() => {
  global.root = resolve(__dirname, '..');
  global.wxa = `node ${root}/bin/wxa`;

  global.page1path = join(root, 'newproject/src', 'pages', 'detail1.wxml');
  global.page2path = join(
    root,
    'newproject/src',
    'pages',
    'product1/detail2.wxml'
  );
  global.page3path = join(
    root,
    'newproject/src',
    'pages',
    'product1/path1/detail3.wxml'
  );
  global.page5path = join(root, 'newproject/src', 'product2', 'detail5.wxml');

  global.page1path_sub = join(
    root,
    'newproject/src',
    'pages',
    'product1/sub1/detail2.wxml'
  );
  global.page2path_sub = join(
    root,
    'newproject/src',
    'pages',
    'product1/sub2/path1/detail3.wxml'
  );
  global.page3path_sub = join(root, 'newproject/src', 'sub1', 'detail4.wxml');
  global.page4path_sub = join(
    root,
    'newproject/src',
    'product2/sub2',
    'detail5.wxml'
  );
});

describe('new a project named newproject', () => {
  beforeEach(() => {
    process.chdir(root);
  });

  test('using npm js wxss', async () => {
    await inquirer.prompt.mockImplementationOnce(_ =>
      Promise.resolve({
        pkg: 'npm',
        scripts: 'js',
        style: 'wxss',
      })
    );

    await newHandler({
      _: ['new'],
      $0: 'bin/wxa',
      projectname: 'newproject',
      projectDir: join(__dirname, '..', 'newproject'),
    });

    expect(existsSync(join(root, 'newproject', 'node_modules'))).toBe(true);
  });
});

describe('test in newproject', () => {
  beforeEach(() => {
    process.chdir(join(root, 'newproject'));
  });

  describe('generate pages', () => {
    test('generate page detail1', () => {
      try {
        execSync(`${wxa} generate page detail1`);
      } catch (error) {}
      expect(existsSync(page1path)).toBe(true);
    });

    test('generate page product1/detail2', () => {
      try {
        execSync(`${wxa} generate page product1/detail2`);
      } catch (error) {}
      expect(existsSync(page2path)).toBe(true);
    });

    test('generate page product1/path1/detail3', () => {
      try {
        execSync(`${wxa} generate page product1/path1/detail3`);
      } catch (error) {}
      expect(existsSync(page3path)).toBe(true);
    });

    test('generate page /product2/detail5', () => {
      try {
        execSync(`${wxa} generate page /product2/detail5`);
      } catch (error) {}
      expect(existsSync(page5path)).toBe(true);
    });

    test('check app.json pages field', () => {
      const appJson = JSON.parse(
        readFileSync(join(root, 'newproject/src/app.json'), 'utf8')
      );

      expect(getPageValInAppJson(appJson.pages, page1path)).toBe(
        'pages/detail1'
      );
      expect(getPageValInAppJson(appJson.pages, page2path)).toBe(
        'pages/product1/detail2'
      );
      expect(getPageValInAppJson(appJson.pages, page3path)).toBe(
        'pages/product1/path1/detail3'
      );
      expect(getPageValInAppJson(appJson.pages, page5path)).toBe(
        'product2/detail5'
      );
    });
  });

  describe('generate sub pages', () => {
    test('generate spage product1/sub1/detail2 product1/sub1', () => {
      try {
        execSync(`${wxa} generate spage product1/sub1/detail2 product1/sub1`);
      } catch (error) {}
      expect(existsSync(page1path_sub)).toBe(true);
    });

    test('generate spage product1/sub2/path1/detail3 product1/sub2', () => {
      try {
        execSync(
          `${wxa} generate spage product1/sub2/path1/detail3 product1/sub2`
        );
      } catch (error) {}
      expect(existsSync(page2path_sub)).toBe(true);
    });

    test('generate spage /sub1/detail4 /sub1', () => {
      try {
        execSync(`${wxa} generate spage /sub1/detail4 /sub1`);
      } catch (error) {}
      expect(existsSync(page3path_sub)).toBe(true);
    });

    test('generate spage /product2/sub2/detail5 /product2/sub2', () => {
      try {
        execSync(`${wxa} generate spage /product2/sub2/detail5 /product2/sub2`);
      } catch (error) {}
      expect(existsSync(page4path_sub)).toBe(true);
    });

    test('check app.json subPackages field', () => {
      const appJson = JSON.parse(
        readFileSync(join(root, 'newproject/src/app.json'), 'utf8')
      );

      expect(
        getSubPageRootInAppJson({
          subpackages: appJson.subPackages,
          root: 'product1/sub1',
        })
      ).toBe('pages/product1/sub1');

      expect(
        getSubPageRootInAppJson({
          subpackages: appJson.subPackages,
          root: 'product1/sub2',
        })
      ).toBe('pages/product1/sub2');

      expect(
        getSubPageRootInAppJson({
          subpackages: appJson.subPackages,
          root: '/sub1',
        })
      ).toBe('sub1');

      expect(
        getSubPageRootInAppJson({
          subpackages: appJson.subPackages,
          root: '/product2/sub2',
        })
      ).toBe('product2/sub2');

      expect(
        getSubPageValInAppJson({
          subpackages: appJson.subPackages,
          root: 'product1/sub1',
          page: 'detail2',
        })
      ).toBe('detail2');

      expect(
        getSubPageValInAppJson({
          subpackages: appJson.subPackages,
          root: 'product1/sub2',
          page: 'path1/detail3',
        })
      ).toBe('path1/detail3');

      expect(
        getSubPageValInAppJson({
          subpackages: appJson.subPackages,
          root: '/sub1',
          page: 'detail4',
        })
      ).toBe('detail4');

      expect(
        getSubPageValInAppJson({
          subpackages: appJson.subPackages,
          root: '/product2/sub2',
          page: 'detail5',
        })
      ).toBe('detail5');
    });
  });
});

afterAll(() => {
  removeSync(join(root, 'newproject'));
});
