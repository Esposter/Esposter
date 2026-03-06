import type { ViteOptions } from "nuxt/schema";

// Vite 8 (rolldown) skips the CJS-to-ESM transform for modules that set `__esModule: true`
// Via Object.defineProperty (both single-line and multiline forms). The ajv family of packages
// (ajv, ajv-formats, ajv-errors) all hit this. This plugin converts those files to proper ESM
// Before rolldown touches them.
//
// Generic transforms (applied to ajv/ajv-formats/ajv-errors/ajv-i18n):
//   1. Remove `"use strict";` / `"use strict"` (with or without semicolon)
//   2. Remove `Object.defineProperty(exports, "__esModule", {...});`  (single or multiline)
//   3. Remove `exports.X = ... = void 0;` init chains
//   4. `const/var X = require("Y");`   →   `import * as X from "Y";`
//      If X is later mutated (X.prop = val), wraps in `Object.assign(Object.create(null), ns)`
//   5. Inline `require("Y")` (in object literals etc.)  →  extracted `import * as Y from "Y";`
//      And variable reference; imports prepended at the top
//   6. `module.exports = exports = X;` →   (removed)
//   7. `module.exports = X;`           →   `export default X;`
//   8. `module.exports.X = Y;`         →   (removed)
//   9. `module.exports = { ... }` or `module.exports = function...{ }` (multiline block)
//      →   `export default ...;`
//  10. `exports.default = X;`          →   `export default X;`
//  11. `exports.X = X;`                →   `export { X };`
//  12. `Object.defineProperty(exports, "X", { get: () => Y.Z })` re-exports
//      Resolved via the built require-map  →   `export { Z } from "…";`
//  13. `exports.X = <expr>;`           →   `export const X = <expr>;`
//      (catches expression exports like `exports.nil = new _Code("")` that step 11 misses)
//      Also handles multiline block exports like `exports.X = { ... };` or `exports.X = [ ... ];`
//  14. remaining `exports.X` reads     →   `X`
//      (internal references like `exports.IDENTIFIER.test(s)` after step 13 extracted it)
//
// Debug/src/browser.js — purpose-built `_exports` shim transform:
//   The file uses `module.exports = require('./common')(exports)` as its primary export,
//   With `exports.X` used both for named exports and internal cross-references.
//   Strategy: introduce `const _exports = {};`, map all `exports.*` to `_exports.*`,
//   Then produce `const _debug = common(_exports); export default _debug;`.
const ESM_FLAG_RE = /Object\.defineProperty\(exports, "__esModule", \{[^}]*\}\);\n/g;
const REQUIRE_RE = /^(const|var) (\w+) = require\("([^"]+)"\);\n/gm;
const INLINE_REQUIRE_RE = /\brequire\(["']([^"']+)["']\)/g;
const ODP_REEXPORT_RE =
  /^Object\.defineProperty\(exports, "([\w$]+)", \{ enumerable: true, get: function \(\) \{ return (\w+)\.([\w$]+); \} \}\);\n/gm;

