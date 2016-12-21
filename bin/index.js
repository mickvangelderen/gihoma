#!/usr/bin/env node

const install = require('../lib/install')
const uninstall = require('../lib/uninstall')
const package_version = require('../package.json').version

const command = process.argv[2]
const flags = process.argv.slice(3)

switch (command) {
  case 'install':
    process_results(
      install({
        force: flags.some(flag => flag === '--force')
      }),
      {
        verbose: flags.some(flag => flag === '--verbose')
      }
    )
    break;
  case 'uninstall':
    process_results(
      uninstall(),
      {
        verbose: flags.some(flag => flag === '--verbose')
      }
    )
    break;
  case 'version':
    console.log(package_version)
    break;
  default:
    console.error('Available commands:\n  install\n  uninstall\n  version')
}

function process_results(results, { verbose = false }) {
  results.forEach(({ success, message }) => {
    if (success) {
      if (verbose) {
        console.log(message)
      }
    } else {
      console.error(message)
    }
  })

  // If any of the results was unsuccessful, ensure an erroneous exit status.
  if (results.some(({ success }) => !success)) {
    process.exitCode = 1
  }
}
