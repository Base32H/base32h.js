// @license magnet:?xt=urn:btih:b8999bbaf509c08d127678643c515b9ab0836bae&dn=ISC.txt ISC

// *sigh*
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);  // AMD
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();  // Node
    } else {
        root.base32h = factory();  // Browser
    }
}(typeof self !== 'undefined' ? self : this, function () {
    /**
     * Base32H's digit set.
     *
     * The first character of each element is the "canonical" representation
     * emitted by the encoder.  All other characters are "aliases"; a decoder
     * will convert the canonical character or an alias thereof to the
     * corresponding value.
     */
    var digits = [
        '0Oo',
        '1Ii',
        '2',
        '3',
        '4',
        '5Ss',
        '6',
        '7',
        '8',
        '9',
        'Aa',
        'Bb',
        'Cc',
        'Dd',
        'Ee',
        'Ff',
        'Gg',
        'Hh',
        'Jj',
        'Kk',
        'Ll',
        'Mm',
        'Nn',
        'Pp',
        'Qq',
        'Rr',
        'Tt',
        'VvUu',
        'Ww',
        'Xx',
        'Yy',
        'Zz'
    ];

    /**
     * Encodes a value to its Base32H digit.
     *
     * @param {number} input - Value to encode.
     *
     * @return {string} - Base32H representation of input.
     */
    function encodeDigit(input) {
        return digits[input][0];
    }

    /**
     * Encodes an integer to Base32H.
     *
     * @param {number} input - Integer to encode.
     *
     * @return {string} - Base32H-encoded representation of input.
     */
    function encode(input) {
        var rem = parseInt(input);
        if (!rem) {
            return '0';
        }
        var out = [];
        while (rem) {
            out.unshift(encodeDigit(rem % 32));
            rem = parseInt(rem / 32);
        }
        return out.join('');
    }

    /**
     * Encodes an array of bytes to Base32H.
     *
     * Accepts either a "binary string" (as something like e.g. btoa() would
     * take) or an array of numbers (e.g Uint8Array, or an ordinary untyped
     * array).  If the number of bytes in the input is not a multiple of 5, the
     * encoder will pad the input with null bytes / zeroes to the next multiple
     * of 5.
     *
     * @param {(string|number[])} input - Byte array to encode.
     *
     * @return {string} - Base32H-encoded representation of input.
     */
    function encodeBin(input) {
        if (typeof input == 'string') {
            input = [...input].map(i => i.charCodeAt(0));
        }
        var overflow = input.length % 5;
        if (overflow) {
            input = [...Array(5 - overflow).fill(0), ...input];
        }
        var acc = ''
        for (var i = 0; i < input.length; i += 5) {
            var segment = input.slice(i, i+5);
            var segInt = bytesToUint40(segment);
            var encoded = encode(segInt);
            var padded = pad(encoded);
            acc += padded;
        }
        return acc;
    }

    function bytesToUint40(b) {
        return b[0]*2**32 + b[1]*2**24 + b[2]*2**16 + b[3]*2**8 + b[4];
    }

    // This is cursed
    function pad(i,w,z) {
        z = z || '0';
        w = w || 8;
        i += '';
        var o = i.length % w;
        if (o) {
            return [...Array(w - o).fill(z), ...i].join('');
        }
        return i;
    }

    /**
     * Decodes a Base32H digit to its value.
     *
     * Returns -1 if the input is not a Base32H digit.
     *
     * @param {string} input - Digit to decode.
     *
     * @return {number} - Decoded representation of input.
     */
    function decodeDigit(input) {
        return digits.findIndex(d => d.includes(input));
    }

    /**
     * Decodes a Base32H-encoded integer.
     *
     * @param {string} input - Base32H integer to decode.
     *
     * @return {number} - Decoded representation of input.
     */
    function decode(input) {
        input += '';
        var acc = 0;
        var rem = input.split('');
        var exp = 0;
        while (rem.length > 0) {
            var digit = decodeDigit(rem.pop());
            if (digit < 0) {
                continue;
            }
            acc += digit * 32**exp;
            exp += 1;
        }
        return acc;
    }

    /**
     * Decodes a Base32H string into an array of bytes.
     *
     * Assumes input (after filtering out non-digits) has a length divisible by
     * 8; if not, pads the beginning of the input with zeroes until the length
     * is divisible by 8.
     *
     * For maximum compatibility, returns an array of byte-representing numbers;
     * it should be trivial to turn this into a more specific type, e.g. via
     * Uint8Array.from(base32h.decode(someString)).
     *
     * @param {string} input - Base32H string to decode.
     *
     * @return {number[]} - Decoded array of bytes.
     */
    function decodeBin(input) {
        input = pad(input.split('').filter(d => decodeDigit(d) > -1).join(''));
        var acc = [];
        for (var i = 0; i < input.length; i += 8) {
            var segment = input.slice(i, i+8);
            var val = decode(segment);
            acc = [...acc, ...uint40ToBytes(val)];
        }
        return acc;
    }

    function uint40ToBytes(i) {
        var s = pad(parseInt(i).toString(16), 10);
        var a = parseInt(s.slice(0,2), 16);
        var b = parseInt(s.slice(2,4), 16);
        var c = parseInt(s.slice(4,6), 16);
        var d = parseInt(s.slice(6,8), 16);
        var e = parseInt(s.slice(8,10), 16);
        return [a,b,c,d,e];
    }

    return {
        digits:      digits,
        encodeDigit: encodeDigit,
        encode:      encode,
        encodeBin:   encodeBin,
        decodeDigit: decodeDigit,
        decode:      decode,
        decodeBin:   decodeBin
    }

}));


// @license-end
