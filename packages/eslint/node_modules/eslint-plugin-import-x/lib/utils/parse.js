"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const module_require_1 = require("./module-require");
const log = (0, debug_1.default)('eslint-plugin-import-x:parse');
function keysFromParser(parserPath, parserInstance, parsedResult) {
    if (parsedResult && parsedResult.visitorKeys) {
        return parsedResult.visitorKeys;
    }
    if (typeof parserPath === 'string' && /.*espree.*/.test(parserPath)) {
        return parserInstance.VisitorKeys;
    }
    return null;
}
function makeParseReturn(ast, visitorKeys) {
    return {
        ast,
        visitorKeys,
    };
}
function stripUnicodeBOM(text) {
    return text.codePointAt(0) === 65279 ? text.slice(1) : text;
}
function transformHashbang(text) {
    return text.replace(/^#!([^\r\n]+)/u, (_, captured) => `//${captured}`);
}
function parse(path, content, context) {
    var _a;
    if (context == null) {
        throw new Error('need context to parse properly');
    }
    let parserOptions = ('languageOptions' in context && ((_a = context.languageOptions) === null || _a === void 0 ? void 0 : _a.parserOptions)) ||
        context.parserOptions;
    const parserOrPath = getParser(path, context);
    if (!parserOrPath) {
        throw new Error('parserPath or languageOptions.parser is required!');
    }
    parserOptions = Object.assign({}, parserOptions);
    parserOptions.ecmaFeatures = Object.assign({}, parserOptions.ecmaFeatures);
    parserOptions.comment = true;
    parserOptions.attachComment = true;
    parserOptions.tokens = true;
    parserOptions.loc = true;
    parserOptions.range = true;
    parserOptions.filePath = path;
    delete parserOptions.EXPERIMENTAL_useProjectService;
    delete parserOptions.project;
    delete parserOptions.projects;
    const parser = typeof parserOrPath === 'string'
        ? (0, module_require_1.moduleRequire)(parserOrPath)
        : parserOrPath;
    content = transformHashbang(stripUnicodeBOM(String(content)));
    if ('parseForESLint' in parser &&
        typeof parser.parseForESLint === 'function') {
        let ast;
        try {
            const parserRaw = parser.parseForESLint(content, parserOptions);
            ast = parserRaw.ast;
            return makeParseReturn(ast, keysFromParser(parserOrPath, parser, parserRaw));
        }
        catch (error_) {
            const error = error_;
            console.warn(`Error while parsing ${parserOptions.filePath}`);
            console.warn(`Line ${error.lineNumber}, column ${error.column}: ${error.message}`);
        }
        if (!ast || typeof ast !== 'object') {
            console.warn(`\`parseForESLint\` from parser \`${typeof parserOrPath === 'string' ? parserOrPath : '`context.languageOptions.parser`'}\` is invalid and will just be ignored`);
        }
        else {
            return makeParseReturn(ast, keysFromParser(parserOrPath, parser));
        }
    }
    if ('parse' in parser) {
        const ast = parser.parse(content, parserOptions);
        return makeParseReturn(ast, keysFromParser(parserOrPath, parser));
    }
    throw new Error('Parser must expose a `parse` or `parseForESLint` method');
}
exports.parse = parse;
function getParser(path, context) {
    var _a;
    const parserPath = getParserPath(path, context);
    if (parserPath) {
        return parserPath;
    }
    const parser = 'languageOptions' in context && ((_a = context.languageOptions) === null || _a === void 0 ? void 0 : _a.parser);
    if (parser &&
        typeof parser !== 'string' &&
        (('parse' in parser && typeof parse === 'function') ||
            ('parseForESLint' in parser &&
                typeof parser.parseForESLint === 'function'))) {
        return parser;
    }
    return null;
}
function getParserPath(filepath, context) {
    const parsers = context.settings['import-x/parsers'];
    if (parsers != null) {
        const extension = node_path_1.default.extname(filepath);
        for (const parserPath in parsers) {
            if (parsers[parserPath].includes(extension)) {
                log('using alt parser:', parserPath);
                return parserPath;
            }
        }
    }
    return context.parserPath;
}
//# sourceMappingURL=parse.js.map