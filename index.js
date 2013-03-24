var through = require('through')
  , zlib = require('zlib')

module.exports = function(size, ready) {
  var stream = through(write, end)
    , inflate = zlib.createInflate({flush: zlib.Z_SYNC_FLUSH}) 
    , expecting = size
    , accum = []
    , got = 0

  inflate.on('data', gotdata)

  if(ready) {
    stream
      .on('error', ready)
      .on('data', function(d) { ready(null, d) })
  }

  return stream

  function write(buf) {
    stream.pause()
    iter()

    function iter() {
      if(!buf.length || expecting === 0) {
        stream.resume()
        return
      }
  
      ++got
      inflate.write(buf.slice(0, 1))
      buf = buf.slice(1)
      stream.rest = buf
      inflate.flush(iter)
    }
  }

  function gotdata(buf) {
    stream.resume()
    accum[accum.length] = buf
    expecting -= buf.length
    if(expecting <= 0) {
      stream.queue({
        compressed: got
      , data: Buffer.concat(accum, size)
      })
      accum.length = 0
      stream.queue(null)
    }
  }

  function end() {
    if(expecting !== 0) {
      return stream.emit('error', new Error('unexpected eof in inflate stream'))
    }
    stream.queue(null)
  }
}
