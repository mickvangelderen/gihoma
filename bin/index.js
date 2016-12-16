#!/usr/bin/env node

var gihoma = require('../lib')
const package_version = require('../package.json').version

const command = process.argv[2]

const flags = process.argv.slice(3)

switch (command) {
  case 'install':
    process_results(
      gihoma.install({
        force: flags.some(flag => flag === '--force')
      }),
      {
        verbose: flags.some(flag => flag === '--verbose')
      }
    )
    break;
  case 'uninstall':
    process_results(
      gihoma.uninstall(),
      {
        verbose: flags.some(flag => flag === '--verbose')
      }
    )
    break;
  case 'version':
    console.log(package_version)
    break;
  default:
    console.error('Unknown command. Use "install".')
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
