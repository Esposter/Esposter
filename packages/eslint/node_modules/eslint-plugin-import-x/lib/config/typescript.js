"use strict";
const typeScriptExtensions = ['.ts', '.tsx'];
const allExtensions = [...typeScriptExtensions, '.js', '.jsx'];
module.exports = {
    settings: {
        'import-x/extensions': allExtensions,
        'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
        'import-x/parsers': {
            '@typescript-eslint/parser': [...typeScriptExtensions, '.cts', '.mts'],
        },
        'import-x/resolver': {
            node: {
                extensions: allExtensions,
            },
        },
    },
    rules: {
        'import-x/named': 'off',
    },
};
//# sourceMappingURL=typescript.js.map