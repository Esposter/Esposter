"use strict";
const tslib_1 = require("tslib");
const utils_1 = require("@typescript-eslint/utils");
const docs_url_1 = require("../utils/docs-url");
const first_1 = tslib_1.__importDefault(require("./first"));
const createRule = utils_1.ESLintUtils.RuleCreator(ruleName => (0, docs_url_1.docsUrl)(ruleName, '7b25c1cb95ee18acc1531002fd343e1e6031f9ed'));
module.exports = createRule(Object.assign(Object.assign({}, first_1.default), { name: 'imports-first', meta: Object.assign(Object.assign({}, first_1.default.meta), { deprecated: true, docs: {
            category: 'Style guide',
            description: 'Replaced by `import-x/first`.',
        } }) }));
//# sourceMappingURL=imports-first.js.map