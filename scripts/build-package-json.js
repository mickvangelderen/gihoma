const _ = require('function/PLACEHOLDER')
const partial = require('function/partial')
const readFileSync = require('fs').readFileSync
const writeFileSync = require('fs').writeFileSync

const DELETE = { symbol: 'DELETE' }

pipe('package.json', [
  readFileSync,
  JSON.parse,
  partial(transform_object, [ _, {
    private: () => DELETE,
    engines: partial(transform_object, [ _, {
      node: () => '^4.0.0'
    }])
  }]),
  partial(JSON.stringify, [ _, null, 2 ]),
  partial(writeFileSync, [ 'build/package.json' ])
])

function transform_object(input, transformations) {
  return Object.keys(input)
  .reduce((output, key) => {
    if (transformations.hasOwnProperty(key)) {
      const value = transformations[key](input[key])
      if (value !== DELETE) output[key] = value
    } else {
      output[key] = input[key]
    }
    return output
  }, Object.create(Object.getPrototypeOf(input)))
}

function pipe(value, funcs) {
  return funcs.reduce((value, func) => func(value), value)
}
