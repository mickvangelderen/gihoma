const Module = require('module')

function map_keys(src, map) {
  return Object.keys(src).reduce((dst, key) => {
    dst[map(key)] = src[key]
    return dst
  }, Object.create(Object.getPrototypeOf(src)))
}

module.exports = function mocked_require(parent_path, path_to_mock) {
  if (!(this instanceof Module)) throw new Error('Expected this to be a Module.')

  const parent_id = Module._resolveFilename(parent_path, this, false)

  // Save the original require function.
  const original_require = Module.prototype.require

  // Replace the require function with something that returns our mocks if there
  // is one.
  Module.prototype.require = function(child_path) {
    // Resolve the filename relative to the module using this require.
    // https://github.com/nodejs/node/blob/v7.3.0/lib/internal/module.js#L13
    // https://github.com/nodejs/node/blob/v7.3.0/lib/module.js#L495
    const resolve = path => Module._resolveFilename(path, this, false)
    const child_id = resolve(child_path)
    const id_to_mock = map_keys(path_to_mock, resolve)
    return id_to_mock[child_id]
      ? id_to_mock[child_id]
      : original_require.apply(this, arguments)
  }

  // Save the original module if it's in the cache.
  const original_result = Module._cache[parent_id]

  if (original_result) {
    // Ensure we actually re-load the dependency by clearing its cache entry.
    delete Module._cache[parent_id]
  }

  // Actually require the dependency (which uses the new module.require).
  const result = Module._load(parent_id, this, false)

  if (original_result) {
    Module._cache[parent_id] = original_result
  } else {
    // We don't want to cache mocked modules because we don't want
    // require('./foo') to return a mocked version of 'foo'.
    delete Module._cache[parent_id]
  }

  // Restore the original require.
  Module.prototype.require = original_require

  return result
}
