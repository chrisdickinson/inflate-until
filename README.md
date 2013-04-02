# inflate-until

a module for that really odd case where you know
how big the thing you're deflating is, but you want
to deflate it *and* know how big the compressed data
was.

**NB**: this is slow.

```javascript

var stream = inflateUntil(256)

inflateUntil.write(buf, function(info) {
  if(info) {

  }
})

```

## API

#### inflateUntil(size) -> inflate

create an inflateUntil function.

#### inflate(buf, ready) -> undefined

add another `buf` to the available bytes. calls `ready`
when finished -- if there was enough data to determine whether
or not we've reached `size` + the adler checksum, `ready`
will receive an `info` argument:

```javascript
{ compressed: Number    // size of compressed bytes written
, rest: Buffer          // Buffer representing unused bytes
, data: Buffer }        // uncompressed data
```

## License

MIT
