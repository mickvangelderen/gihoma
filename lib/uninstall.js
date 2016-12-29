const dirname = require('path').dirname
const HOOK_FOLDER = require('./defaults/HOOK_FOLDER')
const join = require('path').join
const LINK_FOLDER = require('./defaults/LINK_FOLDER')
const lstatSync = require('fs').lstatSync
const readdirSync = require('fs').readdirSync
const readlinkSync = require('fs').readlinkSync
const resolve = require('path').resolve
const unlinkSync = require('fs').unlinkSync

// Deletes symbolic links in hook_folder pointing to files in
// link_folder. Returns an array of objects with at least a success and
// message property.
module.exports = function uninstall({
  hook_folder = HOOK_FOLDER, // Path to the git hooks folder.
  link_folder = LINK_FOLDER // Path to the hook scripts folder.
} = {}) {
  return readdirSync(link_folder)
  .map(name => {
    const link_path = join(link_folder, name)

    const stat = lstatSync(link_path)

    if (!stat.isSymbolicLink()) {
      return { name, link_path, success: true, message: `Skipping ${link_path} because it is not a symbolic link.` }
    }

    const relative_path = readlinkSync(link_path)

    if (resolve(dirname(link_path), dirname(relative_path)) !== resolve(hook_folder)) {
      return { name, link_path, success: true, message: `Skipping ${link_path} because it points to ${relative_path} which is not in ${hook_folder}.` }
    }

    unlinkSync(link_path)
    return { name, link_path, success: true, message: `Removed ${link_path}.`}
  })
}
