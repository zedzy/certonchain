'use strict'

// const { concat: uint8ArrayConcat } = require('uint8arrays/concat')
function concat(arrays, length) {
  if (!length) {
    length = arrays.reduce((acc, curr) => acc + curr.length, 0);
  }
  const output = new Uint8Array(length);
  let offset = 0;
  for (const arr of arrays) {
    output.set(arr, offset);
    offset += arr.length;
  }
  return output;
}

/**
 * Takes an (async) iterable that yields buffer-like-objects and concats them
 * into one buffer
 * @param {AsyncIterable<Uint8Array>|Iterable<Uint8Array>} stream
 */
async function toBuffer (stream) {
  let buffer = new Uint8Array(0)

  for await (const buf of stream) {
    buffer = concat([buffer, buf], buffer.length + buf.length)
  }

  return buffer
}

// module.exports = toBuffer
