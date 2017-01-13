const install = require('../install')
const init = require('../init')
const logger = require('./logger')
const package_version = require('../../package.json').version
const uninstall = require('../uninstall')

module.exports = function(args) {
  const command = args[2]
  const flags = args.slice(3)

  switch (command) {
    case 'init':
      init({
      })
      break
    case 'install':
      process_results(
        install({
          force: flags.some(flag => flag === '--force')
        }),
        {
          verbose: flags.some(flag => flag === '--verbose')
        }
      )
      break
    case 'uninstall':
      process_results(
        uninstall(),
        {
          verbose: flags.some(flag => flag === '--verbose')
        }
      )
      break
    case 'version':
      logger.log(package_version)
      break;
    default:
      logger.error('Available commands:\n  install\n  uninstall\n  version')
  }
}

function process_results(results, { verbose = false }) {
  results.forEach(({ success, message }) => {
    if (success) {
      if (verbose) {
        logger.log(message)
      }
    } else {
      logger.error(message)
    }
  })

  // If any of the results was unsuccessful, ensure an erroneous exit status.
  if (results.some(({ success }) => !success)) {
    process.exitCode = 1
  }
}
