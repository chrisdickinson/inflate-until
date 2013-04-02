module.exports = until

var zlib = require('./zlib')
  , Buffer = require('buffer').Buffer

function until(size) {
  var accum = new Buffer(0)
    , last_offset = 0
    , offset = 0
    , finished = false
    , data_crc = null

  return function write(buf, ready) {
    if(finished) {
      return
    }
    offset += buf.length
    accum = Buffer.concat([accum, buf], offset)
    attempt(ready)
  }

  function get_data_crc(buf) {
    var s1 = 1
      , s2 = 0
    for(var i = 0; i < size; ++i) {
      s1 = (s1 + buf.readUInt8(i)) % 65521
      s2 = (s2 + s1) % 65521
    }
    return ((s2 << 16) | s1) >>> 0
  }

  function attempt(ready) {
    var middle
      , result
      , high
      , low
      , idx

    high = offset
    low = last_offset

    return binary_search()

    function binary_search() {
      middle = (high + low) >>> 1
      zlib.inflate(accum.slice(0, middle), function(err, data) {
        if(err || data.length !== size) {
          if(low === high) {
            // not found, folks.
            return done()
          }
          low = middle + 1

          return binary_search()
        }

        data_crc = data_crc === null ? get_data_crc(data) : data_crc

        high = middle

        if(low >= high) {
          idx = high
          result = data
          return check_adler()
        }
        return binary_search()
      })
    }

    function check_adler() {
      var crc

      for(var i = -1, len = accum.length - idx - 4; i < len; ++i) {
        crc = accum.readUInt32BE(idx + i)
        if(crc === data_crc) {
          break
        }
      }

      // make absolutely sure we're
      // within the bounds.
      if(i >= len - 1) {
        result = null
        return done()
      }
      idx = idx + i + 4
      done()
    }

    function done() {
      var old_last_offset = last_offset

      last_offset = idx
      if(finished) {
        return ready()
      }
      if(!result) {
        return ready()
      }
      finished = true

      ready({
        compressed: idx
      , rest: accum.slice(idx)
      , data: result
      })
    }
  }
}
