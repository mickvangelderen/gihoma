const dirname = require('path').dirname
const FORCE = require('./defaults/FORCE')
const HOOK_FOLDER = require('./defaults/HOOK_FOLDER')
const join = require('path').join
const LINK_FOLDER = require('./defaults/LINK_FOLDER')
const lstatSync = require('fs').lstatSync
const parse = require('path').parse
const readdirSync = require('fs').readdirSync
const readlinkSync = require('fs').readlinkSync
const relative = require('path').relative
const statSync = require('fs').statSync
const symlinkSync = require('fs').symlinkSync
const unlinkSync = require('fs').unlinkSync
const X_OK = require('fs').X_OK

// Creates symbolic links in hook_folder to executable files found in
// link_folder. Returns an Array of objects with at least a success and
// message property.
module.exports = function install({
  force = FORCE, // Overwrite files not created by gihoma.
  hook_folder = HOOK_FOLDER, // Path to the git hooks folder.
  link_folder = LINK_FOLDER // Path to the hook scripts folder.
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
      return { success: true, message, name, hook_path, link_path, relative_path }
    }

    function fail(message) {
      return { success: false, message, name, hook_path, link_path, relative_path }
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
