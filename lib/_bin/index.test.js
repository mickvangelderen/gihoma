/* eslint-env mocha */
const expectDeepEqual = require('checko/expectDeepEqual').default
const mocked_require = require('../../test/mocked_require').bind(module)
const package_version = require('../../package.json').version
const expectZero = require('checko/expectZero').default

it('should have a working command line utility', () => {
  const logs = []
  const errors = []
  const logger = {
    log: function() {
      logs.push(Array.prototype.slice.call(arguments))
    },
    error: function() {
      errors.push(Array.prototype.slice.call(arguments))
    }
  }

  let gihoma = mocked_require('./', {
    '../install': () => [ { success: true, message: 'Installed.' } ],
    '../uninstall': () => [ { success: true, message: 'Uninstalled.' } ],
    './logger': logger
  })

  gihoma([ null, null, 'version' ])
  expectDeepEqual(logs.shift(), [ package_version ])

  gihoma([ null, null ])
  expectDeepEqual(errors.shift(), [ 'gihoma accepts the following commands:\n  install\n  uninstall\n  version' ])

  gihoma([ null, null, 'install' ])

  gihoma([ null, null, 'install', '--verbose' ])
  expectDeepEqual(logs.shift(), [ 'Installed.' ])

  gihoma([ null, null, 'install', '--force' ])
  expectDeepEqual(logs.length, 0)

  gihoma([ null, null, 'install', '--unknown-flag' ])
  expectDeepEqual(errors.shift(), [ 'gihoma install accepts the following flags:\n  --force\n  --verbose' ])

  gihoma([ null, null, 'uninstall' ])

  gihoma([ null, null, 'uninstall', '--verbose' ])
  expectDeepEqual(logs.shift(), [ 'Uninstalled.' ])

  gihoma([ null, null, 'uninstall', '--unknown-flag' ])
  expectDeepEqual(errors.shift(), [ 'gihoma uninstall accepts the following flags:\n  --verbose' ])

  gihoma = mocked_require('./', {
    '../install': () => [ { success: false, message: 'Installation failed.' } ],
    '../uninstall': () => [ { success: false, message: 'Uninstallation failed.' } ],
    './logger': logger
  })

  gihoma([ null, null, 'install' ])
  expectDeepEqual(errors.shift(), [ 'Installation failed.' ])

  gihoma([ null, null, 'uninstall' ])
  expectDeepEqual(errors.shift(), [ 'Uninstallation failed.' ])

  expectZero(logs.length)
  expectZero(errors.length)
})
