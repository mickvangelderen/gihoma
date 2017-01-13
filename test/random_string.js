const randomBytes = require('crypto').randomBytes
const CHARACTERS = '0123456789abcdefghijklmnopqrstuvwxyz'

module.exports = function random_string(length, characters = CHARACTERS) {
  const scale = characters.length/256
  return Array.from(randomBytes(length))
  .map(i => characters[Math.floor(i*scale)])
  .join('')
}
