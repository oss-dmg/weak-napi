'use strict';
const assert = require('assert');
const weak = require('./weak.js');

describe('create()', function() {
  afterEach(gc)

  it('should throw on non-"object" values', function() {
    [
      0,
      0.0,
      true,
      false,
      null,
      undefined,
      'foo',
      Symbol(),
    ].forEach((val) => {
      assert.throws(function() {
        weak.create(val);
      });
    });
  });

  it('should accept "object" values', function() {
    [
      {},
      function() {},
      () => {},
      [],
      Buffer.from(''),
      new ArrayBuffer(10),
      new Int32Array(new ArrayBuffer(12)),
      Promise.resolve(),
      new WeakMap(),
    ].forEach((val) => {
      assert.doesNotThrow(() => {
        assert.ok(weak.create(val));
      }, Error, String(val));
    });
  });
});