# inflate-until

a module for that really odd case where you know
how big the thing you're deflating is, but you want
to deflate it *and* know how big the compressed data
was.

**NB**: this is slow.

```javascript

var stream = inflateUntil(256, function(err, info) {
  stream.rest // the remaining contents of the 
              // last buffer

  info.compressed // the compressed size
  info.data // the inflated data
})

inflateUntil.write(buf)
inflateUntil.write(buf)
inflateUntil.write(buf)
inflateUntil.write(buf)

```

## API

#### inflateUntil(size[, ready(err, info)]) -> stream

create an inflateUntil stream.

#### stream.rest

the remaining bytes of the last buffer written.

## License

MIT
