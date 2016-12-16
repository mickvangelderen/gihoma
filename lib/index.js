const dirname = require('path').dirname
const join = require('path').join
const lstatSync = require('fs').lstatSync
const parse = require('path').parse
const basename = require('path').basename
const readdirSync = require('fs').readdirSync
const readlinkSync = require('fs').readlinkSync
const relative = require('path').relative
const resolve = require('path').resolve
const statSync = require('fs').statSync
const symlinkSync = require('fs').symlinkSync
const unlinkSync = require('fs').unlinkSync
const X_OK = require('fs').X_OK

const FORCE = exports.FORCE = false
const HOOK_FOLDER = exports.HOOK_FOLDER = 'gihoma/'
const LINK_FOLDER = exports.LINK_FOLDER = '.git/hooks/'

exports.install = function({
  force = FORCE,
  hook_folder = HOOK_FOLDER,
  link_folder = LINK_FOLDER
} = {}) {
  return readdirSync(hook_folder)
  // Drop files starting with a '.' character.
  .filter(hook_name => !/^\./.test(hook_name))
  .map(hook_name => ({
    name: parse(hook_name).name, // Take only basename without extension.
    hook_path: join(hook_folder, hook_name) // Relative path.
  }))
  // Take only executable files.
  .filter(({ hook_path }) => {
    const stat = statSync(hook_path)
    return stat.isFile() && (stat.mode & X_OK)
  })
  // Create links.
  .map(({ name, hook_path }) => {
    const link_path = join(link_folder, name)
    const relative_path = relative(dirname(link_path), hook_path)

    function done(message) {
      return { name, hook_path, link_path, relative_path, success: true, message }
    }

    function fail(message) {
      return Object.assign(new Error(message), { name, hook_path, link_path, relative_path, success: false, message })
    }

    try {
      const link_stat = lstatSync(link_path)
      if (link_stat.isSymbolicLink()) {
        const actual_relative_path = readlinkSync(link_path)

        if (actual_relative_path === relative_path) {
          return done(`Skipped creating link ${link_path} because it already exists and already points to ${relative_path}.`)
        }

        if (force) {
          // Replace the link.
          unlinkSync(link_path)
          symlinkSync(relative_path, link_path)
          return done(`Modified link ${link_path} so that it no longer points to ${actual_relative_path} but to ${relative_path}.`)
        }

        return fail(`Failed to create link ${link_path} because it already exists but points to ${actual_relative_path} instead of ${relative_path}. Use --force to overwrite.`)
      } else {
        return fail(`Failed to create link ${link_path} because something other than a symbolic link exists at that location. Manually inspect and move or remove the file.`)
      }
    } catch (error) {
      // Failed to lstat link_path.
      if (error && error.code === 'ENOENT') {
        // Nothing exists at link_path.
        symlinkSync(relative_path, link_path)
        return done(`Created link ${link_path} pointing to ${relative_path}.`)
      }
      throw error
    }
  })
}

exports.uninstall = function({
  hook_folder = HOOK_FOLDER,
  link_folder = LINK_FOLDER
} = {}) {
  return readdirSync(link_folder)
  .map(name => {
    const link_path = join(link_folder, name)

    const stat = lstatSync(link_path)

    if (!stat.isSymbolicLink()) {
      return { name, link_path, success: true, message: `Skipping ${link_path} because it is not a symbolic link.` }
    }

    const relative_path = readlinkSync(link_path)

    if (!basename(resolve(link_path, relative_path)) === resolve(hook_folder)) {
      return { name, link_path, success: true, message: `Skipping ${link_path} because it points to ${relative_path} which is not in ${hook_folder}.` }
    }

    unlinkSync(link_path)
    return { name, link_path, success: true, message: `Removed ${link_path}.`}
  })
}
