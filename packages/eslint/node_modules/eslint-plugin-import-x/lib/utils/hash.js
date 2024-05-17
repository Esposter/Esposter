"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashObject = exports.hashArray = exports.hashify = void 0;
const node_crypto_1 = require("node:crypto");
function hashify(value, hash) {
    hash !== null && hash !== void 0 ? hash : (hash = (0, node_crypto_1.createHash)('sha256'));
    if (Array.isArray(value)) {
        hashArray(value, hash);
    }
    else if (value instanceof Object) {
        hashObject(value, hash);
    }
    else {
        hash.update(JSON.stringify(value) || 'undefined');
    }
    return hash;
}
exports.hashify = hashify;
function hashArray(array, hash) {
    hash !== null && hash !== void 0 ? hash : (hash = (0, node_crypto_1.createHash)('sha256'));
    hash.update('[');
    for (const element of array) {
        hashify(element, hash);
        hash.update(',');
    }
    hash.update(']');
    return hash;
}
exports.hashArray = hashArray;
function hashObject(object, hash) {
    hash !== null && hash !== void 0 ? hash : (hash = (0, node_crypto_1.createHash)('sha256'));
    hash.update('{');
    for (const key of Object.keys(object).sort()) {
        hash.update(JSON.stringify(key));
        hash.update(':');
        hashify(object[key], hash);
        hash.update(',');
    }
    hash.update('}');
    return hash;
}
exports.hashObject = hashObject;
//# sourceMappingURL=hash.js.map