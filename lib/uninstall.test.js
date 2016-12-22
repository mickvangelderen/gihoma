/* eslint-env mocha */
const expectDeepEqual = require('checko/expectDeepEqual').default
const expectEqual = require('checko/expectEqual').default
const mocked_require = require('../test/mocked_require').bind(module)
const unreachable = require('../test/unreachable')

it('should uninstall', () => {
  const uninstall = mocked_require('./uninstall', {
    'fs': {
      readdirSync: () => [
        'pre-commit',
        'post-checkout.sample',
        'external-link'
      ],
      lstatSync: path => {
        switch(path) {
          case '.git/hooks/pre-commit': return { isSymbolicLink: () => true }
          case '.git/hooks/post-checkout.sample': return { isSymbolicLink: () => false }
          case '.git/hooks/external-link': return { isSymbolicLink: () => true }
          /* istanbul ignore next */
          default: unreachable()
        }
      },
      readlinkSync: path => {
        switch (path) {
          case '.git/hooks/pre-commit': return '../../gihoma/pre-commit.sh'
          case '.git/hooks/external-link': return '../../not-gihoma/external-link.sh'
          /* istanbul ignore next */
          default: unreachable()
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
    }, {
      name: 'external-link',
      link_path: '.git/hooks/external-link',
      success: true,
      message: 'Skipping .git/hooks/external-link because it points to ../../not-gihoma/external-link.sh which is not in gihoma/.'
    }
  ])
})
