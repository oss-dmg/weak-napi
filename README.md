<p align="center">
  <a href="https://nodejs.org/">
    <img
      alt="Node.js"
      src="https://nodejs.org/static/images/logo-light.svg"
      width="400"
    />
  </a>
</p>

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. For
more information on using Node.js, see the [Node.js Website][].

This module is only for the JavaScript runtime Node.js and is provided by
several open source collaberators.

**This project is bound by a [Code of Conduct][].**

---

weak-napi (Native module)
=========================

| CI service    | Status        |
| :------------- |:-------------|
| *Travis CI*   | [![Build Status](https://travis-ci.com/oss-dmg/weak-napi.svg?branch=master)](https://travis-ci.com/oss-dmg/weak-napi) |
| *Appveyor*    | [![Build status](https://ci.appveyor.com/api/projects/status/e8pgj0kec3apec8f/branch/master?svg=true)](https://ci.appveyor.com/project/VoltanaDMG/weak-napi/branch/master) |

### Make weak references to JavaScript Objects.

`Warning: This is not the official weak-napi NPM module!`

On certain rarer occasions, you run into the need to be notified when a JavaScript
object is going to be garbage collected. This feature is exposed to V8's C++ API,
but not to JavaScript.

That's where `weak-napi` comes in! This module exports the JS engine's GC tracking
functionality to JavaScript. This allows you to create weak references, and
optionally attach a callback function to any arbitrary JS object. The callback
function will be invoked right after the Object is garbage collected (i.e. after
there are no more remaining references to the Object in JS-land).

This module can, for example, be used for debugging; to determine whether or not
an Object is being garbage collected as it should.
Take a look at the example below for commented walkthrough scenario.


Installation
------------

Install with `npm`:

``` bash
$ npm install weak-napi
```

Differences from node-weak
--------------------------

This module exports the full `node-weak` API. The main differences are:

- This module uses N-API! Yay. That’s a good thing – you don’t need to worry
  about re-compiling your code anymore when upgrading Node.
- GC callbacks are invoked at a suitable time (after the actual GC run has
  finished). **This is nice because it means your process won’t
  potentially crash.**
- This module works on Node 6+ only, since it uses a `Proxy` object to give a
  more complete referral of properties.
- `isNearDeath()` is not supported (always returns false).

That’s it!

Example
-------

Here's an example of calling a `cleanup()` function on a Object after it gets
garbage collected:

``` js
var weak = require('weak-napi')

// we are going to "monitor" this Object and invoke "cleanup"
// before the object is garbage collected
var obj = {
    a: true
  , foo: 'bar'
}

// Here's where we set up the weak reference
var ref = weak(obj, function () {
  // `this` inside the callback is the EventEmitter.
  console.log('"obj" has been garbage collected!')
})

// While `obj` is alive, `ref` proxies everything to it, so:
ref.a   === obj.a
ref.foo === obj.foo

// Clear out any references to the object, so that it will be GC'd at some point...
obj = null

//
//// Time passes, and the garbage collector is run
//

// `callback()` above is called, and `ref` now acts like an empty object.
typeof ref.foo === 'undefined'
```


Weak Callback Function "Best Practices"
---------------------------------------

It's important to be careful when using the "callbacks" feature of `weak-napi`,
otherwise you can end up in a situation where the watched object will never
be garbage collected.

You _should **not**_ define the callback function in the same scope as the
object that is being watched. It's often best to define the callback function
at the highest scope possible (top-level being the best). Named functions
work really well for this:

``` js
var http = require('http')
  , weak = require('weak-napi')

http.createServer(function (req, res) {
  weak(req, gcReq)
  weak(res, gcRes)
  res.end('Hello World\n')
}).listen(3000)

function gcReq () {
  console.log('GC\'d `req` object')
}

function gcRes () {
  console.log('GC\'d `res` object')
}
```


API
---

### Weakref weak(Object obj [, Function callback])

The main exports is the function that creates the weak reference.
The first argument is the Object that should be monitored.
The Object can be a regular Object, an Array, a Function, a RegExp, or any of
the primitive types or constructor function created with `new`.

Optionally, you can set a callback function to be invoked
before the object is garbage collected.


### Object weak.get(Weakref ref)

`get()` returns the actual reference to the Object that this weak reference was
created with. If this is called with a dead reference, `undefined` is returned.


### Boolean weak.isDead(Weakref ref)

Checks to see if `ref` is a dead reference. Returns `true` if the original Object
has already been GC'd, `false` otherwise.


### Boolean weak.isNearDeath(Weakref ref)

*Note* The N-API port of this module does not implement this and
always returns `false`.


### Boolean weak.isWeakRef(Object obj)

Checks to see if `obj` is "weak reference" instance. Returns `true` if the
passed in object is a "weak reference", `false` otherwise.


### EventEmitter weak.addCallback(Weakref ref, Function callback)

Adds `callback` to the Array of callback functions that will be invoked before the
Object gets garbage collected. The callbacks get executed in the order that they
are added.


### EventEmitter weak.removeCallback(Weakref ref, Function callback)

Removes `callback` from the Array of callback functions that will be invoked before
the Object gets garbage collected.


### EventEmitter weak.removeCallbacks(Weakref ref)

Empties the Array of callback functions that will be invoked before the Object gets
garbage collected.


### Array weak.callbacks(Weakref ref)

Returns an Array that `ref` iterates through to invoke the GC callbacks. This
utilizes node's `EventEmitter#listeners()` function and therefore returns a copy
in node 0.10 and newer.


[Code of Conduct]: https://github.com/nodejs/admin/blob/master/CODE_OF_CONDUCT.md
[Node.js Website]: https://nodejs.org/en/
