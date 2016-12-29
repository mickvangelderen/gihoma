const _ = require('function/PLACEHOLDER')
const partial = require('function/partial')
const readFileSync = require('fs').readFileSync
const writeFileSync = require('fs').writeFileSync

pipe('package.json', [
  readFileSync,
  JSON.parse,
  partial(transform_object, [ _, {
    private: DELETE,
    engines: {
      node: '^4.0.0'
    }
  }]),
  partial(JSON.stringify, [ _, null, 2 ]),
  partial(writeFileSync, [ 'build/package.json' ])
])

function DELETE() {}

function transform_object(input, transformations) {
  return Object.keys(input)
  .reduce((output, key) => {
    if (transformations.hasOwnProperty(key)) {
      const transformation = transformations[key]
      if (transformation === DELETE) {
        // Do nothing.
      } else if (typeof transformation === 'function') {
        output[key] = transformation(input[key])
      } else if (typeof transformation === 'object' && transformation !== null) {
        output[key] = transform_object(input[key], transformation)
      } else {
        output[key] = transformation
      }
    } else {
      output[key] = input[key]
    }
    return output
  }, Object.create(Object.getPrototypeOf(input)))
}

function pipe(value, funcs) {
  return funcs.reduce((value, func) => func(value), value)
}
