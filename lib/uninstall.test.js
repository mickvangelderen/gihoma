/* eslint-env mocha */
const expectDeepEqual = require('checko/expectDeepEqual').default
const expectEqual = require('checko/expectEqual').default
const hook_template = require('../test/hook_template')
const join = require('path').join
const lstatSync = require('fs').lstatSync
const mkdirSync = require('fs').mkdirSync
const os = require('os')
const random_string = require('../test/random_string')
const readFileSync = require('fs').readFileSync
const readlinkSync = require('fs').readlinkSync
const rimrafSync = require('rimraf').sync
const symlinkSync = require('fs').symlinkSync
const uninstall = require('./uninstall')
const writeFileSync = require('fs').writeFileSync

describe('uninstall(options)', () => {
  let old_cwd

  beforeEach(() => {
    old_cwd = process.cwd()
    const cwd = join(os.tmpdir(), 'gihoma-test-' + random_string(32))
    mkdirSync(cwd)
    process.chdir(cwd)
  })

  afterEach(() => {
    const cwd = process.cwd()
    process.chdir(old_cwd)
    rimrafSync(cwd)
  })

  it('should remove symbolic links pointing to a file in hook_folder', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    symlinkSync('../../gihoma/pre-commit.sh', '.git/hooks/pre-commit')
    expectDeepEqual(uninstall(), [{
      success: true,
      name: 'pre-commit',
      link_path: '.git/hooks/pre-commit',
      message: 'Removed .git/hooks/pre-commit.'
    }])
    try {
      lstatSync('.git/hooks/pre-commit')
    } catch (error) {
      expectEqual(error.code, 'ENOENT')
    }
  })

  it('should not remove non-symbolic links', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    writeFileSync('.git/hooks/pre-commit', hook_template('pre-commit'), { mode: 0o755 })
    expectDeepEqual(uninstall(), [{
      success: true,
      name: 'pre-commit',
      link_path: '.git/hooks/pre-commit',
      message: 'Skipping .git/hooks/pre-commit because it is not a symbolic link.'
    }])
    expectEqual(readFileSync('.git/hooks/pre-commit').toString(), hook_template('pre-commit'))
  })

  it('should not remove symbolic links pointing to a file not in hook_folder', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    symlinkSync('../../not-gihoma/pre-commit.sh', '.git/hooks/pre-commit')
    expectDeepEqual(uninstall(), [{
      success: true,
      name: 'pre-commit',
      link_path: '.git/hooks/pre-commit',
      message: 'Skipping .git/hooks/pre-commit because it points to ../../not-gihoma/pre-commit.sh which is not in gihoma/.'
    }])
    expectEqual(readlinkSync('.git/hooks/pre-commit'), '../../not-gihoma/pre-commit.sh')
  })
})
