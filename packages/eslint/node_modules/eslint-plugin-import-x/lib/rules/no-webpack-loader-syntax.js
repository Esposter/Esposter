"use strict";
const utils_1 = require("../utils");
module.exports = (0, utils_1.createRule)({
    name: 'no-webpack-loader-syntax',
    meta: {
        type: 'problem',
        docs: {
            category: 'Static analysis',
            description: 'Forbid webpack loader syntax in imports.',
        },
        schema: [],
        messages: {
            unexpected: "Unexpected '!' in '{{name}}'. Do not use import syntax to configure webpack loaders.",
        },
    },
    defaultOptions: [],
    create(context) {
        return (0, utils_1.moduleVisitor)((source, node) => {
            var _a;
            if ((_a = source.value) === null || _a === void 0 ? void 0 : _a.includes('!')) {
                context.report({
                    node,
                    messageId: 'unexpected',
                    data: {
                        name: source.value,
                    },
                });
            }
        }, { commonjs: true });
    },
});
//# sourceMappingURL=no-webpack-loader-syntax.js.map