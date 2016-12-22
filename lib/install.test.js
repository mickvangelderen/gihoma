/* eslint-env mocha */
const expectDeepEqual = require('checko/expectDeepEqual').default
const expectEqual = require('checko/expectEqual').default
const mocked_require = require('../test/mocked_require').bind(module)
const unreachable = require('../test/unreachable')

it('should install', () => {
  {
    const install = mocked_require('./install', {
      'fs': {
        readdirSync: () => [
          'pre-commit.sh',
          'post-commit.js',
          'link-is-different',
          'file-already-exists'
        ],
        statSync: path => {
          switch (path) {
            case 'gihoma/pre-commit.sh': // Fall through.
            case 'gihoma/post-commit.js': // Fall through.
            case 'gihoma/link-is-different': // Fall through.
            case 'gihoma/file-already-exists': // Fall through.
              return { isFile: () => true, mode: 0o775 }
            /* istanbul ignore next */
            default: unreachable()
          }
        },
        lstatSync: path => {
          switch (path) {
            case '.git/hooks/pre-commit':
              throw Object.assign(new Error(), { code: 'ENOENT' })
            case '.git/hooks/post-commit': // Fall through.
            case '.git/hooks/link-is-different':
              return { isSymbolicLink: () => true }
            case '.git/hooks/file-already-exists':
              return { isSymbolicLink: () => false }
            /* istanbul ignore next */
            default: unreachable()
          }
        },
        readlinkSync: path => {
          switch (path) {
            case '.git/hooks/post-commit':
              return '../../gihoma/post-commit.js'
            case '.git/hooks/link-is-different':
              return '../../gihoma/some-other-file'
            /* istanbul ignore next */
            default: unreachable()
          }
        },
        symlinkSync: (relative_path, link_path) => {
          expectEqual(relative_path, '../../gihoma/pre-commit.sh')
          expectEqual(link_path, '.git/hooks/pre-commit')
        },
        X_OK: require('fs').X_OK
      }
    })

    expectDeepEqual(install(), [
      {
        success: true,
        message: 'Created link .git/hooks/pre-commit pointing to ../../gihoma/pre-commit.sh.',
        name: 'pre-commit',
        hook_path: 'gihoma/pre-commit.sh',
        link_path: '.git/hooks/pre-commit',
        relative_path: '../../gihoma/pre-commit.sh'
      }, {
        success: true,
        message: 'Skipped creating link .git/hooks/post-commit because it already exists and already points to ../../gihoma/post-commit.js.',
        name: 'post-commit',
        hook_path: 'gihoma/post-commit.js',
        link_path: '.git/hooks/post-commit',
        relative_path: '../../gihoma/post-commit.js'
      }, {
        success: false,
        message: 'Failed to create link .git/hooks/link-is-different because it already exists but points to ../../gihoma/some-other-file instead of ../../gihoma/link-is-different. Use --force to overwrite.',
        name: 'link-is-different',
        hook_path: 'gihoma/link-is-different',
        link_path: '.git/hooks/link-is-different',
        relative_path: '../../gihoma/link-is-different'
      }, {
        success: false,
        message: 'Failed to create link .git/hooks/file-already-exists because something other than a symbolic link exists at that location. Manually inspect and move or remove the file.',
        name: 'file-already-exists',
        hook_path: 'gihoma/file-already-exists',
        link_path: '.git/hooks/file-already-exists',
        relative_path: '../../gihoma/file-already-exists'
      }
    ])
  }
  // Test what happens when an error other than ENOENT is thrown.
  {
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
  }
  // Test --force.
  {
    const install = mocked_require('./install', {
      'fs': {
        readdirSync: () => [ 'pre-commit.sh' ],
        statSync: () => ({ isFile: () => true, mode: 0o775 }),
        lstatSync: () => ({ isSymbolicLink: () => true }),
        readlinkSync: () => '../../gihoma/not-the-same',
        unlinkSync: path => expectEqual(path, '.git/hooks/pre-commit'),
        symlinkSync: (relative_path, link_path) => {
          expectEqual(relative_path, '../../gihoma/pre-commit.sh')
          expectEqual(link_path, '.git/hooks/pre-commit')
        },
        X_OK: require('fs').X_OK
      }
    })

    expectDeepEqual(install({ force: true }), [
      {
        success: true,
        message: 'Modified link .git/hooks/pre-commit so that it no longer points to ../../gihoma/not-the-same but to ../../gihoma/pre-commit.sh.',
        name: 'pre-commit',
        hook_path: 'gihoma/pre-commit.sh',
        link_path: '.git/hooks/pre-commit',
        relative_path: '../../gihoma/pre-commit.sh'
      }
    ])
  }
})
