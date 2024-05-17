"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recursivePatternCapture = exports.ExportMap = void 0;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const doctrine_1 = tslib_1.__importDefault(require("doctrine"));
const eslint_1 = require("eslint");
const get_tsconfig_1 = require("get-tsconfig");
const get_value_1 = require("./get-value");
const hash_1 = require("./hash");
const ignore_1 = require("./ignore");
const parse_1 = require("./parse");
const resolve_1 = require("./resolve");
const unambiguous_1 = require("./unambiguous");
const visit_1 = require("./visit");
const log = (0, debug_1.default)('eslint-plugin-import-x:ExportMap');
const exportCache = new Map();
const tsconfigCache = new Map();
class ExportMap {
    static for(context) {
        const { path: filepath } = context;
        const cacheKey = context.cacheKey || (0, hash_1.hashObject)(context).digest('hex');
        let exportMap = exportCache.get(cacheKey);
        if (exportMap === null) {
            return null;
        }
        const stats = node_fs_1.default.statSync(context.path);
        if (exportMap != null &&
            exportMap.mtime.valueOf() - stats.mtime.valueOf() === 0) {
            return exportMap;
        }
        if (!(0, ignore_1.hasValidExtension)(filepath, context)) {
            exportCache.set(cacheKey, null);
            return null;
        }
        if ((0, ignore_1.ignore)(filepath, context)) {
            log('ignored path due to ignore settings:', filepath);
            exportCache.set(cacheKey, null);
            return null;
        }
        const content = node_fs_1.default.readFileSync(filepath, { encoding: 'utf8' });
        if (!(0, unambiguous_1.isMaybeUnambiguousModule)(content)) {
            log('ignored path due to unambiguous regex:', filepath);
            exportCache.set(cacheKey, null);
            return null;
        }
        log('cache miss', cacheKey, 'for path', filepath);
        exportMap = ExportMap.parse(filepath, content, context);
        if (exportMap == null) {
            log('ignored path due to ambiguous parse:', filepath);
            exportCache.set(cacheKey, null);
            return null;
        }
        exportMap.mtime = stats.mtime;
        exportCache.set(cacheKey, exportMap);
        return exportMap;
    }
    static get(source, context) {
        const path = (0, resolve_1.resolve)(source, context);
        if (path == null) {
            return null;
        }
        return ExportMap.for(childContext(path, context));
    }
    static parse(filepath, content, context) {
        var _a, _b;
        const m = new ExportMap(filepath);
        const isEsModuleInteropTrue = isEsModuleInterop();
        let ast;
        let visitorKeys;
        try {
            ;
            ({ ast, visitorKeys } = (0, parse_1.parse)(filepath, content, context));
        }
        catch (error) {
            m.errors.push(error);
            return m;
        }
        m.visitorKeys = visitorKeys;
        let hasDynamicImports = false;
        function processDynamicImport(source) {
            hasDynamicImports = true;
            if (source.type !== 'Literal') {
                return null;
            }
            const p = remotePath(source.value);
            if (p == null) {
                return null;
            }
            const getter = thunkFor(p, context);
            m.imports.set(p, {
                getter,
                declarations: new Set([
                    {
                        source: {
                            value: source.value,
                            loc: source.loc,
                        },
                        importedSpecifiers: new Set(['ImportNamespaceSpecifier']),
                        dynamic: true,
                    },
                ]),
            });
        }
        (0, visit_1.visit)(ast, visitorKeys, {
            ImportExpression(node) {
                processDynamicImport(node.source);
            },
            CallExpression(_node) {
                const node = _node;
                if (node.callee.type === 'Import') {
                    processDynamicImport(node.arguments[0]);
                }
            },
        });
        const unambiguouslyESM = (0, unambiguous_1.isUnambiguousModule)(ast);
        if (!unambiguouslyESM && !hasDynamicImports) {
            return null;
        }
        const docStyles = (context.settings &&
            context.settings['import-x/docstyle']) || ['jsdoc'];
        const docStyleParsers = {};
        for (const style of docStyles) {
            docStyleParsers[style] = availableDocStyleParsers[style];
        }
        if (ast.comments) {
            ast.comments.some(c => {
                if (c.type !== 'Block') {
                    return false;
                }
                try {
                    const doc = doctrine_1.default.parse(c.value, { unwrap: true });
                    if (doc.tags.some(t => t.title === 'module')) {
                        m.doc = doc;
                        return true;
                    }
                }
                catch (_a) {
                }
                return false;
            });
        }
        const namespaces = new Map();
        function remotePath(value) {
            return (0, resolve_1.relative)(value, filepath, context.settings);
        }
        function resolveImport(value) {
            const rp = remotePath(value);
            if (rp == null) {
                return null;
            }
            return ExportMap.for(childContext(rp, context));
        }
        function getNamespace(namespace) {
            if (!namespaces.has(namespace)) {
                return;
            }
            return function () {
                return resolveImport(namespaces.get(namespace));
            };
        }
        function addNamespace(object, identifier) {
            const nsfn = getNamespace((0, get_value_1.getValue)(identifier));
            if (nsfn) {
                Object.defineProperty(object, 'namespace', { get: nsfn });
            }
            return object;
        }
        function processSpecifier(s, n, m) {
            const nsource = ('source' in n &&
                n.source &&
                n.source.value);
            const exportMeta = {};
            let local;
            switch (s.type) {
                case 'ExportDefaultSpecifier': {
                    if (!nsource) {
                        return;
                    }
                    local = 'default';
                    break;
                }
                case 'ExportNamespaceSpecifier': {
                    m.namespace.set(s.exported.name, Object.defineProperty(exportMeta, 'namespace', {
                        get() {
                            return resolveImport(nsource);
                        },
                    }));
                    return;
                }
                case 'ExportAllDeclaration': {
                    m.namespace.set((0, get_value_1.getValue)(s.exported), addNamespace(exportMeta, s.exported));
                    return;
                }
                case 'ExportSpecifier': {
                    if (!('source' in n && n.source)) {
                        m.namespace.set((0, get_value_1.getValue)(s.exported), addNamespace(exportMeta, s.local));
                        return;
                    }
                }
                default: {
                    if ('local' in s) {
                        local = s.local.name;
                    }
                    else {
                        throw new Error('Unknown export specifier type');
                    }
                    break;
                }
            }
            if ('exported' in s) {
                m.reexports.set(s.exported.name, {
                    local,
                    getImport: () => resolveImport(nsource),
                });
            }
        }
        function captureDependencyWithSpecifiers(n) {
            const declarationIsType = 'importKind' in n &&
                (n.importKind === 'type' ||
                    n.importKind === 'typeof');
            let specifiersOnlyImportingTypes = n.specifiers.length > 0;
            const importedSpecifiers = new Set();
            for (const specifier of n.specifiers) {
                if (specifier.type === 'ImportSpecifier') {
                    importedSpecifiers.add((0, get_value_1.getValue)(specifier.imported));
                }
                else if (supportedImportTypes.has(specifier.type)) {
                    importedSpecifiers.add(specifier.type);
                }
                specifiersOnlyImportingTypes =
                    specifiersOnlyImportingTypes &&
                        'importKind' in specifier &&
                        (specifier.importKind === 'type' ||
                            specifier.importKind === 'typeof');
            }
            captureDependency(n, declarationIsType || specifiersOnlyImportingTypes, importedSpecifiers);
        }
        function captureDependency({ source, }, isOnlyImportingTypes, importedSpecifiers = new Set()) {
            if (source == null) {
                return null;
            }
            const p = remotePath(source.value);
            if (p == null) {
                return null;
            }
            const declarationMetadata = {
                source: {
                    value: source.value,
                    loc: source.loc,
                },
                isOnlyImportingTypes,
                importedSpecifiers,
            };
            const existing = m.imports.get(p);
            if (existing != null) {
                existing.declarations.add(declarationMetadata);
                return existing.getter;
            }
            const getter = thunkFor(p, context);
            m.imports.set(p, { getter, declarations: new Set([declarationMetadata]) });
            return getter;
        }
        const source = makeSourceCode(content, ast);
        function isEsModuleInterop() {
            const parserOptions = context.parserOptions || {};
            let tsconfigRootDir = parserOptions.tsconfigRootDir;
            const project = parserOptions.project;
            const cacheKey = (0, hash_1.hashObject)({
                tsconfigRootDir,
                project,
            }).digest('hex');
            let tsConfig = tsconfigCache.get(cacheKey);
            if (tsConfig === undefined) {
                tsconfigRootDir = tsconfigRootDir || process.cwd();
                let tsconfigResult;
                if (project) {
                    const projects = Array.isArray(project) ? project : [project];
                    for (const project of projects) {
                        tsconfigResult = (0, get_tsconfig_1.getTsconfig)(project === true
                            ? context.filename
                            : node_path_1.default.resolve(tsconfigRootDir, project));
                        if (tsconfigResult) {
                            break;
                        }
                    }
                }
                else {
                    tsconfigResult = (0, get_tsconfig_1.getTsconfig)(tsconfigRootDir);
                }
                tsConfig = (tsconfigResult && tsconfigResult.config) || null;
                tsconfigCache.set(cacheKey, tsConfig);
            }
            return tsConfig && tsConfig.compilerOptions
                ? tsConfig.compilerOptions.esModuleInterop
                : false;
        }
        for (const n of ast.body) {
            if (n.type === 'ExportDefaultDeclaration') {
                const exportMeta = captureDoc(source, docStyleParsers, n);
                if (n.declaration.type === 'Identifier') {
                    addNamespace(exportMeta, n.declaration);
                }
                m.namespace.set('default', exportMeta);
                continue;
            }
            if (n.type === 'ExportAllDeclaration') {
                if (n.exported) {
                    namespaces.set(n.exported.name, n.source.value);
                    processSpecifier(n, n.exported, m);
                }
                else {
                    const getter = captureDependency(n, n.exportKind === 'type');
                    if (getter) {
                        m.dependencies.add(getter);
                    }
                }
                continue;
            }
            if (n.type === 'ImportDeclaration') {
                captureDependencyWithSpecifiers(n);
                const ns = n.specifiers.find(s => s.type === 'ImportNamespaceSpecifier');
                if (ns) {
                    namespaces.set(ns.local.name, n.source.value);
                }
                continue;
            }
            if (n.type === 'ExportNamedDeclaration') {
                captureDependencyWithSpecifiers(n);
                if (n.declaration != null) {
                    switch (n.declaration.type) {
                        case 'FunctionDeclaration':
                        case 'ClassDeclaration':
                        case 'TypeAlias':
                        case 'InterfaceDeclaration':
                        case 'DeclareFunction':
                        case 'TSDeclareFunction':
                        case 'TSEnumDeclaration':
                        case 'TSTypeAliasDeclaration':
                        case 'TSInterfaceDeclaration':
                        case 'TSAbstractClassDeclaration':
                        case 'TSModuleDeclaration': {
                            m.namespace.set(n.declaration.id.name, captureDoc(source, docStyleParsers, n));
                            break;
                        }
                        case 'VariableDeclaration': {
                            for (const d of n.declaration.declarations) {
                                recursivePatternCapture(d.id, id => m.namespace.set(id.name, captureDoc(source, docStyleParsers, d, n)));
                            }
                            break;
                        }
                        default:
                    }
                }
                for (const s of n.specifiers) {
                    processSpecifier(s, n, m);
                }
            }
            const exports = ['TSExportAssignment'];
            if (isEsModuleInteropTrue) {
                exports.push('TSNamespaceExportDeclaration');
            }
            if (exports.includes(n.type)) {
                const exportedName = n.type === 'TSNamespaceExportDeclaration'
                    ? (n.id ||
                        n.name).name
                    : ('expression' in n &&
                        n.expression &&
                        (('name' in n.expression && n.expression.name) ||
                            ('id' in n.expression &&
                                n.expression.id &&
                                n.expression.id.name))) ||
                        null;
                const declTypes = new Set([
                    'VariableDeclaration',
                    'ClassDeclaration',
                    'TSDeclareFunction',
                    'TSEnumDeclaration',
                    'TSTypeAliasDeclaration',
                    'TSInterfaceDeclaration',
                    'TSAbstractClassDeclaration',
                    'TSModuleDeclaration',
                ]);
                const getRoot = (node) => {
                    if (node.left.type === 'TSQualifiedName') {
                        return getRoot(node.left);
                    }
                    return node.left;
                };
                const exportedDecls = ast.body.filter(node => {
                    return (declTypes.has(node.type) &&
                        (('id' in node &&
                            node.id &&
                            ('name' in node.id
                                ? node.id.name === exportedName
                                : 'left' in node.id &&
                                    getRoot(node.id).name === exportedName)) ||
                            ('declarations' in node &&
                                node.declarations.find(d => 'name' in d.id && d.id.name === exportedName))));
                });
                if (exportedDecls.length === 0) {
                    m.namespace.set('default', captureDoc(source, docStyleParsers, n));
                    continue;
                }
                if (isEsModuleInteropTrue &&
                    !m.namespace.has('default')) {
                    m.namespace.set('default', {});
                }
                for (const decl of exportedDecls) {
                    if (decl.type === 'TSModuleDeclaration') {
                        const type = (_a = decl.body) === null || _a === void 0 ? void 0 : _a.type;
                        if (type === 'TSModuleDeclaration') {
                            m.namespace.set(decl.body.id.name, captureDoc(source, docStyleParsers, decl.body));
                            continue;
                        }
                        else if (type === 'TSModuleBlock' && decl.kind === 'namespace') {
                            const metadata = captureDoc(source, docStyleParsers, decl.body);
                            if ('name' in decl.id) {
                                m.namespace.set(decl.id.name, metadata);
                            }
                            else {
                                m.namespace.set(decl.id.right.name, metadata);
                            }
                        }
                        if ((_b = decl.body) === null || _b === void 0 ? void 0 : _b.body) {
                            for (const moduleBlockNode of decl.body.body) {
                                const namespaceDecl = moduleBlockNode.type === 'ExportNamedDeclaration'
                                    ? moduleBlockNode.declaration
                                    : moduleBlockNode;
                                if (!namespaceDecl) {
                                }
                                else if (namespaceDecl.type === 'VariableDeclaration') {
                                    for (const d of namespaceDecl.declarations)
                                        recursivePatternCapture(d.id, id => m.namespace.set(id.name, captureDoc(source, docStyleParsers, decl, namespaceDecl, moduleBlockNode)));
                                }
                                else if ('id' in namespaceDecl) {
                                    m.namespace.set(namespaceDecl.id.name, captureDoc(source, docStyleParsers, moduleBlockNode));
                                }
                            }
                        }
                    }
                    else {
                        m.namespace.set('default', captureDoc(source, docStyleParsers, decl));
                    }
                }
            }
        }
        if (isEsModuleInteropTrue &&
            m.namespace.size > 0 &&
            !m.namespace.has('default')) {
            m.namespace.set('default', {});
        }
        if (unambiguouslyESM) {
            m.parseGoal = 'Module';
        }
        return m;
    }
    constructor(path) {
        this.path = path;
        this.namespace = new Map();
        this.reexports = new Map();
        this.dependencies = new Set();
        this.imports = new Map();
        this.errors = [];
        this.parseGoal = 'ambiguous';
    }
    get hasDefault() {
        return this.get('default') != null;
    }
    get size() {
        let size = this.namespace.size + this.reexports.size;
        for (const dep of this.dependencies) {
            const d = dep();
            if (d == null) {
                continue;
            }
            size += d.size;
        }
        return size;
    }
    has(name) {
        if (this.namespace.has(name)) {
            return true;
        }
        if (this.reexports.has(name)) {
            return true;
        }
        if (name !== 'default') {
            for (const dep of this.dependencies) {
                const innerMap = dep();
                if (!innerMap) {
                    continue;
                }
                if (innerMap.has(name)) {
                    return true;
                }
            }
        }
        return false;
    }
    hasDeep(name) {
        if (this.namespace.has(name)) {
            return { found: true, path: [this] };
        }
        if (this.reexports.has(name)) {
            const reexports = this.reexports.get(name);
            const imported = reexports.getImport();
            if (imported == null) {
                return { found: true, path: [this] };
            }
            if (imported.path === this.path && reexports.local === name) {
                return { found: false, path: [this] };
            }
            const deep = imported.hasDeep(reexports.local);
            deep.path.unshift(this);
            return deep;
        }
        if (name !== 'default') {
            for (const dep of this.dependencies) {
                const innerMap = dep();
                if (innerMap == null) {
                    return { found: true, path: [this] };
                }
                if (!innerMap) {
                    continue;
                }
                if (innerMap.path === this.path) {
                    continue;
                }
                const innerValue = innerMap.hasDeep(name);
                if (innerValue.found) {
                    innerValue.path.unshift(this);
                    return innerValue;
                }
            }
        }
        return { found: false, path: [this] };
    }
    get(name) {
        if (this.namespace.has(name)) {
            return this.namespace.get(name);
        }
        if (this.reexports.has(name)) {
            const reexports = this.reexports.get(name);
            const imported = reexports.getImport();
            if (imported == null) {
                return null;
            }
            if (imported.path === this.path && reexports.local === name) {
                return undefined;
            }
            return imported.get(reexports.local);
        }
        if (name !== 'default') {
            for (const dep of this.dependencies) {
                const innerMap = dep();
                if (!innerMap) {
                    continue;
                }
                if (innerMap.path === this.path) {
                    continue;
                }
                const innerValue = innerMap.get(name);
                if (innerValue !== undefined) {
                    return innerValue;
                }
            }
        }
    }
    forEach(callback, thisArg) {
        for (const [n, v] of this.namespace.entries()) {
            callback.call(thisArg, v, n, this);
        }
        for (const [name, reexports] of this.reexports.entries()) {
            const reexported = reexports.getImport();
            callback.call(thisArg, reexported === null || reexported === void 0 ? void 0 : reexported.get(reexports.local), name, this);
        }
        this.dependencies.forEach(dep => {
            const d = dep();
            if (d == null) {
                return;
            }
            d.forEach((v, n) => {
                if (n !== 'default') {
                    callback.call(thisArg, v, n, this);
                }
            });
        });
    }
    reportErrors(context, declaration) {
        if (!declaration.source) {
            throw new Error('declaration.source is null');
        }
        const msg = this.errors
            .map(err => `${err.message} (${err.lineNumber}:${err.column})`)
            .join(', ');
        context.report({
            node: declaration.source,
            message: `Parse errors in imported module '${declaration.source.value}': ${msg}`,
        });
    }
}
exports.ExportMap = ExportMap;
function captureDoc(source, docStyleParsers, ...nodes) {
    const metadata = {};
    nodes.some(n => {
        if (!n) {
            return false;
        }
        try {
            let leadingComments;
            if ('leadingComments' in n && Array.isArray(n.leadingComments)) {
                leadingComments = n.leadingComments;
            }
            else if (n.range) {
                leadingComments = source.getCommentsBefore(n);
            }
            if (!leadingComments || leadingComments.length === 0) {
                return false;
            }
            for (const parser of Object.values(docStyleParsers)) {
                const doc = parser(leadingComments);
                if (doc) {
                    metadata.doc = doc;
                }
            }
            return true;
        }
        catch (_a) {
            return false;
        }
    });
    return metadata;
}
const availableDocStyleParsers = {
    jsdoc: captureJsDoc,
    tomdoc: captureTomDoc,
};
function captureJsDoc(comments) {
    let doc;
    for (const comment of comments) {
        if (comment.type !== 'Block') {
            continue;
        }
        try {
            doc = doctrine_1.default.parse(comment.value, { unwrap: true });
        }
        catch (_a) {
        }
    }
    return doc;
}
function captureTomDoc(comments) {
    const lines = [];
    for (const comment of comments) {
        if (/^\s*$/.test(comment.value)) {
            break;
        }
        lines.push(comment.value.trim());
    }
    const statusMatch = lines
        .join(' ')
        .match(/^(Public|Internal|Deprecated):\s*(.+)/);
    if (statusMatch) {
        return {
            description: statusMatch[2],
            tags: [
                {
                    title: statusMatch[1].toLowerCase(),
                    description: statusMatch[2],
                },
            ],
        };
    }
}
const supportedImportTypes = new Set([
    'ImportDefaultSpecifier',
    'ImportNamespaceSpecifier',
]);
function thunkFor(p, context) {
    return () => ExportMap.for(childContext(p, context));
}
function recursivePatternCapture(pattern, callback) {
    switch (pattern.type) {
        case 'Identifier': {
            callback(pattern);
            break;
        }
        case 'ObjectPattern': {
            for (const p of pattern.properties) {
                if (p.type === 'ExperimentalRestProperty' ||
                    p.type === 'RestElement') {
                    callback(p.argument);
                    continue;
                }
                recursivePatternCapture(p.value, callback);
            }
            break;
        }
        case 'ArrayPattern': {
            for (const element of pattern.elements) {
                if (element == null) {
                    continue;
                }
                if (element.type === 'ExperimentalRestProperty' ||
                    element.type === 'RestElement') {
                    callback(element.argument);
                    continue;
                }
                recursivePatternCapture(element, callback);
            }
            break;
        }
        case 'AssignmentPattern': {
            callback(pattern.left);
            break;
        }
        default:
    }
}
exports.recursivePatternCapture = recursivePatternCapture;
let parserOptionsHash = '';
let prevParserOptions = '';
let settingsHash = '';
let prevSettings = '';
function childContext(path, context) {
    const { settings, parserOptions, parserPath } = context;
    if (JSON.stringify(settings) !== prevSettings) {
        settingsHash = (0, hash_1.hashObject)({ settings }).digest('hex');
        prevSettings = JSON.stringify(settings);
    }
    if (JSON.stringify(parserOptions) !== prevParserOptions) {
        parserOptionsHash = (0, hash_1.hashObject)({ parserOptions }).digest('hex');
        prevParserOptions = JSON.stringify(parserOptions);
    }
    return {
        cacheKey: String(parserPath) + parserOptionsHash + settingsHash + String(path),
        settings,
        parserOptions,
        parserPath,
        path,
        filename: 'physicalFilename' in context
            ? context.physicalFilename
            : context.filename,
    };
}
function makeSourceCode(text, ast) {
    if (eslint_1.SourceCode.length > 1) {
        return new eslint_1.SourceCode(text, ast);
    }
    return new eslint_1.SourceCode({ text, ast: ast });
}
//# sourceMappingURL=export-map.js.map