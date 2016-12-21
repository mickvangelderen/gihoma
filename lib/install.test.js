/* eslint-env mocha */
const mocked_require = require('../test/mocked_require').bind(module)
const expectEqual = require('checko/expectEqual').default
const expectDeepEqual = require('checko/expectDeepEqual').default

it('should install', () => {
  const install = mocked_require('../lib/install', {
    'fs': {
      readdirSync: () => [ 'pre-commit.sh' ],
      statSync: () => ({
        isFile: () => true,
        mode: 0o775
      }),
      lstatSync: () => {
        throw Object.assign(new Error(), { code: 'ENOENT' })
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
      name: 'pre-commit',
      hook_path: 'gihoma/pre-commit.sh',
      link_path: '.git/hooks/pre-commit',
      relative_path: '../../gihoma/pre-commit.sh',
      success: true,
      message: 'Created link .git/hooks/pre-commit pointing to ../../gihoma/pre-commit.sh.'
    }
  ])
})
