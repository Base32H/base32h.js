# `base32h.js`

## What is it?

It's the second reference implementation of an encoder and decoder for Base32H,
a new(-ish) base-32 number representation, written as a package for NPM (but
should work in any reasonably-modern Javascript implementation).

## How do I install it?

Run `npm install base32h@base32h` in your project directory, or just yank
`base32h.js` right out of this repo and stick it wherever.

## How do I use it?

It's one of them fancy "UMD" libraries, so you can do something along the lines
of `var base32h = require('base32h')` if you're using this in Node, or simply
include it as a script file on some page if you're using this from the browser
(and `base32h` will be available from other scripts on the page).

Either way, once it's loaded:

```js
base32h.encode(17854910);
// -> "H0WDY"

base32h.encodeBin([227,169,72,131,141,245,213,150,217,217]);
// -> "WELLH0WDYPARDNER"

base32h.decode('88pzd');
// -> 8675309

base32h.decodeBin('2060W2G6009');
// -> [ 0, 0, 0, 8, 6, 7, 5, 3, 0, 9 ]
```

## Am I allowed to use it?

Yep!  Just follow the terms of the ISC license (see `COPYING` in this repo).
