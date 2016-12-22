# gihoma

[![Build Status](https://travis-ci.org/mickvangelderen/gihoma.svg?branch=master)](https://travis-ci.org/mickvangelderen/gihoma)
[![Coverage Status](https://img.shields.io/coveralls/mickvangelderen/gihoma/master.svg)](https://coveralls.io/github/mickvangelderen/gihoma?branch=master)

A simple and effective git hook manager.

## Motivation

Git hooks are surprisingly useful to update dependencies not managed by git or to test your code before making a commit. The hooks themselves should be shareable through git. Whether or not a developer uses the hooks is up to them. Therefore, enforcing policies can not be done through git hooks. Git hooks should be viewed, in my opinion, as a tool able to prevent silly mistakes.

To this end I needed a tool that can install and uninstall git hooks as symbolic links.

## Usage

Install and add gihoma to your development dependencies.

```bash
npm install --save-dev gihoma
```

Create a `gihoma` directory in your project root. This is where you'll place all your hooks.

```
mkdir gihoma
```

Add hooks, the file extension will be dropped. For example `gihoma/pre-commit.js`:

```js
#!/usr/bin/env node

console.log('Hello World!')
```

Ensure the file is executable:

```bash
chmod +x `gihoma/pre-commit.js`
```

Have gihoma create symbolic links to all executable files in the gihoma directory:

```bash
node_modules/.bin/gihoma install --verbose
```

I recommend providing your developers with a `setup` npm script. For example `package.json`:

```json
{
  "scripts": {
    "setup": "npm install && gihoma install --verbose"
  }
}
```

## Future work

 * Transpile to es2015
 * Error on multiple files resolving to the same git hook name (`pre-commit.a` and `pre-commit.b`).
 * Warn on unknown git hook names.
 * Improve command line tool, make hooks path configurable.
 * Installing or uninstalling a single specified hook.
 * Keeping the symbolic links in sync with the actually available hooks after a checkout requires some more thought.
 * Writing an asynchronous version.
