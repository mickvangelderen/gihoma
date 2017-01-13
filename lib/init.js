const HOOK_FOLDER = require('./defaults/HOOK_FOLDER')
const join = require('path').join
const mkdirpSync = require('mkdirp').sync
const parse = require('path').parse
const readdirSync = require('fs').readdirSync
const writeFileSync = require('fs').writeFileSync

module.exports = function init({
  hook_extension = '.sh',
  hook_folder = HOOK_FOLDER, // Path to the git hooks folder.
  hook_template = name => `#!/usr/bin/env bash\n\n# echo ${name}\n`,
} = {}) {
  mkdirpSync(hook_folder)

  const hook_names = [
    'applypatch-msg',
    'commit-msg',
    'post-applypatch',
    'post-checkout',
    'post-commit',
    'post-merge',
    'post-receive',
    'post-rewrite',
    'post-update',
    'pre-applypatch',
    'pre-auto-gc',
    'pre-commit',
    'pre-push',
    'pre-rebase',
    'pre-receive',
    'prepare-commit-msg',
    'push-to-checkout',
    'update'
  ]

  readdirSync(hook_folder)
  .forEach(filename => {
    const hook_name = parse(filename).name
    const index = hook_names.indexOf(hook_name)
    if (index >= 0) hook_names.splice(index, 1)
  })

  hook_names
  .forEach(hook_name => {
    const hook_path = join(hook_folder, hook_name + hook_extension)
    writeFileSync(hook_path, hook_template(hook_name), { mode: 0o755 })
  })
}
