"use strict";
const tslib_1 = require("tslib");
const node_vm_1 = tslib_1.__importDefault(require("node:vm"));
const utils_1 = require("../utils");
module.exports = (0, utils_1.createRule)({
    name: 'dynamic-import-chunkname',
    meta: {
        type: 'suggestion',
        docs: {
            category: 'Style guide',
            description: 'Enforce a leading comment with the webpackChunkName for dynamic imports.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    importFunctions: {
                        type: 'array',
                        uniqueItems: true,
                        items: {
                            type: 'string',
                        },
                    },
                    allowEmpty: {
                        type: 'boolean',
                    },
                    webpackChunknameFormat: {
                        type: 'string',
                    },
                },
            },
        ],
        messages: {
            leadingComment: 'dynamic imports require a leading comment with the webpack chunkname',
            blockComment: 'dynamic imports require a /* foo */ style comment, not a // foo comment',
            paddedSpaces: 'dynamic imports require a block comment padded with spaces - /* foo */',
            webpackComment: 'dynamic imports require a "webpack" comment with valid syntax',
            chunknameFormat: 'dynamic imports require a leading comment in the form /*{{format}}*/',
        },
    },
    defaultOptions: [],
    create(context) {
        const { importFunctions = [], allowEmpty = false, webpackChunknameFormat = '([0-9a-zA-Z-_/.]|\\[(request|index)\\])+', } = context.options[0] || {};
        const paddedCommentRegex = /^ (\S[\S\s]+\S) $/;
        const commentStyleRegex = /^( ((webpackChunkName: .+)|((webpackPrefetch|webpackPreload): (true|false|-?\d+))|(webpackIgnore: (true|false))|((webpackInclude|webpackExclude): \/.*\/)|(webpackMode: ["'](lazy|lazy-once|eager|weak)["'])|(webpackExports: (["']\w+["']|\[(["']\w+["'], *)+(["']\w+["']*)]))),?)+ $/;
        const chunkSubstrFormat = ` webpackChunkName: ["']${webpackChunknameFormat}["'],? `;
        const chunkSubstrRegex = new RegExp(chunkSubstrFormat);
        function run(node, arg) {
            const { sourceCode } = context;
            const leadingComments = sourceCode.getCommentsBefore(arg);
            if ((!leadingComments || leadingComments.length === 0) && !allowEmpty) {
                context.report({
                    node,
                    messageId: 'leadingComment',
                });
                return;
            }
            let isChunknamePresent = false;
            for (const comment of leadingComments) {
                if (comment.type !== 'Block') {
                    context.report({
                        node,
                        messageId: 'blockComment',
                    });
                    return;
                }
                if (!paddedCommentRegex.test(comment.value)) {
                    context.report({
                        node,
                        messageId: 'paddedSpaces',
                    });
                    return;
                }
                try {
                    node_vm_1.default.runInNewContext(`(function() {return {${comment.value}}})()`);
                }
                catch (_a) {
                    context.report({
                        node,
                        messageId: 'webpackComment',
                    });
                    return;
                }
                if (!commentStyleRegex.test(comment.value)) {
                    context.report({
                        node,
                        messageId: 'webpackComment',
                    });
                    return;
                }
                if (chunkSubstrRegex.test(comment.value)) {
                    isChunknamePresent = true;
                }
            }
            if (!isChunknamePresent && !allowEmpty) {
                context.report({
                    node,
                    messageId: 'chunknameFormat',
                    data: {
                        format: chunkSubstrFormat,
                    },
                });
            }
        }
        return {
            ImportExpression(node) {
                run(node, node.source);
            },
            CallExpression(node) {
                if (node.callee.type !== 'Import' &&
                    'name' in node.callee &&
                    !importFunctions.includes(node.callee.name)) {
                    return;
                }
                run(node, node.arguments[0]);
            },
        };
    },
});
//# sourceMappingURL=dynamic-import-chunkname.js.map