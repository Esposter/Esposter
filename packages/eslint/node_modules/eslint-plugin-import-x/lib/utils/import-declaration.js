"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importDeclaration = void 0;
const get_ancestors_1 = require("./get-ancestors");
const importDeclaration = (context, node) => {
    const ancestors = (0, get_ancestors_1.getAncestors)(context, node);
    return ancestors[ancestors.length - 1];
};
exports.importDeclaration = importDeclaration;
//# sourceMappingURL=import-declaration.js.map