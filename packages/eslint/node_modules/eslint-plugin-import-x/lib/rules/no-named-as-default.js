"use strict";
const utils_1 = require("../utils");
module.exports = (0, utils_1.createRule)({
    name: 'no-named-as-default',
    meta: {
        type: 'problem',
        docs: {
            category: 'Helpful warnings',
            description: 'Forbid use of exported name as identifier of default export.',
        },
        schema: [],
        messages: {
            default: "Using exported name '{{name}}' as identifier for default export.",
        },
    },
    defaultOptions: [],
    create(context) {
        function checkDefault(nameKey, defaultSpecifier) {
            const nameValue = defaultSpecifier[nameKey].name;
            if (nameValue === 'default') {
                return;
            }
            const declaration = (0, utils_1.importDeclaration)(context, defaultSpecifier);
            const imports = utils_1.ExportMap.get(declaration.source.value, context);
            if (imports == null) {
                return;
            }
            if (imports.errors.length > 0) {
                imports.reportErrors(context, declaration);
                return;
            }
            if (imports.has('default') && imports.has(nameValue)) {
                context.report({
                    node: defaultSpecifier,
                    messageId: 'default',
                    data: {
                        name: nameValue,
                    },
                });
            }
        }
        return {
            ImportDefaultSpecifier: checkDefault.bind(null, 'local'),
            ExportDefaultSpecifier: checkDefault.bind(null, 'exported'),
        };
    },
});
//# sourceMappingURL=no-named-as-default.js.map