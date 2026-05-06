import type { Plugin } from "vite";
// Vite 8 (rolldown) skips the CJS-to-ESM transform for modules that set `__esModule: true`.
// The ajv family of packages all hit this. This plugin converts them to proper ESM before rolldown.
//
// Generic transforms applied to ajv/ajv-formats/ajv-errors/ajv-i18n/fast-uri/json-schema-traverse:
//   1. Remove `"use strict";` / `'use strict'`
//   2. Remove `Object.defineProperty(exports, "__esModule", {...});`
//   3. Remove `exports.X = ... = void 0;` init chains
//   4. `const/var X = require("Y");` → `import * as X from "Y";`
//      Mutated (X.prop = val) or callable (X(...)) vars get the unwrapped value: `ns.default ?? ns`
//   5. Inline `require("Y")` → extracted `import * as Y from "Y";` prepended at top
//   6. `module.exports = exports = X;` → (removed)
//   7. `module.exports = X;` → `export default X;`
//   8. `module.exports.X = Y;` → (removed)
//   9. `var X = module.exports = function...{}` → `const X = function...{}; export default X;`
//  10. `module.exports = { ... }` or `module.exports = function...{}` → `export default ...;`
//  11. `exports.default = X;` → `export default X;`
//  12. `exports.X = X;` → `export { X };`
//  13. `Object.defineProperty(exports, "X", { get: () => Y.Z })` → `export { Z } from "Y";`
//  14. `exports.X = <expr>;` → `export const X = <expr>;` (single-line and multiline blocks)
//  15. TypeScript enum IIFEs: `})(NAME || (exports.NAME = NAME = {}));` → `export { NAME };`
//  16. Remaining `exports.X` reads → `X`
//
// Debug/src/common.js — purpose-built transform:
//   Extracts non-relative inline requires (e.g. `require('ms')`) as ESM imports,
//   Then emits `export default setup;` from `module.exports = setup`.
//
// Debug/src/browser.js — purpose-built transform:
//   Uses `module.exports = require('./common')(exports)` with `exports.X` for cross-references.
//   Introduces `const _exports = {};`, remaps all `exports.*` to `_exports.*`,
//   Then emits `const _debug = common(_exports); export default _debug;`.
const ESM_FLAG_REGEX = new RegExp(String.raw`Object\.defineProperty\(exports, "__esModule", \{[^}]*\}\);\n`, "gu");
const REQUIRE_REGEX = new RegExp(String.raw`^(const|var) (\w+) = require\("([^"]+)"\);\n`, "gmu");
const INLINE_REQUIRE_REGEX = new RegExp(String.raw`\brequire\(["']([^"']+)["']\)`, "gu");
const ODP_REEXPORT_REGEX = new RegExp(
  String.raw`^Object\.defineProperty\(exports, "([\w$]+)", \{ enumerable: true, get: function \(\) \{ return (\w+)\.([\w$]+); \} \}\);\n`,
  "gmu",
);