export const fixAjv: NonNullable<ViteOptions["plugins"]>[number] = {
  enforce: "pre",
  name: "fix-ajv",
  transform(code, id) {
    const cleanId = id.split("?")[0]?.replaceAll("\\", "/");
    if (!cleanId) return;

    // ── debug/src/browser.js ────────────────────────────────────────────────
    // Purpose-built _exports shim: keep `exports.X = Y` assignments intact so
    // Internal cross-references work, pass the object to common(), export default.
    if (cleanId.includes("/debug/") && cleanId.endsWith("/src/browser.js")) {
      const inlineRequireMap = new Map<string, string>();
      for (const [, path] of code.matchAll(INLINE_REQUIRE_RE)) {
        if (!path || !path.startsWith(".") || inlineRequireMap.has(path)) continue;
        const varName = path.replace(/^(?:\.\/)+/, "").replaceAll(/[^a-zA-Z0-9_$]/g, "_");
        inlineRequireMap.set(path, varName);
      }
      const result = code
        .replace('"use strict";\n', "")
        .replace('"use strict"\n', "")
        // Replace inline require() with extracted variable names (default ?? ns for CJS compat)
        .replaceAll(INLINE_REQUIRE_RE, (_, path: string) => {
          const vn = inlineRequireMap.get(path);
          return vn ? `(${vn}.default ?? ${vn})` : `require("${path}")`;
        })
        // Remap `exports.X` → `_exports.X` (negative lookbehind avoids touching `module.exports`)
        .replaceAll(/(?<!module\.)\bexports\b/g, "_exports")
        // `module.exports = EXPR;` → `const _debug = EXPR;\nexport default _debug;`
        .replaceAll(/^module\.exports = (.+);\n/gm, "const _debug = $1;\nexport default _debug;\n")
        // Remaining `module.exports` references (e.g. `const {formatters} = module.exports`)
        .replaceAll(/\bmodule\.exports\b/g, "_debug");
      const imports = [...inlineRequireMap.entries()]
        .map(([path, varName]) => `import * as ${varName} from "${path}";\n`)
        .join("");
      return `${imports}const _exports = {}\n${result}`;
    }

    // ── Generic ajv transform ───────────────
    if (
      !(
        (cleanId.includes("/ajv/") && cleanId.includes("/dist/")) ||
        cleanId.includes("/ajv-formats/") ||
        (cleanId.includes("/ajv-errors/") && cleanId.endsWith("/dist/index.js")) ||
        (cleanId.includes("/ajv-i18n/") && cleanId.endsWith("/index.js")) ||
        (cleanId.includes("/fast-uri/") && (cleanId.endsWith("/index.js") || cleanId.endsWith("/lib/schemes.js")))
      )
    )
      return;
    // Build variable → module-path map for top-level requires (used by ODP re-export resolver).
    const requireMap = new Map<string, string>();
    // oxlint-disable-next-line unicorn/no-unreadable-array-destructuring
    for (const [, , varName, modPath] of code.matchAll(REQUIRE_RE)) {
      if (!varName || !modPath) continue;
      requireMap.set(varName, modPath);
    }
    // Detect require-imported variables that are mutated after import (e.g. `uri.code = '...'`).
    // For those, we must produce a mutable copy since `import * as` namespace objects are sealed.
    const mutatedRequireVars = new Set<string>();
    for (const [varName] of requireMap)
      // Match `varName.anything =` (not `==` / `===`)
      if (new RegExp(`\\b${varName}\\.[\\w$]+ =(?!=)`).test(code)) mutatedRequireVars.add(varName);

    // Collect inline require() calls (e.g. `module.exports = { x: require("./x") }`)
    // That are NOT already covered by a top-level `const/var X = require("Y");` declaration.
    const handledPaths = new Set(requireMap.values());
    const inlineRequireMap = new Map<string, string>(); // Path → varName
    for (const [, path] of code.matchAll(INLINE_REQUIRE_RE)) {
      // Only relative paths — package-name paths (e.g. "ajv/dist/runtime/uri") appear inside
      // string literals used as code hints (e.g. `uri.code = 'require("...").default'`) and
      // must NOT be extracted, or we'd create a spurious self-referential circular import.
      if (!path || !path.startsWith(".")) continue;
      if (inlineRequireMap.has(path) || handledPaths.has(path)) continue;
      // Derive a valid JS identifier from the path (strip leading ./, replace non-ident chars)
      const varName = path.replace(/^(?:\.\/)+/, "").replaceAll(/[^a-zA-Z0-9_$]/g, "_");
      inlineRequireMap.set(path, varName);
    }

    let result = code
      .replace('"use strict";\n', "")
      .replace('"use strict"\n', "") // Variant without semicolon (e.g. ajv-i18n)
      .replace("'use strict';\n", "") // Single-quote variant (e.g. fast-uri)
      .replace("'use strict'\n", "")
      .replace(ESM_FLAG_RE, "")
      // Remove `exports.A = exports.B = … = void 0;` init chains
      .replaceAll(/^(?:exports\.[\w$]+ = )+void 0;\n/gm, "")
      // Convert top-level require() calls to `import * as` (mutable copy when var is mutated)
      .replace(REQUIRE_RE, (_m: string, _kw: string, vName: string, modPath: string) => {
        if (mutatedRequireVars.has(vName))
          // Use `.default ?? ns` so packages using `module.exports = X` style are unwrapped correctly
          return `import * as _${vName}_ns from "${modPath}";\nconst ${vName} = Object.assign(Object.create(null), _${vName}_ns.default ?? _${vName}_ns);\n`;
        return `import * as ${vName} from "${modPath}";\n`;
      })
      // Replace remaining inline require() calls with their extracted variable names.
      // Use `.default ?? ns` so packages using `module.exports = X` style expose the right value.
      .replaceAll(INLINE_REQUIRE_RE, (_, path: string) => {
        const vn = inlineRequireMap.get(path);
        return vn ? `(${vn}.default ?? ${vn})` : `require("${path}")`;
      })
      // Strip/convert module.exports assignments (semicolons optional for no-semicolon packages)
      // If the file uses `exports.default = X` (TypeScript __esModule compat), strip `module.exports = X`
      // since step 10 already handles the real export. Otherwise (e.g. fast-uri), convert to `export default`.
      .replaceAll(/^module\.exports = exports = [\w$]+;?\n/gm, "")
      .replaceAll(/^module\.exports = ([\w$]+);?\n/gm, (_, x) =>
        /^exports\.default = /m.test(code) ? "" : `export default ${x};\n`,
      )
      .replaceAll(/^module\.exports\.[\w$]+ = [\w$]+;?\n/gm, "")
      // Convert multiline `module.exports = { ... }` or `module.exports = function...{ }` to `export default ...`
      .replaceAll(/^module\.exports = ((?:\{|function\b)[\s\S]*?^});?\n/gm, "export default $1;\n")
      // Convert exports.default and named exports
      .replace(/^exports\.default = ([\w$]+);\n/m, "export default $1;\n")
      .replaceAll(/^exports\.([\w$]+) = \1;\n/gm, "export { $1 };\n")
      // Convert single-line Object.defineProperty re-exports using the require map
      .replace(ODP_REEXPORT_RE, (_, exportName: string, varName: string, propName: string) => {
        const modPath = requireMap.get(varName);
        if (!modPath) return "";
        if (propName === exportName) return `export { ${propName} } from "${modPath}";\n`;
        if (propName === "default") return `export { default as ${exportName} } from "${modPath}";\n`;
        return `export { ${propName} as ${exportName} } from "${modPath}";\n`;
      })
      // Expression exports missed by step 11 (RHS is not the same identifier):
      // Single-line: `exports.nil = new _Code("");` → `export const nil = new _Code("");`
      .replaceAll(/^exports\.([\w$]+) = (.+);\n/gm, "export const $1 = $2;\n")
      // Multiline block exports: `exports.X = {\n  ...\n};` or `exports.X = [\n  ...\n];`
      .replaceAll(/^exports\.([\w$]+) = (\{[\s\S]*?^});\n/gm, "export const $1 = $2;\n")
      .replaceAll(/^exports\.([\w$]+) = (\[[\s\S]*?^\]);\n/gm, "export const $1 = $2;\n")
      // Clean up any remaining exports.X reads (e.g. internal uses like exports.IDENTIFIER.test(s))
      .replaceAll(/\bexports\.([\w$]+)\b/g, "$1");

    // Prepend import statements for inline requires (e.g. from `module.exports = { x: require(...) }`)
    if (inlineRequireMap.size > 0) {
      const imports = [...inlineRequireMap.entries()]
        .map(([path, varName]) => `import * as ${varName} from "${path}";\n`)
        .join("");
      result = imports + result;
    }

    return result;
  },
};
