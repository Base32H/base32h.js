var test = require('tape');
var base32h = require('.');

test('roundtrip encode/decode', function (t) {
    t.equal(base32h.decode(base32h.encode(8675309)),
            8675309, "Jenny's phone number");
    t.end();
});

function testEncode(t, i, o) {
    t.equal(base32h.encode(i), o+'', 'encode ' + i + ' -> ' + o);
}

test('Base32H Numeric: Encode', function (t) {
    t.test('Digits', function (t) {
        for (var i of Array(10).keys()) {
            testEncode(t, i, i+'');
        }
        var abc = "ABCDEFGHJKLMNPQRTVWXYZ";
        for (var i of Array(22).keys()) {
            testEncode(t, i+10, abc[i]);
        }
        t.end();
    });

    t.test('Numbers', function (t) {
        testEncode(t, 2**5-1, 'Z');
        testEncode(t, 2**10-1, 'ZZ');
        testEncode(t, 2**20-1, 'ZZZZ');
        testEncode(t, 2**40-1, 'ZZZZZZZZ');

        testEncode(t, 2**8-1, '7Z');
        testEncode(t, 2**16-1, '1ZZZ');
        testEncode(t, 2**32-1, '3ZZZZZZ');

        t.end();
    });

    t.end();
});

function testDecode(t, i, o) {
    t.equal(base32h.decode(i), o, 'decode ' + i + ' -> ' + o);
}

test('Base32H Numeric: Decode', function (t) {
    t.test('Canonical Digits', function (t) {
        for (var i of Array(32).keys()) {
            testDecode(t, '0123456789ABCDEFGHJKLMNPQRTVWXYZ'[i], i);
        }
        t.end();
    });

    t.test('Alias Digits', function (t) {
        testDecode(t, 'o', 0);
        testDecode(t, 'O', 0);
        testDecode(t, 'i', 1);
        testDecode(t, 'I', 1);
        testDecode(t, 's', 5);
        testDecode(t, 'S', 5);
        testDecode(t, 'u', 27);
        testDecode(t, 'U', 27);

        for (var i of Array(22).keys()) {
            testDecode(t, 'abcdefghjklmnpqrtvwxyz'[i], i+10);
        }

        t.end();
    });

    t.test('Numbers', function (t) {
        testDecode(t, 'Z', 2**5-1);
        testDecode(t, 'Zz', 2**10-1);
        testDecode(t, 'ZzzZ', 2**20-1);
        testDecode(t, 'zZzZZzZz', 2**40-1);

        testDecode(t, '7z', 2**8-1);
        testDecode(t, 'iZzZ', 2**16-1);
        testDecode(t, '3zZzZzZ', 2**32-1);

        t.end();
    });

    t.end();
});

function testBinEncode(t, i, o) {
    t.equal(base32h.encodeBin(i), o, 'encode ' + i + ' -> ' + o);
}

test('Base32H Binary: Encode', function (t) {
    testBinEncode(t, [255],                  '0000007Z');
    testBinEncode(t, [255,255],              '00001ZZZ');
    testBinEncode(t, [255,255,255],          '000FZZZZ');
    testBinEncode(t, [255,255,255,255],      '03ZZZZZZ');
    testBinEncode(t, [255,255,255,255,255],  'ZZZZZZZZ');

    var uint40 = [255,255,255,255,255];
    testBinEncode(t, [255, ...uint40],       '0000007ZZZZZZZZZ');
    testBinEncode(t, [...uint40, ...uint40], 'ZZZZZZZZZZZZZZZZ');

    t.end();
});

function arrayEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function testBinDecode(t, i, o) {
    t.ok(arrayEqual(base32h.decodeBin(i), o), 'decode ' + i + ' -> ' + o);
}

test('Base32H Binary: Decode', function (t) {
    testBinDecode(t, '7z',               [0,0,0,0,255]);
    testBinDecode(t, '1zZz',             [0,0,0,255,255]);
    testBinDecode(t, 'fZzZz',            [0,0,255,255,255]);
    testBinDecode(t, '3zZzZzZ',          [0,255,255,255,255]);
    testBinDecode(t, 'zZzZzZzZ',         [255,255,255,255,255]);

    var uint40 = [255,255,255,255,255];
    testBinDecode(t, '7ZZZZZZZZZ',       [0,0,0,0,255, ...uint40]);
    testBinDecode(t, 'zZzZzZzZzZzZzZzZ', [...uint40, ...uint40]);
    t.end();
});

test('Base32H Digit: Encode Digit', function (t) {
    t.equal(base32h.encodeDigit(0), '0', "Encode 0 to '0'");
    t.equal(base32h.encodeDigit(10), 'A', "Encode 10 to 'A'");
    t.equal(base32h.encodeDigit(31), 'Z', "Encode 31 to 'Z'");
    t.throws(
        () => { base32h.encodeDigit(-1) },
        /Cannot read property '0' of undefined/,
        "Encode -1 should throw"
    );
    t.throws(
        () => { base32h.encodeDigit(32) },
        /Cannot read property '0' of undefined/,
        "Encode 32 should throw"
    );
    t.end();
});

test('Base32H Digit: Decode Digit', function (t) {
    t.equal(base32h.decodeDigit('0'), 0, "Decode '0' to 0");
    t.equal(base32h.decodeDigit('A'), 10, "Decode 'A' to 10");
    t.equal(base32h.decodeDigit('Z'), 31, "Decode 'Z' to 31");
    t.equal(base32h.decodeDigit('!'), -1, "Decode '!' to -1");
    // This isn't a problem, just document here in test.
    t.equal(base32h.decodeDigit(''), 0, "Decode '' to 0");
    t.end();
});
