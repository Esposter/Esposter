"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaredScope = void 0;
const get_scope_1 = require("./get-scope");
function declaredScope(context, node, name) {
    const references = (0, get_scope_1.getScope)(context, node).references;
    const reference = references.find(x => x.identifier.name === name);
    if (!reference || !reference.resolved) {
        return;
    }
    return reference.resolved.scope.type;
}
exports.declaredScope = declaredScope;
//# sourceMappingURL=declared-scope.js.map