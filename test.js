var test = require('tape')
  , inflateUntil = require('./index')
  , Buffer = require('buffer').Buffer

test('make sure it works as expected', function(assert) {
  var until = inflateUntil(256)

  var buf = TEST_DATA
    , done = false

  iter()

  function gotdata(info) {
    if(!info) {
      return
    }
    done = true
    assert.equal(info.data.length, 256)
    assert.equal(info.compressed, 157)

    assert.equal(info.rest.toString('base64'), 'lRF4')
    assert.end()
  }

  function iter() {
    var chunksize = Math.min(buf.length, 16)
    if(chunksize === 0 || done) {
      return
    }
    until(buf.slice(0, chunksize), gotdata)
    buf = buf.slice(chunksize)
    setTimeout(iter, 10)
  }
})

var TEST_DATA = new Buffer('eJytzM0NwjAMQOF7psgCRLHTBFdCCAkWcVxDI+iP0rA/5cAGXN8nvVZVbZCBAbJEisc4MCtmQo/QS0CImHdNESmblavOzRIEj0wpdRKIBRSpu+chaqfSYxD1zLkTNPxu41Ltdaxls7cizzJvy2xP8g1tWUetbnPDDy6PicvLyTKdLYQUeiJIvT34o/dmr1NpTf+0M+C8S+YD6IVPi5UReJytjkFuAyEMAO+8wh/oCvDGgFRFldqPsI7JonYhAkfN85se+oNeZ6TR6BCBUtwamAqW7IK1LMHGjU7x5JIU61fxtmxO0NzykKbgS8wBmWgVdC5ZtpSjhOi9pC05RIq40Q==', 'base64')
