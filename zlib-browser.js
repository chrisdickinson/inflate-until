module.exports = {inflate: inflate}

var zlib = require('zlib')
  , Buffer = require('buffer').Buffer

function inflate(buf, ready) {
  var array = [].slice.call(buf.parent, buf.offset, buf.length + buf.offset)

  try {
    var output = zlib.inflateSync(array)
    process.nextTick(function() {
      ready(null, new Buffer(output))
    })
  } catch(e) {
    process.nextTick(function() {
      if(e.message.indexOf('unsupported compression') > -1) {
        return ready(e) 
      }
      ready(null, [])
    })
  }
}
