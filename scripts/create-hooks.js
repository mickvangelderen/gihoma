// This file creates scripts for each git hook in ./gihoma/. They will log the
// received arguments.

const writeFileSync = require('fs').writeFileSync

;[
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
].forEach(hook => {
  const contents =
`#!/usr/bin/env node

console.log('HOOK ${hook}', process.argv.slice(2))
`
  writeFileSync(`gihoma/${hook}.js`, contents, { mode: 0o775 })
})
