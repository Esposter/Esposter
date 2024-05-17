"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePackageName = exports.getFilePackagePath = exports.getContextPackagePath = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const pkg_up_1 = require("./pkg-up");
const read_pkg_up_1 = require("./read-pkg-up");
function getContextPackagePath(context) {
    return getFilePackagePath(context.physicalFilename);
}
exports.getContextPackagePath = getContextPackagePath;
function getFilePackagePath(filename) {
    return node_path_1.default.dirname((0, pkg_up_1.pkgUp)({ cwd: filename }));
}
exports.getFilePackagePath = getFilePackagePath;
function getFilePackageName(filename) {
    const { pkg, path: pkgPath } = (0, read_pkg_up_1.readPkgUp)({ cwd: filename });
    if (pkg) {
        return pkg.name || getFilePackageName(node_path_1.default.resolve(pkgPath, '../..'));
    }
    return null;
}
exports.getFilePackageName = getFilePackageName;
//# sourceMappingURL=package-path.js.map