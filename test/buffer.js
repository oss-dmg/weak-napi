'use strict';
const assert = require('assert');
const weak = require('./weak.js');

describe('weak()', function () {
  afterEach(gc);

  describe('Buffer', function () {
    it('should invoke callback before destroying Buffer', function(done) {
      let called = false;
      weak(Buffer.from('test'), function (buf) {
        called = true;
      });

      assert(!called);
      gc();
      setImmediate(() => {
        assert(called);
        done();
      });
    });
  });
});