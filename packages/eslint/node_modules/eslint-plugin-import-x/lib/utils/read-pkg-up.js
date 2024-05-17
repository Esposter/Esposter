"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPkgUp = void 0;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const pkg_up_1 = require("./pkg-up");
function stripBOM(str) {
    return str.replace(/^\uFEFF/, '');
}
function readPkgUp(opts) {
    const fp = (0, pkg_up_1.pkgUp)(opts);
    if (!fp) {
        return {};
    }
    try {
        return {
            pkg: JSON.parse(stripBOM(node_fs_1.default.readFileSync(fp, { encoding: 'utf8' }))),
            path: fp,
        };
    }
    catch (_a) {
        return {};
    }
}
exports.readPkgUp = readPkgUp;
//# sourceMappingURL=read-pkg-up.js.map