export const fixAjv = {
  enforce: "pre",
  name: "fix-ajv",
  transform: (code: string, id: string) => {
    const cleanId = id.split("?")[0]?.replaceAll("\\", "/");
    if (!cleanId) return undefined;
    // ── debug/src/browser.js ────────────────────────────────────────────────
    if (cleanId.includes("/debug/") && cleanId.endsWith("/src/browser.js")) {
      const inlineRequireMap = new Map<string, string>();
      for (const [, path] of code.matchAll(INLINE_REQUIRE_REGEX)) {
        if (!path || !path.startsWith(".") || inlineRequireMap.has(path)) continue;
        const varName = path
          .replace(new RegExp(String.raw`^(?:\.\/)+`, "u"), "")
          .replaceAll(new RegExp("[^a-zA-Z0-9_$]", "gu"), "_");
        inlineRequireMap.set(path, varName);
      }
      const result = code
        .replace('"use strict";\n', "")
        .replace('"use strict"\n', "")
        .replaceAll(INLINE_REQUIRE_REGEX, (_, path: string) => {
          const vn = inlineRequireMap.get(path);
          return vn ? `(${vn}.default ?? ${vn})` : `require("${path}")`;
        })
        // Remap `exports.X` → `_exports.X` (negative lookbehind avoids touching `module.exports`)
        .replaceAll(new RegExp(String.raw`(?<!module\.)\bexports\b`, "gu"), "_exports")
        .replaceAll(
          new RegExp(String.raw`^module\.exports = (.+);\n`, "gmu"),
          "const _debug = $1;\nexport default _debug;\n",
        )
        .replaceAll(new RegExp(String.raw`\bmodule\.exports\b`, "gu"), "_debug");
      const imports = [...inlineRequireMap.entries()]
        .map(([path, varName]) => `import * as ${varName} from "${path}";\n`)
        .join("");
      return `${imports}const _exports = {}\n${result}`;
    }
    // ── debug/src/common.js ──────────────────────────────────────────────────
    if (cleanId.includes("/debug/") && cleanId.endsWith("/src/common.js")) {
      // Collect non-relative inline requires (only `require('ms')` in practice).
      const pkgRequireMap = new Map<string, string>();
      for (const [, path] of code.matchAll(INLINE_REQUIRE_REGEX)) {
        if (!path || path.startsWith(".") || pkgRequireMap.has(path)) continue;
        pkgRequireMap.set(path, path.replaceAll(new RegExp("[^a-zA-Z0-9_$]", "gu"), "_"));
      }
      const result = code
        .replaceAll(INLINE_REQUIRE_REGEX, (_, path: string) => {
          const vn = pkgRequireMap.get(path);
          return vn ? `(${vn}.default ?? ${vn})` : `require("${path}")`;
        })
        .replace(
          new RegExp(String.raw`^module\.exports = ([\w$]+);?\n`, "mu"),
          (_, x) => `${x}.default = ${x};\nexport default ${x};\n`,
        );
      const imports = Array.from(pkgRequireMap, ([path, vn]) => `import * as ${vn} from "${path}";\n`).join("");
      return `${imports}${result}`;
    }
    // ── Generic ajv transform ────────────────────────────────────────────────
    if (
      !(
        (cleanId.includes("/ajv/") && cleanId.includes("/dist/")) ||
        cleanId.includes("/ajv-formats/") ||
        (cleanId.includes("/ajv-errors/") && cleanId.endsWith("/dist/index.js")) ||
        (cleanId.includes("/ajv-i18n/") && cleanId.endsWith("/index.js")) ||
        cleanId.includes("/fast-uri/") ||
        cleanId.includes("/json-schema-traverse/")
      )
    )
      return undefined;
    // Build variable → module-path map for top-level requires (used by ODP re-export resolver).
    const requireMap = new Map<string, string>();
    // oxlint-disable-next-line unicorn/no-unreadable-array-destructuring
    for (const [, , varName, modPath] of code.matchAll(REQUIRE_REGEX)) {
      if (!varName || !modPath) continue;
      requireMap.set(varName, modPath);
    }
    // Vars that are mutated (X.prop = val) or called as functions (X(...)) need the actual
    // exported value rather than the sealed namespace — use `(ns.default ?? ns)` to unwrap.
    // Note: mutated vars must NOT use Object.assign(Object.create(null), fn) because that
    // Creates a non-callable plain object (e.g. equal.js: `const equal = require("fast-deep-equal");
    // Equal.code = '...'` — equal must stay callable).
    const needsUnwrapVars = new Set<string>();
    for (const [varName] of requireMap) {
      const escaped = varName.replaceAll(new RegExp(String.raw`[$()*+.?[\\\]^{|}]`, "gu"), String.raw`\$&`);
      if (
        new RegExp(`\\b${escaped}\\.[\\w$]+ =(?!=)`, "u").test(code) ||
        new RegExp(`\\b${escaped}\\s*\\(`, "u").test(code)
      )
        needsUnwrapVars.add(varName);
    }
    // Collect inline require() calls not already covered by a top-level `const/var X = require(Y)`.
    const handledPaths = new Set(requireMap.values());
    const inlineRequireMap = new Map<string, string>(); // Path → varName
    for (const [, path] of code.matchAll(INLINE_REQUIRE_REGEX)) {
      // Skip package-name paths — they appear in string literals like `uri.code = 'require("...")'`
      // And must not be extracted or we'd create a spurious circular import.
      if (!path?.startsWith(".")) continue;
      if (inlineRequireMap.has(path) || handledPaths.has(path)) continue;
      const varName = path
        .replace(new RegExp(String.raw`^(?:\.\/)+`, "u"), "")
        .replaceAll(new RegExp("[^a-zA-Z0-9_$]", "gu"), "_");
      inlineRequireMap.set(path, varName);
    }

    let result = code
      .replace('"use strict";\n', "")
      .replace('"use strict"\n', "") // Ajv-i18n omits semicolon
      .replace("'use strict';\n", "") // Fast-uri uses single quotes
      .replace("'use strict'\n", "")
      .replace(ESM_FLAG_REGEX, "")
      // Step 3: remove void 0 init chains
      .replaceAll(new RegExp(String.raw`^(?:exports\.[\w$]+ = )+void 0;\n`, "gmu"), "")
      // Step 4: top-level require() → import
      .replace(REQUIRE_REGEX, (_m: string, _kw: string, vName: string, modPath: string) => {
        if (needsUnwrapVars.has(vName))
          return `import * as _${vName}_ns from "${modPath}";\nconst ${vName} = (_${vName}_ns.default ?? _${vName}_ns);\n`;
        return `import * as ${vName} from "${modPath}";\n`;
      })
      // Step 5: inline require() → extracted variable (`.default ?? ns` for CJS compat)
      .replaceAll(INLINE_REQUIRE_REGEX, (_, path: string) => {
        const vn = inlineRequireMap.get(path);
        return vn ? `(${vn}.default ?? ${vn})` : `require("${path}")`;
      })
      // Steps 6–8: module.exports assignments
      .replaceAll(new RegExp(String.raw`^module\.exports = exports = [\w$]+;?\n`, "gmu"), "")
      .replaceAll(new RegExp(String.raw`^module\.exports = ([\w$]+);?\n`, "gmu"), (_, x) =>
        // If the file uses `exports.default = X` (__esModule style), skip — step 11 handles it.
        new RegExp(String.raw`^exports\.default = `, "mu").test(code) ? "" : `export default ${x};\n`,
      )
      .replaceAll(new RegExp(String.raw`^module\.exports\.[\w$]+ = [\w$]+;?\n`, "gmu"), "")
      // Step 9: `var X = module.exports = function...{}` chained assignment (e.g. json-schema-traverse)
      .replaceAll(
        new RegExp(String.raw`^var ([\w$]+) = module\.exports = ((?:function\b)[\s\S]*?^\});?\n`, "gmu"),
        "const $1 = $2;\nexport default $1;\n",
      )
      // Step 10: multiline module.exports = { ... } or function...{}
      .replaceAll(
        new RegExp(String.raw`^module\.exports = ((?:\{|function\b)[\s\S]*?^\});?\n`, "gmu"),
        "export default $1;\n",
      )
      // Steps 11–14: exports.X → named exports
      .replace(new RegExp(String.raw`^exports\.default = ([\w$]+);\n`, "mu"), "export default $1;\n")
      .replaceAll(new RegExp(String.raw`^exports\.([\w$]+) = \1;\n`, "gmu"), "export { $1 };\n")
      .replace(ODP_REEXPORT_REGEX, (_, exportName: string, varName: string, propName: string) => {
        const modPath = requireMap.get(varName);
        if (!modPath) return "";
        if (propName === exportName) return `export { ${propName} } from "${modPath}";\n`;
        if (propName === "default") return `export { default as ${exportName} } from "${modPath}";\n`;
        return `export { ${propName} as ${exportName} } from "${modPath}";\n`;
      })
      .replaceAll(new RegExp(String.raw`^exports\.([\w$]+) = (.+);\n`, "gmu"), "export const $1 = $2;\n")
      .replaceAll(new RegExp(String.raw`^exports\.([\w$]+) = (\{[\s\S]*?^\});\n`, "gmu"), "export const $1 = $2;\n")
      .replaceAll(new RegExp(String.raw`^exports\.([\w$]+) = (\[[\s\S]*?^\]);\n`, "gmu"), "export const $1 = $2;\n")
      // Step 15: TypeScript enum IIFEs — `})(NAME || (exports.NAME = NAME = {}));`
      // Exports.NAME is inside the IIFE call so all top-level exports.X transforms miss it.
      .replaceAll(
        new RegExp(String.raw`\}\)\(([\w$]+) \|\| \(exports\.\1 = \1 = \{\}\)\);\n`, "gu"),
        "})($1 || ($1 = $1 = {}));\nexport { $1 };\n",
      )
      // Step 16: clean up remaining exports.X reads (internal references after step 14)
      .replaceAll(new RegExp(String.raw`\bexports\.([\w$]+)\b`, "gu"), "$1");
    // Prepend imports for inline requires extracted in step 5.
    if (inlineRequireMap.size > 0) {
      const imports = [...inlineRequireMap.entries()]
        .map(([path, varName]) => `import * as ${varName} from "${path}";\n`)
        .join("");
      result = imports + result;
    }
    // Set `.default = self` on default-exported identifiers so consumers that call `X.default(...)`
    // (expecting old CJS interop wrapping) continue to work alongside `X(...)` callers.
    result = result.replace(
      new RegExp(String.raw`^export default ([\w$]+);\n`, "mu"),
      (_, name) => `${name}.default = ${name};\nexport default ${name};\n`,
    );
    return result;
  },
} as const satisfies Plugin;
