// @vitest-environment node
import { describe, expect, test } from "vitest";

import { fixAjv } from "./fixAjv";

describe("fixAjv", () => {
  const AJV_ID = "/node_modules/ajv/dist/compile/util.js";
  const AJV_FORMATS_ID = "/node_modules/ajv-formats/dist/formats.js";
  const JSON_SCHEMA_TRAVERSE_ID = "/node_modules/json-schema-traverse/index.js";
  const BROWSER_JS_ID = "/node_modules/debug/src/browser.js";
  const COMMON_JS_ID = "/node_modules/debug/src/common.js";
  const transform = (code: string, id: string) => fixAjv.transform(code, id);

  describe("filter", () => {
    test("returns undefined for non-matching paths", () => {
      expect.hasAssertions();

      expect(transform("const x = 1;\n", "/node_modules/lodash/index.js")).toBeUndefined();
      expect(transform("const x = 1;\n", "/node_modules/ajv/src/core.ts")).toBeUndefined();
      expect(transform("const x = 1;\n", "/node_modules/ajv-errors/src/index.js")).toBeUndefined();
      expect(transform("const x = 1;\n", "/node_modules/ajv-i18n/locales/en/messages.js")).toBeUndefined();
    });

    test("matches expected paths", () => {
      expect.hasAssertions();

      expect(transform("\n", AJV_ID)).toBeDefined();
      expect(transform("\n", AJV_FORMATS_ID)).toBeDefined();
      expect(transform("\n", "/node_modules/ajv-errors/dist/index.js")).toBeDefined();
      expect(transform("\n", "/node_modules/ajv-i18n/index.js")).toBeDefined();
      expect(transform("\n", "/node_modules/fast-uri/lib/utils.js")).toBeDefined();
      expect(transform("\n", JSON_SCHEMA_TRAVERSE_ID)).toBeDefined();
      expect(transform("\n", BROWSER_JS_ID)).toBeDefined();
      expect(transform("\n", COMMON_JS_ID)).toBeDefined();
    });

    test("strips query string from id", () => {
      expect.hasAssertions();

      expect(transform("\n", `${AJV_ID}?v=123`)).toBeDefined();
    });

    test("normalises Windows backslashes in id", () => {
      expect.hasAssertions();

      expect(transform("\n", AJV_ID.replaceAll("/", "\\"))).toBeDefined();
    });
  });

  describe("debug/src/browser.js", () => {
    test("strips use strict", () => {
      expect.hasAssertions();

      const result = transform('"use strict";\nexports.formatters = {};\n', BROWSER_JS_ID);

      expect(result).not.toContain('"use strict"');
      expect(result).toContain("_exports.formatters = {};");
    });

    test("extracts inline relative require as import and replaces with unwrapped reference", () => {
      expect.hasAssertions();

      const result = transform('module.exports = require("./common")(exports);\n', BROWSER_JS_ID);

      expect(result).toContain('import * as common from "./common";\n');
      expect(result).toContain("(common.default ?? common)(_exports)");
    });

    test("remaps exports.X to _exports.X but leaves module.exports untouched", () => {
      expect.hasAssertions();

      const result = transform("exports.useColors = function() {};\n", BROWSER_JS_ID);

      expect(result).toContain("_exports.useColors = function() {};");
      expect(result).not.toMatch(/(?<!_)exports\.useColors/);
    });

    test("converts module.exports = expr to const _debug + export default", () => {
      expect.hasAssertions();

      const result = transform('module.exports = require("./common")(exports);\n', BROWSER_JS_ID);

      expect(result).toContain("const _debug =");
      expect(result).toContain("export default _debug;");
    });

    test("prepends const _exports = {} to output", () => {
      expect.hasAssertions();

      const result = transform("exports.x = 1;\n", BROWSER_JS_ID);

      expect(result).toContain("const _exports = {}");
    });
  });

  describe("debug/src/common.js", () => {
    test("extracts non-relative inline require as import and replaces with unwrapped reference", () => {
      expect.hasAssertions();

      const result = transform("createDebug.humanize = require('ms');\nmodule.exports = setup;\n", COMMON_JS_ID);

      expect(result).toContain('import * as ms from "ms";\n');
      expect(result).toContain("(ms.default ?? ms)");
      expect(result).not.toContain("require('ms')");
    });

    test("ignores relative require paths", () => {
      expect.hasAssertions();

      const result = transform("const x = require('./utils');\nmodule.exports = setup;\n", COMMON_JS_ID);

      // Relative requires are left as-is (common.js handler does not run generic transform).
      // Note: INLINE_REQUIRE_RE normalises quotes to double in the fallback replacement.
      expect(result).toContain('require("./utils")');
    });

    test("converts module.exports = X to export default with .default patch", () => {
      expect.hasAssertions();

      const result = transform("function setup() {}\nmodule.exports = setup;\n", COMMON_JS_ID);

      expect(result).toContain("setup.default = setup;");
      expect(result).toContain("export default setup;");
    });
  });

  describe("generic transform", () => {
    describe("step 1: removes use strict", () => {
      test('removes "use strict"; with semicolon', () => {
        expect.hasAssertions();

        expect(transform('"use strict";\nconst x = 1;\n', AJV_ID)).toBe("const x = 1;\n");
      });

      test('removes "use strict" without semicolon (ajv-i18n style)', () => {
        expect.hasAssertions();

        expect(transform('"use strict"\nconst x = 1;\n', AJV_ID)).toBe("const x = 1;\n");
      });

      test("removes 'use strict'; with single quotes (fast-uri style)", () => {
        expect.hasAssertions();

        expect(transform("'use strict';\nconst x = 1;\n", AJV_FORMATS_ID)).toBe("const x = 1;\n");
      });
    });

    describe("step 2: removes __esModule defineProperty", () => {
      test("removes Object.defineProperty __esModule flag", () => {
        expect.hasAssertions();

        const code = 'Object.defineProperty(exports, "__esModule", { value: true });\n';

        expect(transform(code, AJV_ID)).toBe("");
      });
    });

    describe("step 3: removes void 0 init chains", () => {
      test("removes single export void 0 init", () => {
        expect.hasAssertions();

        expect(transform("exports.foo = void 0;\n", AJV_ID)).toBe("");
      });

      test("removes chained export void 0 init", () => {
        expect.hasAssertions();

        expect(transform("exports.foo = exports.bar = void 0;\n", AJV_ID)).toBe("");
      });
    });

    describe("step 4: top-level require() → import", () => {
      test("converts plain require to namespace import", () => {
        expect.hasAssertions();

        expect(transform('const utils = require("./utils");\n', AJV_ID)).toBe('import * as utils from "./utils";\n');
      });

      test("converts var keyword require to namespace import", () => {
        expect.hasAssertions();

        expect(transform('var utils = require("./utils");\n', AJV_ID)).toBe('import * as utils from "./utils";\n');
      });

      test("unwraps mutated require var via ns.default ?? ns", () => {
        expect.hasAssertions();

        const code = 'const equal = require("fast-deep-equal");\nequal.code = "...";\n';
        const result = transform(code, AJV_ID);

        expect(result).toContain('import * as _equal_ns from "fast-deep-equal";\n');
        expect(result).toContain("const equal = (_equal_ns.default ?? _equal_ns);\n");
      });

      test("unwraps callable require var via ns.default ?? ns", () => {
        expect.hasAssertions();

        const code = 'const fn = require("./fn");\nfn();\n';
        const result = transform(code, AJV_ID);

        expect(result).toContain('import * as _fn_ns from "./fn";\n');
        expect(result).toContain("const fn = (_fn_ns.default ?? _fn_ns);\n");
      });

      test("does not unwrap read-only require var", () => {
        expect.hasAssertions();

        // Property read (utils.foo) must not trigger unwrap — only assignment/call does.
        const code = 'const utils = require("./utils");\nconst x = utils.foo;\n';

        expect(transform(code, AJV_ID)).toBe('import * as utils from "./utils";\nconst x = utils.foo;\n');
      });

      test("does not unwrap require var whose name is a suffix of another identifier", () => {
        expect.hasAssertions();

        // 'fn' must not be flagged because 'ifn.bar = 1' contains it — \\b prevents the false match.
        const code = 'const fn = require("./fn");\nconst ifn = {};\nifn.bar = 1;\n';

        expect(transform(code, AJV_ID)).toBe(
          'import * as fn from "./fn";\nconst ifn = {};\nifn.bar = 1;\n',
        );
      });
    });

    describe("step 5: inline require() → extracted import prepended at top", () => {
      test("extracts inline relative require and replaces with unwrapped reference", () => {
        expect.hasAssertions();

        const code = 'function foo() { return require("./bar"); }\n';
        const result = transform(code, AJV_ID);

        expect(result?.startsWith('import * as bar from "./bar";\n')).toBe(true);
        expect(result).toContain("(bar.default ?? bar)");
        expect(result).not.toContain('require("./bar")');
      });

      test("skips non-relative package paths in inline requires", () => {
        expect.hasAssertions();

        // Package-name paths appear in code-gen strings like `fn.code = 'require("pkg")'`
        // And must not be extracted as imports.
        const code = "equal.code = 'require(\"ajv/dist/runtime/equal\").default';\n";
        const result = transform(code, AJV_ID);

        expect(result).toContain('require("ajv/dist/runtime/equal")');
      });
    });

    describe("steps 6–8: module.exports assignments", () => {
      test("step 6: removes module.exports = exports = X", () => {
        expect.hasAssertions();

        expect(transform("module.exports = exports = Ajv;\n", AJV_ID)).toBe("");
      });

      test("step 7: converts module.exports = X to export default", () => {
        expect.hasAssertions();

        const result = transform("module.exports = Ajv;\n", JSON_SCHEMA_TRAVERSE_ID);

        expect(result).toContain("Ajv.default = Ajv;");
        expect(result).toContain("export default Ajv;");
      });

      test("step 7: skips module.exports = X when exports.default is present (handled by step 11)", () => {
        expect.hasAssertions();

        const code = "exports.default = Ajv;\nmodule.exports = Ajv;\n";
        const result = transform(code, AJV_ID);

        // Module.exports line is suppressed; exports.default becomes the export
        expect(result).not.toMatch(/^export default Ajv;\nexport default Ajv;/m);
        expect(result).toContain("export default Ajv;");
      });

      test("step 8: removes module.exports.X = Y", () => {
        expect.hasAssertions();

        expect(transform("module.exports.validate = validate;\n", AJV_ID)).toBe("");
      });
    });

    describe("step 9: var X = module.exports = function...{} chained assignment", () => {
      test("converts chained assignment to const + export default", () => {
        expect.hasAssertions();

        const code = "var traverse = module.exports = function traverse(schema) {\n  return schema;\n};\n";
        const result = transform(code, JSON_SCHEMA_TRAVERSE_ID);

        expect(result).toContain("const traverse = function traverse(schema) {");
        expect(result).toContain("traverse.default = traverse;");
        expect(result).toContain("export default traverse;");
        expect(result).not.toContain("module.exports");
      });
    });

    describe("step 10: multiline module.exports = { ... } or function...{}", () => {
      test("converts multiline object export to export default", () => {
        expect.hasAssertions();

        const code = "module.exports = {\n  foo: 1,\n};\n";

        expect(transform(code, AJV_ID)).toBe("export default {\n  foo: 1,\n};\n");
      });

      test("converts multiline function export to export default", () => {
        expect.hasAssertions();

        const code = "module.exports = function setup(env) {\n  return env;\n};\n";
        const result = transform(code, AJV_ID);

        expect(result).toContain("export default function setup(env) {");
      });
    });

    describe("steps 11–14: exports.X → named exports", () => {
      test("step 11: converts exports.default = X to export default", () => {
        expect.hasAssertions();

        const result = transform("exports.default = Ajv;\n", AJV_ID);

        expect(result).toContain("Ajv.default = Ajv;");
        expect(result).toContain("export default Ajv;");
      });

      test("step 12: converts exports.X = X (self-reference) to export { X }", () => {
        expect.hasAssertions();

        expect(transform("exports.validate = validate;\n", AJV_ID)).toBe("export { validate };\n");
      });

      test("step 13: converts ODP re-export with same name to re-export from", () => {
        expect.hasAssertions();

        const code =
          'const fmt = require("./format");\nObject.defineProperty(exports, "FormatName", { enumerable: true, get: function () { return fmt.FormatName; } });\n';
        const result = transform(code, AJV_FORMATS_ID);

        expect(result).toContain('export { FormatName } from "./format";');
      });

      test("step 13: converts ODP re-export with aliased name to renamed re-export from", () => {
        expect.hasAssertions();

        const code =
          'const fmt = require("./format");\nObject.defineProperty(exports, "Foo", { enumerable: true, get: function () { return fmt.Bar; } });\n';
        const result = transform(code, AJV_FORMATS_ID);

        expect(result).toContain('export { Bar as Foo } from "./format";');
      });

      test("step 13: converts ODP re-export of default to named re-export from", () => {
        expect.hasAssertions();

        const code =
          'const fmt = require("./format");\nObject.defineProperty(exports, "Foo", { enumerable: true, get: function () { return fmt.default; } });\n';
        const result = transform(code, AJV_FORMATS_ID);

        expect(result).toContain('export { default as Foo } from "./format";');
      });

      test("step 14: converts single-line exports.X = expr to export const", () => {
        expect.hasAssertions();

        expect(transform("exports.validate = function(data) { return true; };\n", AJV_ID)).toBe(
          "export const validate = function(data) { return true; };\n",
        );
      });

      test("step 14: converts multiline exports.X = { ... } to export const", () => {
        expect.hasAssertions();

        const code = "exports.formats = {\n  email: /pattern/,\n};\n";

        expect(transform(code, AJV_ID)).toBe("export const formats = {\n  email: /pattern/,\n};\n");
      });

      test("step 14: converts multiline exports.X = [ ... ] to export const", () => {
        expect.hasAssertions();

        const code = "exports.items = [\n  'a',\n  'b',\n];\n";

        expect(transform(code, AJV_ID)).toBe("export const items = [\n  'a',\n  'b',\n];\n");
      });
    });

    describe("step 15: TypeScript enum IIFEs", () => {
      test("exports enum from IIFE pattern", () => {
        expect.hasAssertions();

        const code =
          'var Type;\n(function (Type) {\n  Type[Type["Str"] = 0] = "Str";\n})(Type || (exports.Type = Type = {}));\n';
        const result = transform(code, AJV_ID);

        expect(result).toContain("export { Type };");
        expect(result).not.toContain("exports.Type");
      });
    });

    describe("step 16: remaining exports.X reads", () => {
      test("replaces remaining exports.X reads with bare identifier", () => {
        expect.hasAssertions();

        // An internal read that is not a top-level assignment (so steps 11–14 don't catch it)
        const code = "exports.default = Ajv;\nconst alias = exports.validate;\n";
        const result = transform(code, AJV_ID);

        expect(result).toContain("const alias = validate;");
        expect(result).not.toContain("exports.validate");
      });
    });

    describe(".default = self patch", () => {
      test("adds .default = self on default-exported identifier for CJS interop", () => {
        expect.hasAssertions();

        const result = transform("module.exports = Ajv;\n", JSON_SCHEMA_TRAVERSE_ID);

        expect(result).toContain("Ajv.default = Ajv;");
      });

      test("does not add .default patch for non-identifier default exports", () => {
        expect.hasAssertions();

        // Object literal default — no identifier to patch
        const result = transform("module.exports = {\n  foo: 1,\n};\n", AJV_ID);

        expect(result).not.toContain(".default =");
      });
    });
  });
});
