"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pkgDir = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const pkg_up_1 = require("./pkg-up");
function pkgDir(cwd) {
    const fp = (0, pkg_up_1.pkgUp)({ cwd });
    return fp ? node_path_1.default.dirname(fp) : null;
}
exports.pkgDir = pkgDir;
//# sourceMappingURL=pkg-dir.js.map