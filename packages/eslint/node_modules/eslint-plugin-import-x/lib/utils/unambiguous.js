"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnambiguousModule = exports.isMaybeUnambiguousModule = void 0;
const pattern = /(^|;)\s*(export|import)((\s+\w)|(\s*[*={]))|import\(/m;
function isMaybeUnambiguousModule(content) {
    return pattern.test(content);
}
exports.isMaybeUnambiguousModule = isMaybeUnambiguousModule;
const unambiguousNodeType = /^(?:(?:Exp|Imp)ort.*Declaration|TSExportAssignment)$/;
function isUnambiguousModule(ast) {
    return ast.body && ast.body.some(node => unambiguousNodeType.test(node.type));
}
exports.isUnambiguousModule = isUnambiguousModule;
//# sourceMappingURL=unambiguous.js.map