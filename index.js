/*---------------------------------------------------------------------------------------------
 *  Copyright (c) OSS DerikMediaGroup Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
const bindings = require("bindings");

// Use the native bindings of the weak-napi package directly
module.exports = bindings({
    bindings: "weakref.node",
    module_root: bindings.getRoot(require.resolve("./index.js")),
});