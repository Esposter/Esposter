import type { Plugin } from "vite";
// Vite 8 (rolldown) skips the CJS-to-ESM transform for modules that set `__esModule: true`.
// The ajv family of packages all hit this. This plugin converts them to proper ESM before rolldown.
//
// Generic transforms applied to ajv/ajv-formats/fast-uri/json-schema-traverse, which JSON Forms' core imports:
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
const ESM_FLAG_REGEX = /Object\.defineProperty\(exports, "__esModule", \{[^}]*\}\);\n/gu;
const REQUIRE_REGEX = /^(?<keyword>const|var) (?<variableName>\w+) = require\("(?<modulePath>[^"]+)"\);\n/gmu;
const INLINE_REQUIRE_REGEX = /\brequire\(["'](?<path>[^"']+)["']\)/gu;
const OBJECT_DEFINE_PROPERTY_REEXPORT_REGEX =
  /^Object\.defineProperty\(exports, "(?<exportName>[\w$]+)", \{ enumerable: true, get: function \(\) \{ return (?<variableName>\w+)\.(?<propertyName>[\w$]+); \} \}\);\n/gmu;

export const fixAjv = {
  enforce: "pre",
  name: "fix-ajv",
  transform: (code: string, id: string) => {
    const cleanId = id.split("?")[0]?.replaceAll("\\", "/");
    if (!cleanId) return undefined;
    // ── Generic ajv transform ────────────────────────────────────────────────
    if (
      !(
        (cleanId.includes("/ajv/") && cleanId.includes("/dist/")) ||
        cleanId.includes("/ajv-formats/") ||
        cleanId.includes("/fast-uri/") ||
        cleanId.includes("/json-schema-traverse/")
      )
    )
      return undefined;
    // Build variable → module-path map for top-level requires (used by the Object.defineProperty re-export resolver).
    const variableNameModulePathMap = new Map<string, string>();
    for (const { groups } of code.matchAll(REQUIRE_REGEX)) {
      const { modulePath, variableName } = groups ?? {};
      if (!variableName || !modulePath) continue;
      variableNameModulePathMap.set(variableName, modulePath);
    }
    // Variables that are mutated (X.prop = val) or called as functions (X(...)) need the actual
    // exported value rather than the sealed namespace — use `(ns.default ?? ns)` to unwrap.
    // Note: mutated variables must NOT use Object.assign(Object.create(null), fn) because that
    // Creates a non-callable plain object (e.g. equal.js: `const equal = require("fast-deep-equal");
    // Equal.code = '...'` — equal must stay callable).
    const unwrapVariableNames = new Set<string>();
    for (const [variableName] of variableNameModulePathMap) {
      const escapedVariableName = variableName.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);
      if (
        new RegExp(`\\b${escapedVariableName}\\.[\\w$]+ =(?!=)`, "u").test(code) ||
        new RegExp(`\\b${escapedVariableName}\\s*\\(`, "u").test(code)
      )
        unwrapVariableNames.add(variableName);
    }
    // Collect inline require() calls not already covered by a top-level `const/var X = require(Y)`.
    const handledPaths = new Set(variableNameModulePathMap.values());
    // Path → variableName
    const inlineModulePathVariableNameMap = new Map<string, string>();
    for (const [, path] of code.matchAll(INLINE_REQUIRE_REGEX)) {
      // Skip package-name paths — they appear in string literals like `uri.code = 'require("...")'`
      // And must not be extracted or we'd create a spurious circular import.
      if (!path?.startsWith(".")) continue;
      if (inlineModulePathVariableNameMap.has(path) || handledPaths.has(path)) continue;
      const variableName = path.replace(/^(?:\.\/)+/u, "").replaceAll(/[^a-zA-Z0-9_$]/gu, "_");
      inlineModulePathVariableNameMap.set(path, variableName);
    }

    let transformedCode = code
      .replace('"use strict";\n', "")
      .replace('"use strict"\n', "")
      // Fast-uri uses single quotes
      .replace("'use strict';\n", "")
      .replace("'use strict'\n", "")
      .replace(ESM_FLAG_REGEX, "")
      // Step 3: remove void 0 init chains
      .replaceAll(/^(?:exports\.[\w$]+ = )+void 0;\n/gmu, "")
      // Step 4: top-level require() → import
      .replace(REQUIRE_REGEX, (_match: string, _keyword: string, variableName: string, modulePath: string) => {
        if (unwrapVariableNames.has(variableName))
          return `import * as _${variableName}_ns from "${modulePath}";\nconst ${variableName} = (_${variableName}_ns.default ?? _${variableName}_ns);\n`;
        else return `import * as ${variableName} from "${modulePath}";\n`;
      })
      // Step 5: inline require() → extracted variable (`.default ?? ns` for CJS compat)
      .replaceAll(INLINE_REQUIRE_REGEX, (_match, path: string) => {
        const variableName = inlineModulePathVariableNameMap.get(path);
        return variableName ? `(${variableName}.default ?? ${variableName})` : `require("${path}")`;
      })
      // Steps 6–8: module.exports assignments
      .replaceAll(/^module\.exports = exports = [\w$]+;?\n/gmu, "")
      .replaceAll(/^module\.exports = (?<id>[\w$]+);?\n/gmu, (_match, name) =>
        // If the file uses `exports.default = X` (__esModule style), skip — step 11 handles it.
        /^exports\.default = /mu.test(code) ? "" : `export default ${name};\n`,
      )
      .replaceAll(/^module\.exports\.[\w$]+ = [\w$]+;?\n/gmu, "")
      // Step 9: `var X = module.exports = function...{}` chained assignment (e.g. json-schema-traverse)
      .replaceAll(
        /^var (?<varId>[\w$]+) = module\.exports = (?<body>(?:function\b)[\s\S]*?^\});?\n/gmu,
        "const $1 = $2;\nexport default $1;\n",
      )
      // Step 10: multiline module.exports = { ... } or function...{}
      .replaceAll(/^module\.exports = (?<body>(?:\{|function\b)[\s\S]*?^\});?\n/gmu, "export default $1;\n")
      // Steps 11–14: exports.X → named exports
      .replace(/^exports\.default = (?<id>[\w$]+);\n/mu, "export default $1;\n")
      .replaceAll(/^exports\.(?<name>[\w$]+) = \1;\n/gmu, "export { $1 };\n")
      .replace(
        OBJECT_DEFINE_PROPERTY_REEXPORT_REGEX,
        (_match, exportName: string, variableName: string, propertyName: string) => {
          const modulePath = variableNameModulePathMap.get(variableName);
          if (!modulePath) return "";
          else if (propertyName === exportName) return `export { ${propertyName} } from "${modulePath}";\n`;
          else if (propertyName === "default") return `export { default as ${exportName} } from "${modulePath}";\n`;
          else return `export { ${propertyName} as ${exportName} } from "${modulePath}";\n`;
        },
      )
      .replaceAll(/^exports\.(?<name>[\w$]+) = (?<value>.+);\n/gmu, "export const $1 = $2;\n")
      .replaceAll(/^exports\.(?<name>[\w$]+) = (?<value>\{[\s\S]*?^\});\n/gmu, "export const $1 = $2;\n")
      .replaceAll(/^exports\.(?<name>[\w$]+) = (?<value>\[[\s\S]*?^\]);\n/gmu, "export const $1 = $2;\n")
      // Step 15: TypeScript enum IIFEs — `})(NAME || (exports.NAME = NAME = {}));`
      // Exports.NAME is inside the IIFE call so all top-level exports.X transforms miss it.
      .replaceAll(
        /\}\)\((?<name>[\w$]+) \|\| \(exports\.\1 = \1 = \{\}\)\);\n/gu,
        "})($1 || ($1 = $1 = {}));\nexport { $1 };\n",
      )
      // Step 16: clean up remaining exports.X reads (internal references after step 14)
      .replaceAll(/\bexports\.(?<name>[\w$]+)\b/gu, "$1");
    // Prepend imports for inline requires extracted in step 5.
    if (inlineModulePathVariableNameMap.size > 0) {
      const imports = Array.from(
        inlineModulePathVariableNameMap.entries(),
        ([path, variableName]) => `import * as ${variableName} from "${path}";\n`,
      ).join("");
      transformedCode = imports + transformedCode;
    }
    // Set `.default = self` on default-exported identifiers so consumers that call `X.default(...)`
    // (expecting old CJS interop wrapping) continue to work alongside `X(...)` callers.
    transformedCode = transformedCode.replace(
      /^export default (?<name>[\w$]+);\n/mu,
      (_match, name) => `${name}.default = ${name};\nexport default ${name};\n`,
    );
    return transformedCode;
  },
} as const satisfies Plugin;
