const install = require('../install')
const logger = require('./logger')
const package_version = require('../../package.json').version
const uninstall = require('../uninstall')

module.exports = function(args) {
  // const binary_path = args[0]
  // const entry_path = args[1]
  const command = args[2]

  switch (command) {
    case 'install': {
      let i = 3
      const install_options = {}
      const log_options = {}
      while (i < args.length) {
        const arg = args[i++]
        switch (arg) {
          case '--force':
            install_options.force = true
            break
          case '--verbose':
            log_options.verbose = true
            break
          default:
            logger.error('gihoma install accepts the following flags:\n  --force\n  --verbose')
            process.exitCode = 1
            return
        }
      }
      process_results(
        install(install_options),
        log_options
      )
      break
    }
    case 'uninstall': {
      let i = 3
      const log_options = {}
      while (i < args.length) {
        const arg = args[i++]
        switch (arg) {
          case '--verbose':
            log_options.verbose = true
            break
          default:
            logger.error('gihoma uninstall accepts the following flags:\n  --verbose')
            process.exitCode = 1
            return
        }
      }
      process_results(
        uninstall(),
        log_options
      )
      break
    }
    case 'version':
      logger.log(package_version)
      break;
    default:
      logger.error('gihoma accepts the following commands:\n  install\n  uninstall\n  version')
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
