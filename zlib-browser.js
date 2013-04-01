module.exports = {inflate: inflate}

var zlib = require('zlib')
  , Buffer = require('buffer').Buffer

function inflate(buf, ready) {
  var typed_array = new Uint8Array(buf.parent)
    
  typed_array = typed_array.subarray(buf.offset, buf.length + buf.offset)

  try {
    var output = zlib.inflateSync(typed_array)
    return ready(null, new Buffer(output))
  } catch(e) {
    return ready(null, [])
  }
}
