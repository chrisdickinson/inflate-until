var zlib = require('zlib')
  , through = require('through')
  , Buffer = require('buffer').Buffer

module.exports = function(size, ready) {
  var stream = through(write, end)
    , inflate = safe(attempt)
    , typed_array = new Uint8Array(512)
    , offset = 0
    , done = false

  if(ready) {
    stream
      .on('error', ready)
      .on('data', function(d) { ready(null, d) })
  }

  stream.rest = null 

  return stream

  function write(buf) {
    // forgive us our sins.
    var last_off = offset
    copy_into_ta(buf)

    for(var i = last_off; i < offset; ++i) { 
      var result = inflate(typed_array.subarray(0, i), size)
      if(result) {
        break
      }
    }

    if(!result) {
      return
    }

    stream.rest = buf.slice(i - last_off - 1)
    done = true
    stream.queue({
      compressed: i - 1
    , data: result
    })
    stream.queue(null)
  }

  function end() {
    if(!done) {
      return stream.emit('error', new Error('unexpected eof in inflate stream'))
    }
    stream.queue(null)
  }

  function copy_into_ta(buf) {
    if(offset + buf.length > typed_array.length) {
      var len = typed_array.length
        , new_offset = offset + buf.length
        , new_typed_array

      do {
        len *= 2
      } while(len < new_offset)

      new_typed_array = new UInt8Array(len)
      for(var i = 0; i < offset; ++i) {
        new_typed_array[i] = typed_array[i]
      }
      typed_array = new_typed_array 
    }

    for(var i = offset; i < offset + buf.length; ++i) {
      typed_array[i] = buf.readUInt8(i - offset)
    } 
    offset += buf.length
  }
}

function attempt(ta, want) {
  var result
    , out

  result = zlib.inflateSync(ta)
  if(result.length !== want) {
    return null
  }

  out = new Buffer(result.length)
  for(var i = 0, len = result.length; i < len; ++i) {
    out.writeUInt8(result[i], i)
  }
  return out
}

function safe(fn) {
  return function(buf, want) {
    try { return fn(buf, want) }
    catch(e) { return null }
  }
}
