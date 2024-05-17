"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.relative = exports.fileExistsWithCaseSync = exports.CASE_SENSITIVE_FS = void 0;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_module_1 = require("node:module");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const hash_1 = require("./hash");
const module_cache_1 = require("./module-cache");
const pkg_dir_1 = require("./pkg-dir");
exports.CASE_SENSITIVE_FS = !node_fs_1.default.existsSync(node_path_1.default.resolve(__dirname, node_path_1.default.basename(__filename).replace(/^resolve\./, 'reSOLVE.')));
const ERROR_NAME = 'EslintPluginImportResolveError';
const fileExistsCache = new module_cache_1.ModuleCache();
function tryRequire(target, sourceFile) {
    let resolved;
    try {
        if (sourceFile == null) {
            resolved = require.resolve(target);
        }
        else {
            try {
                resolved = (0, node_module_1.createRequire)(node_path_1.default.resolve(sourceFile)).resolve(target);
            }
            catch (_a) {
                resolved = require.resolve(target);
            }
        }
    }
    catch (_b) {
        return undefined;
    }
    return require(resolved);
}
function fileExistsWithCaseSync(filepath, cacheSettings, strict) {
    if (exports.CASE_SENSITIVE_FS) {
        return true;
    }
    if (filepath === null) {
        return true;
    }
    if (filepath.toLowerCase() === process.cwd().toLowerCase() && !strict) {
        return true;
    }
    const parsedPath = node_path_1.default.parse(filepath);
    const dir = parsedPath.dir;
    let result = fileExistsCache.get(filepath, cacheSettings);
    if (result != null) {
        return result;
    }
    if (dir === '' || parsedPath.root === filepath) {
        result = true;
    }
    else {
        const filenames = node_fs_1.default.readdirSync(dir);
        result = filenames.includes(parsedPath.base)
            ? fileExistsWithCaseSync(dir, cacheSettings, strict)
            : false;
    }
    fileExistsCache.set(filepath, result);
    return result;
}
exports.fileExistsWithCaseSync = fileExistsWithCaseSync;
let prevSettings = null;
let memoizedHash;
function fullResolve(modulePath, sourceFile, settings) {
    const coreSet = new Set(settings['import-x/core-modules']);
    if (coreSet.has(modulePath)) {
        return {
            found: true,
            path: null,
        };
    }
    const sourceDir = node_path_1.default.dirname(sourceFile);
    if (prevSettings !== settings) {
        memoizedHash = (0, hash_1.hashObject)(settings).digest('hex');
        prevSettings = settings;
    }
    const cacheKey = sourceDir + memoizedHash + modulePath;
    const cacheSettings = module_cache_1.ModuleCache.getSettings(settings);
    const cachedPath = fileExistsCache.get(cacheKey, cacheSettings);
    if (cachedPath !== undefined) {
        return { found: true, path: cachedPath };
    }
    function cache(resolvedPath) {
        fileExistsCache.set(cacheKey, resolvedPath);
    }
    function withResolver(resolver, config) {
        if (resolver.interfaceVersion === 2) {
            return resolver.resolve(modulePath, sourceFile, config);
        }
        try {
            const resolved = resolver.resolveImport(modulePath, sourceFile, config);
            if (resolved === undefined) {
                return {
                    found: false,
                };
            }
            return {
                found: true,
                path: resolved,
            };
        }
        catch (_a) {
            return {
                found: false,
            };
        }
    }
    const configResolvers = settings['import-x/resolver'] || {
        node: settings['import-x/resolve'],
    };
    const resolvers = resolverReducer(configResolvers, new Map());
    for (const [name, config] of resolvers) {
        const resolver = requireResolver(name, sourceFile);
        const resolved = withResolver(resolver, config);
        if (!resolved.found) {
            continue;
        }
        cache(resolved.path);
        return resolved;
    }
    return { found: false };
}
function relative(modulePath, sourceFile, settings) {
    return fullResolve(modulePath, sourceFile, settings).path;
}
exports.relative = relative;
function resolverReducer(resolvers, map) {
    if (Array.isArray(resolvers)) {
        for (const r of resolvers)
            resolverReducer(r, map);
        return map;
    }
    if (typeof resolvers === 'string') {
        map.set(resolvers, null);
        return map;
    }
    if (typeof resolvers === 'object') {
        for (const [key, value] of Object.entries(resolvers)) {
            map.set(key, value);
        }
        return map;
    }
    const err = new Error('invalid resolver config');
    err.name = ERROR_NAME;
    throw err;
}
function getBaseDir(sourceFile) {
    return (0, pkg_dir_1.pkgDir)(sourceFile) || process.cwd();
}
function requireResolver(name, sourceFile) {
    const resolver = tryRequire(`eslint-import-resolver-${name}`, sourceFile) ||
        tryRequire(name, sourceFile) ||
        tryRequire(node_path_1.default.resolve(getBaseDir(sourceFile), name));
    if (!resolver) {
        const err = new Error(`unable to load resolver "${name}".`);
        err.name = ERROR_NAME;
        throw err;
    }
    if (!isResolverValid(resolver)) {
        const err = new Error(`${name} with invalid interface loaded as resolver`);
        err.name = ERROR_NAME;
        throw err;
    }
    return resolver;
}
function isResolverValid(resolver) {
    if ('interfaceVersion' in resolver && resolver.interfaceVersion === 2) {
        return ('resolve' in resolver &&
            !!resolver.resolve &&
            typeof resolver.resolve === 'function');
    }
    return ('resolveImport' in resolver &&
        !!resolver.resolveImport &&
        typeof resolver.resolveImport === 'function');
}
const erroredContexts = new Set();
function resolve(p, context) {
    try {
        return relative(p, context.physicalFilename, context.settings);
    }
    catch (error_) {
        const error = error_;
        if (!erroredContexts.has(context)) {
            let errMessage = error.message;
            if (error.name !== ERROR_NAME && error.stack) {
                errMessage = error.stack.replace(/^Error: /, '');
            }
            context.report({
                message: `Resolve error: ${errMessage}`,
                loc: {
                    line: 1,
                    column: 0,
                },
            });
            erroredContexts.add(context);
        }
    }
}
exports.resolve = resolve;
//# sourceMappingURL=resolve.js.map