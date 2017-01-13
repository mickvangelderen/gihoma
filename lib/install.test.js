/* eslint-env mocha */
const expectDeepEqual = require('checko/expectDeepEqual').default
const expectEqual = require('checko/expectEqual').default
const hook_template = require('../test/hook_template')
const install = require('./install')
const join = require('path').join
const mkdirSync = require('fs').mkdirSync
const mocked_require = require('../test/mocked_require').bind(module)
const os = require('os')
const random_string = require('../test/random_string')
const readlinkSync = require('fs').readlinkSync
const rimrafSync = require('rimraf').sync
const symlinkSync = require('fs').symlinkSync
const unreachable = require('../test/unreachable')
const writeFileSync = require('fs').writeFileSync

describe('install(options)', () => {
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

  it('should create a symbolic link.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit', hook_template('pre-commit'), { mode: 0o755 })
    expectDeepEqual(install(), [{
      success: true,
      message: 'Created link .git/hooks/pre-commit pointing to ../../gihoma/pre-commit.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit'
    }])
    expectEqual(readlinkSync('.git/hooks/pre-commit'), '../../gihoma/pre-commit')
  })

  it('should create a symbolic link without the file extension.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    expectDeepEqual(install(), [{
      success: true,
      message: 'Created link .git/hooks/pre-commit pointing to ../../gihoma/pre-commit.sh.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
    expectEqual(readlinkSync('.git/hooks/pre-commit'), '../../gihoma/pre-commit.sh')
  })

  it('should skip installing a hook when a correct link already exists.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    symlinkSync('../../gihoma/pre-commit.sh', '.git/hooks/pre-commit')
    expectDeepEqual(install(), [{
      success: true,
      message: 'Skipped creating link .git/hooks/pre-commit because it already exists and already points to ../../gihoma/pre-commit.sh.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
  })

  it('should skip installing a hook when a link already exists with a different target.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    symlinkSync('../../not-gihoma/pre-commit.sh', '.git/hooks/pre-commit')
    expectDeepEqual(install(), [{
      success: false,
      message: 'Failed to create link .git/hooks/pre-commit because it already exists but points to ../../not-gihoma/pre-commit.sh instead of ../../gihoma/pre-commit.sh. Use --force to overwrite.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
  })

  it('should overwrite a hook when a link already exists with a different target on a forced install.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    symlinkSync('../../not-gihoma/pre-commit.sh', '.git/hooks/pre-commit')
    expectDeepEqual(install({ force: true }), [{
      success: true,
      message: 'Modified link .git/hooks/pre-commit so that it no longer points to ../../not-gihoma/pre-commit.sh but to ../../gihoma/pre-commit.sh.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
  })

  it('should skip installing a hook when a file already exists.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    writeFileSync('.git/hooks/pre-commit', hook_template('pre-commit'), { mode: 0o755 })
    expectDeepEqual(install(), [{
      success: false,
      message: 'Failed to create link .git/hooks/pre-commit because a file already exists at that location. Use --force to overwrite.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
  })

  it('should overwrite a hook when a file already exists on a forced install.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    writeFileSync('.git/hooks/pre-commit', hook_template('pre-commit'), { mode: 0o755 })
    expectDeepEqual(install({ force: true }), [{
      success: true,
      message: 'Replaced file .git/hooks/pre-commit with a symbolic link to ../../gihoma/pre-commit.sh.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
  })

  it('should skip installing a hook when something other than a link or file already exists.', () => {
    mkdirSync('.git')
    mkdirSync('.git/hooks')
    mkdirSync('gihoma')
    writeFileSync('gihoma/pre-commit.sh', hook_template('pre-commit'), { mode: 0o755 })
    mkdirSync('.git/hooks/pre-commit')
    expectDeepEqual(install(), [{
      success: false,
      message: 'Failed to create link .git/hooks/pre-commit because something other than a symbolic link or a file exists at that location. Manually inspect and move or remove it.',
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh'
    }])
  })

  // Test what happens when an error other than ENOENT is thrown.
  it('should re-throw unexpected errors.', () => {
    const install = mocked_require('./install', {
      'fs': {
        readdirSync: () => [ 'no-permission' ],
        statSync: () => ({ isFile: () => true, mode: 0o775 }),
        lstatSync: () => { throw Object.assign(new Error(), { code: 'EPERM' }) },
        X_OK: require('fs').X_OK
      }
    })

    try {
      install()
      /* istanbul ignore next */
      unreachable()
    } catch (error) {
      expectEqual(error.code, 'EPERM')
    }
  })

})
