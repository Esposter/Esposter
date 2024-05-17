"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidExtension = exports.ignore = exports.getFileExtensions = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const log = (0, debug_1.default)('eslint-plugin-import-x:utils:ignore');
let cachedSet;
let lastSettings;
function validExtensions(context) {
    if (cachedSet && context.settings === lastSettings) {
        return cachedSet;
    }
    lastSettings = context.settings;
    cachedSet = getFileExtensions(context.settings);
    return cachedSet;
}
function getFileExtensions(settings) {
    const exts = new Set(settings['import-x/extensions'] || ['.js']);
    if ('import-x/parsers' in settings) {
        for (const parser in settings['import-x/parsers']) {
            const parserSettings = settings['import-x/parsers'][parser];
            if (!Array.isArray(parserSettings)) {
                throw new TypeError(`"settings" for ${parser} must be an array`);
            }
            for (const ext of parserSettings)
                exts.add(ext);
        }
    }
    return exts;
}
exports.getFileExtensions = getFileExtensions;
function ignore(filepath, context) {
    if (!hasValidExtension(filepath, context)) {
        return true;
    }
    const ignoreStrings = context.settings['import-x/ignore'];
    if (!(ignoreStrings === null || ignoreStrings === void 0 ? void 0 : ignoreStrings.length)) {
        return false;
    }
    for (const ignoreString of ignoreStrings) {
        const regex = new RegExp(ignoreString);
        if (regex.test(filepath)) {
            log(`ignoring ${filepath}, matched pattern /${ignoreString}/`);
            return true;
        }
    }
    return false;
}
exports.ignore = ignore;
function hasValidExtension(filepath, context) {
    return validExtensions(context).has(node_path_1.default.extname(filepath));
}
exports.hasValidExtension = hasValidExtension;
//# sourceMappingURL=ignore.js.map