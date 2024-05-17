"use strict";
const tslib_1 = require("tslib");
const semver_1 = tslib_1.__importDefault(require("semver"));
const utils_1 = require("../utils");
let typescriptPkg;
try {
    typescriptPkg = require('typescript/package.json');
}
catch (_a) {
}
function checkImports(imported, context) {
    for (const [module, nodes] of imported.entries()) {
        if (nodes.length > 1) {
            const [first, ...rest] = nodes;
            const { sourceCode } = context;
            const fix = getFix(first, rest, sourceCode, context);
            context.report({
                node: first.source,
                messageId: 'duplicate',
                data: {
                    module,
                },
                fix,
            });
            for (const node of rest) {
                context.report({
                    node: node.source,
                    messageId: 'duplicate',
                    data: {
                        module,
                    },
                });
            }
        }
    }
}
function getFix(first, rest, sourceCode, context) {
    if (typeof sourceCode.getCommentsBefore !== 'function') {
        return;
    }
    if (hasProblematicComments(first, sourceCode) || hasNamespace(first)) {
        return;
    }
    const defaultImportNames = new Set([first, ...rest].flatMap(x => getDefaultImportName(x) || []));
    if (defaultImportNames.size > 1) {
        return;
    }
    const restWithoutComments = rest.filter(node => !hasProblematicComments(node, sourceCode) && !hasNamespace(node));
    const specifiers = restWithoutComments
        .map(node => {
        const tokens = sourceCode.getTokens(node);
        const openBrace = tokens.find(token => isPunctuator(token, '{'));
        const closeBrace = tokens.find(token => isPunctuator(token, '}'));
        if (openBrace == null || closeBrace == null) {
            return;
        }
        return {
            importNode: node,
            identifiers: sourceCode.text
                .slice(openBrace.range[1], closeBrace.range[0])
                .split(','),
            isEmpty: !hasSpecifiers(node),
        };
    })
        .filter(Boolean);
    const unnecessaryImports = restWithoutComments.filter(node => !hasSpecifiers(node) &&
        !hasNamespace(node) &&
        !specifiers.some(specifier => 'importNode' in specifier && specifier.importNode === node));
    const shouldAddDefault = getDefaultImportName(first) == null && defaultImportNames.size === 1;
    const shouldAddSpecifiers = specifiers.length > 0;
    const shouldRemoveUnnecessary = unnecessaryImports.length > 0;
    if (!(shouldAddDefault || shouldAddSpecifiers || shouldRemoveUnnecessary)) {
        return;
    }
    return (fixer) => {
        const tokens = sourceCode.getTokens(first);
        const openBrace = tokens.find(token => isPunctuator(token, '{'));
        const closeBrace = tokens.find(token => isPunctuator(token, '}'));
        const firstToken = sourceCode.getFirstToken(first);
        const [defaultImportName] = defaultImportNames;
        const firstHasTrailingComma = closeBrace != null &&
            isPunctuator(sourceCode.getTokenBefore(closeBrace), ',');
        const firstIsEmpty = !hasSpecifiers(first);
        const firstExistingIdentifiers = firstIsEmpty
            ? new Set()
            : new Set(sourceCode.text
                .slice(openBrace.range[1], closeBrace.range[0])
                .split(',')
                .map(x => x.trim()));
        const [specifiersText] = specifiers.reduce(([result, needsComma, existingIdentifiers], specifier) => {
            const isTypeSpecifier = 'importNode' in specifier &&
                specifier.importNode.importKind === 'type';
            const preferInline = context.options[0] && context.options[0]['prefer-inline'];
            if (preferInline &&
                (!typescriptPkg ||
                    !semver_1.default.satisfies(typescriptPkg.version, '>= 4.5'))) {
                throw new Error('Your version of TypeScript does not support inline type imports.');
            }
            const [specifierText, updatedExistingIdentifiers] = specifier.identifiers.reduce(([text, set], cur) => {
                const trimmed = cur.trim();
                const curWithType = trimmed.length > 0 && preferInline && isTypeSpecifier
                    ? `type ${cur}`
                    : cur;
                if (existingIdentifiers.has(trimmed)) {
                    return [text, set];
                }
                return [
                    text.length > 0 ? `${text},${curWithType}` : curWithType,
                    set.add(trimmed),
                ];
            }, ['', existingIdentifiers]);
            return [
                needsComma && !specifier.isEmpty && specifierText.length > 0
                    ? `${result},${specifierText}`
                    : `${result}${specifierText}`,
                specifier.isEmpty ? needsComma : true,
                updatedExistingIdentifiers,
            ];
        }, ['', !firstHasTrailingComma && !firstIsEmpty, firstExistingIdentifiers]);
        const fixes = [];
        if (shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
            fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName}, {${specifiersText}} from`));
        }
        else if (shouldAddDefault && openBrace == null && !shouldAddSpecifiers) {
            fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName} from`));
        }
        else if (shouldAddDefault && openBrace != null && closeBrace != null) {
            fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName},`));
            if (shouldAddSpecifiers) {
                fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
            }
        }
        else if (!shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
            if (first.specifiers.length === 0) {
                fixes.push(fixer.insertTextAfter(firstToken, ` {${specifiersText}} from`));
            }
            else {
                fixes.push(fixer.insertTextAfter(first.specifiers[0], `, {${specifiersText}}`));
            }
        }
        else if (!shouldAddDefault && openBrace != null && closeBrace != null) {
            fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
        }
        for (const specifier of specifiers) {
            const importNode = specifier.importNode;
            fixes.push(fixer.remove(importNode));
            const charAfterImportRange = [
                importNode.range[1],
                importNode.range[1] + 1,
            ];
            const charAfterImport = sourceCode.text.slice(charAfterImportRange[0], charAfterImportRange[1]);
            if (charAfterImport === '\n') {
                fixes.push(fixer.removeRange(charAfterImportRange));
            }
        }
        for (const node of unnecessaryImports) {
            fixes.push(fixer.remove(node));
            const charAfterImportRange = [node.range[1], node.range[1] + 1];
            const charAfterImport = sourceCode.text.slice(charAfterImportRange[0], charAfterImportRange[1]);
            if (charAfterImport === '\n') {
                fixes.push(fixer.removeRange(charAfterImportRange));
            }
        }
        return fixes;
    };
}
function isPunctuator(node, value) {
    return node.type === 'Punctuator' && node.value === value;
}
function getDefaultImportName(node) {
    const defaultSpecifier = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
    return defaultSpecifier == null ? undefined : defaultSpecifier.local.name;
}
function hasNamespace(node) {
    const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportNamespaceSpecifier');
    return specifiers.length > 0;
}
function hasSpecifiers(node) {
    const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');
    return specifiers.length > 0;
}
function hasProblematicComments(node, sourceCode) {
    return (hasCommentBefore(node, sourceCode) ||
        hasCommentAfter(node, sourceCode) ||
        hasCommentInsideNonSpecifiers(node, sourceCode));
}
function hasCommentBefore(node, sourceCode) {
    return sourceCode
        .getCommentsBefore(node)
        .some(comment => comment.loc.end.line >= node.loc.start.line - 1);
}
function hasCommentAfter(node, sourceCode) {
    return sourceCode
        .getCommentsAfter(node)
        .some(comment => comment.loc.start.line === node.loc.end.line);
}
function hasCommentInsideNonSpecifiers(node, sourceCode) {
    const tokens = sourceCode.getTokens(node);
    const openBraceIndex = tokens.findIndex(token => isPunctuator(token, '{'));
    const closeBraceIndex = tokens.findIndex(token => isPunctuator(token, '}'));
    const someTokens = openBraceIndex >= 0 && closeBraceIndex >= 0
        ? [
            ...tokens.slice(1, openBraceIndex + 1),
            ...tokens.slice(closeBraceIndex + 1),
        ]
        : tokens.slice(1);
    return someTokens.some(token => sourceCode.getCommentsBefore(token).length > 0);
}
module.exports = (0, utils_1.createRule)({
    name: 'no-duplicates',
    meta: {
        type: 'problem',
        docs: {
            category: 'Style guide',
            description: 'Forbid repeated import of the same module in multiple places.',
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    considerQueryString: {
                        type: 'boolean',
                    },
                    'prefer-inline': {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            duplicate: "'{{module}}' imported multiple times.",
        },
    },
    defaultOptions: [],
    create(context) {
        var _a;
        const considerQueryStringOption = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.considerQueryString;
        const defaultResolver = (sourcePath) => (0, utils_1.resolve)(sourcePath, context) || sourcePath;
        const resolver = considerQueryStringOption
            ? (sourcePath) => {
                const parts = sourcePath.match(/^([^?]*)\?(.*)$/);
                if (!parts) {
                    return defaultResolver(sourcePath);
                }
                return `${defaultResolver(parts[1])}?${parts[2]}`;
            }
            : defaultResolver;
        const moduleMaps = new Map();
        function getImportMap(n) {
            var _a;
            const parent = n.parent;
            if (!moduleMaps.has(parent)) {
                moduleMaps.set(parent, {
                    imported: new Map(),
                    nsImported: new Map(),
                    defaultTypesImported: new Map(),
                    namedTypesImported: new Map(),
                });
            }
            const map = moduleMaps.get(parent);
            const preferInline = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a['prefer-inline'];
            if (!preferInline && n.importKind === 'type') {
                return n.specifiers.length > 0 &&
                    n.specifiers[0].type === 'ImportDefaultSpecifier'
                    ? map.defaultTypesImported
                    : map.namedTypesImported;
            }
            if (!preferInline &&
                n.specifiers.some(spec => 'importKind' in spec && spec.importKind === 'type')) {
                return map.namedTypesImported;
            }
            return hasNamespace(n) ? map.nsImported : map.imported;
        }
        return {
            ImportDeclaration(n) {
                const resolvedPath = resolver(n.source.value);
                const importMap = getImportMap(n);
                if (importMap.has(resolvedPath)) {
                    importMap.get(resolvedPath).push(n);
                }
                else {
                    importMap.set(resolvedPath, [n]);
                }
            },
            'Program:exit'() {
                for (const map of moduleMaps.values()) {
                    checkImports(map.imported, context);
                    checkImports(map.nsImported, context);
                    checkImports(map.defaultTypesImported, context);
                    checkImports(map.namedTypesImported, context);
                }
            },
        };
    },
});
//# sourceMappingURL=no-duplicates.js.map