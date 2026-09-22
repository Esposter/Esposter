import { describe, expect, test } from "vitest";

import { fixAjv } from "./fixAjv";

const transform = (code: string, id: string) => fixAjv.transform(code, id);

describe("fixAjv", () => {
  const AJV_ID = "/node_modules/ajv/dist/compile/util.js";
  const AJV_FORMATS_ID = "/node_modules/ajv-formats/dist/formats.js";
  const JSON_SCHEMA_TRAVERSE_ID = "/node_modules/json-schema-traverse/index.js";
  const BROWSER_JS_ID = "/node_modules/debug/src/browser.js";
  const COMMON_JS_ID = "/node_modules/debug/src/common.js";

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

      expect(transform('"use strict";\nexports.formatters = {};\n', BROWSER_JS_ID)).toMatchInlineSnapshot(`
        "const _exports = {}
        _exports.formatters = {};
        "
      `);
    });

    test("extracts inline relative require as import and replaces with unwrapped reference", () => {
      expect.hasAssertions();

      expect(transform('module.exports = require("./common")(exports);\n', BROWSER_JS_ID)).toMatchInlineSnapshot(`
        "import * as common from "./common";
        const _exports = {}
        const _debug = (common.default ?? common)(_exports);
        export default _debug;
        "
      `);
    });

    test("remaps exports.X to _exports.X but leaves module.exports untouched", () => {
      expect.hasAssertions();

      expect(transform("exports.useColors = function() {};\n", BROWSER_JS_ID)).toMatchInlineSnapshot(`
        "const _exports = {}
        _exports.useColors = function() {};
        "
      `);
    });

    test("prepends const _exports = {} to output", () => {
      expect.hasAssertions();

      expect(transform("exports.x = 1;\n", BROWSER_JS_ID)).toMatchInlineSnapshot(`
        "const _exports = {}
        _exports.x = 1;
        "
      `);
    });
  });

  describe("debug/src/common.js", () => {
    test("extracts non-relative inline require as import and replaces with unwrapped reference", () => {
      expect.hasAssertions();

      expect(transform("createDebug.humanize = require('ms');\nmodule.exports = setup;\n", COMMON_JS_ID))
        .toMatchInlineSnapshot(`
        "import * as ms from "ms";
        createDebug.humanize = (ms.default ?? ms);
        setup.default = setup;
        export default setup;
        "
      `);
    });

    test("ignores relative require paths", () => {
      expect.hasAssertions();

      // Relative requires are left as-is (common.js handler does not run generic transform).
      // Note: INLINE_REQUIRE_REGEX normalises quotes to double in the fallback replacement.
      expect(transform("const x = require('./utils');\nmodule.exports = setup;\n", COMMON_JS_ID))
        .toMatchInlineSnapshot(`
        "const x = require("./utils");
        setup.default = setup;
        export default setup;
        "
      `);
    });

    test("converts module.exports = X to export default with .default patch", () => {
      expect.hasAssertions();

      expect(transform("function setup() {}\nmodule.exports = setup;\n", COMMON_JS_ID)).toMatchInlineSnapshot(`
        "function setup() {}
        setup.default = setup;
        export default setup;
        "
      `);
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

        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "import * as _equal_ns from "fast-deep-equal";
          const equal = (_equal_ns.default ?? _equal_ns);
          equal.code = "...";
          "
        `);
      });

      test("unwraps callable require var via ns.default ?? ns", () => {
        expect.hasAssertions();

        const code = 'const fn = require("./fn");\nfn();\n';

        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "import * as _fn_ns from "./fn";
          const fn = (_fn_ns.default ?? _fn_ns);
          fn();
          "
        `);
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

        expect(transform(code, AJV_ID)).toBe('import * as fn from "./fn";\nconst ifn = {};\nifn.bar = 1;\n');
      });
    });

    describe("step 5: inline require() → extracted import prepended at top", () => {
      test("extracts inline relative require and replaces with unwrapped reference", () => {
        expect.hasAssertions();

        const code = 'function foo() { return require("./bar"); }\n';

        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "import * as bar from "./bar";
          function foo() { return (bar.default ?? bar); }
          "
        `);
      });

      test("skips non-relative package paths in inline requires", () => {
        expect.hasAssertions();

        // Package-name paths appear in code-gen strings like `fn.code = 'require("pkg")'`
        // And must not be extracted as imports.
        const code = "equal.code = 'require(\"ajv/dist/runtime/equal\").default';\n";

        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "equal.code = 'require("ajv/dist/runtime/equal").default';
          "
        `);
      });
    });

    describe("steps 6–8: module.exports assignments", () => {
      test("step 6: removes module.exports = exports = X", () => {
        expect.hasAssertions();

        expect(transform("module.exports = exports = Ajv;\n", AJV_ID)).toBe("");
      });

      test("step 7: converts module.exports = X to export default", () => {
        expect.hasAssertions();

        expect(transform("module.exports = Ajv;\n", JSON_SCHEMA_TRAVERSE_ID)).toMatchInlineSnapshot(`
          "Ajv.default = Ajv;
          export default Ajv;
          "
        `);
      });

      test("step 7: skips module.exports = X when exports.default is present (handled by step 11)", () => {
        expect.hasAssertions();

        const code = "exports.default = Ajv;\nmodule.exports = Ajv;\n";

        // The module.exports line is suppressed, so exports.default is the one export left
        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "Ajv.default = Ajv;
          export default Ajv;
          "
        `);
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

        expect(transform(code, JSON_SCHEMA_TRAVERSE_ID)).toMatchInlineSnapshot(`
          "const traverse = function traverse(schema) {
            return schema;
          };
          traverse.default = traverse;
          export default traverse;
          "
        `);
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

        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "export default function setup(env) {
            return env;
          };
          "
        `);
      });
    });

    describe("steps 11–14: exports.X → named exports", () => {
      test("step 11: converts exports.default = X to export default", () => {
        expect.hasAssertions();

        expect(transform("exports.default = Ajv;\n", AJV_ID)).toMatchInlineSnapshot(`
          "Ajv.default = Ajv;
          export default Ajv;
          "
        `);
      });

      test("step 12: converts exports.X = X (self-reference) to export { X }", () => {
        expect.hasAssertions();

        expect(transform("exports.validate = validate;\n", AJV_ID)).toBe("export { validate };\n");
      });

      test("step 13: converts ODP re-export with same name to re-export from", () => {
        expect.hasAssertions();

        const code =
          'const fmt = require("./format");\nObject.defineProperty(exports, "FormatName", { enumerable: true, get: function () { return fmt.FormatName; } });\n';
        expect(transform(code, AJV_FORMATS_ID)).toMatchInlineSnapshot(`
          "import * as fmt from "./format";
          export { FormatName } from "./format";
          "
        `);
      });

      test("step 13: converts ODP re-export with aliased name to renamed re-export from", () => {
        expect.hasAssertions();

        const code =
          'const fmt = require("./format");\nObject.defineProperty(exports, "Foo", { enumerable: true, get: function () { return fmt.Bar; } });\n';
        expect(transform(code, AJV_FORMATS_ID)).toMatchInlineSnapshot(`
          "import * as fmt from "./format";
          export { Bar as Foo } from "./format";
          "
        `);
      });

      test("step 13: converts ODP re-export of default to named re-export from", () => {
        expect.hasAssertions();

        const code =
          'const fmt = require("./format");\nObject.defineProperty(exports, "Foo", { enumerable: true, get: function () { return fmt.default; } });\n';
        expect(transform(code, AJV_FORMATS_ID)).toMatchInlineSnapshot(`
          "import * as fmt from "./format";
          export { default as Foo } from "./format";
          "
        `);
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
        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "var Type;
          (function (Type) {
            Type[Type["Str"] = 0] = "Str";
          })(Type || (Type = Type = {}));
          export { Type };
          "
        `);
      });
    });

    describe("step 16: remaining exports.X reads", () => {
      test("replaces remaining exports.X reads with bare identifier", () => {
        expect.hasAssertions();

        // An internal read that is not a top-level assignment (so steps 11–14 don't catch it)
        const code = "exports.default = Ajv;\nconst alias = exports.validate;\n";

        expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
          "Ajv.default = Ajv;
          export default Ajv;
          const alias = validate;
          "
        `);
      });
    });
  });
});
