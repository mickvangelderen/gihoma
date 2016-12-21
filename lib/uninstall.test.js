/* eslint-env mocha */
const mocked_require = require('../test/mocked_require').bind(module)
const expectEqual = require('checko/expectEqual').default
const expectDeepEqual = require('checko/expectDeepEqual').default

it('should uninstall', () => {
  const uninstall = mocked_require('../lib/uninstall', {
    'fs': {
      readdirSync: () => [ 'pre-commit', 'post-checkout.sample' ],
      lstatSync: path => {
        switch(path) {
          case '.git/hooks/pre-commit': return { isSymbolicLink: () => true }
          case '.git/hooks/post-checkout.sample': return { isSymbolicLink: () => false }
          default: throw new Error('Unexpected parameter.')
        }
      },
      readlinkSync: path => {
        switch (path) {
          case '.git/hooks/pre-commit': return '../../gihoma/pre-commit.sh'
          default: throw new Error('Unexpected parameter.')
        }
      },
      unlinkSync: path => {
        expectEqual(path, '.git/hooks/pre-commit')
      }
    }
  })

  expectDeepEqual(uninstall(), [
    {
      name: 'pre-commit',
      link_path: '.git/hooks/pre-commit',
      success: true,
      message: 'Removed .git/hooks/pre-commit.'
    }, {
      name: 'post-checkout.sample',
      link_path: '.git/hooks/post-checkout.sample',
      success: true,
      message: 'Skipping .git/hooks/post-checkout.sample because it is not a symbolic link.'
    }
  ])
})
