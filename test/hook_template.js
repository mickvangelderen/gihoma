module.exports = function hook_template(hook_name) {
  return `#!/usr/bin/env bash\n\necho "${hook_name}"\n`
}
