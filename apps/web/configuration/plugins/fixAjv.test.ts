import { describe, expect, test } from "vitest";

import { fixAjv } from "./fixAjv";

const transform = (code: string, id: string) => fixAjv.transform(code, id);

describe("fixAjv", () => {
  const AJV_ID = "/node_modules/ajv/dist/compile/util.js";
  const AJV_FORMATS_ID = "/node_modules/ajv-formats/dist/formats.js";
  const JSON_SCHEMA_TRAVERSE_ID = "/node_modules/json-schema-traverse/index.js";

  test("filter returns undefined for non-matching paths", () => {
    expect.hasAssertions();

    expect(transform("const x = 1;\n", "/node_modules/lodash/index.js")).toBeUndefined();
    expect(transform("const x = 1;\n", "/node_modules/ajv/src/core.ts")).toBeUndefined();
    expect(transform("const x = 1;\n", "/node_modules/ajv-errors/dist/index.js")).toBeUndefined();
    expect(transform("const x = 1;\n", "/node_modules/debug/src/browser.js")).toBeUndefined();
  });

  test("filter matches expected paths", () => {
    expect.hasAssertions();

    expect(transform("\n", AJV_ID)).toBeDefined();
    expect(transform("\n", AJV_FORMATS_ID)).toBeDefined();
    expect(transform("\n", "/node_modules/fast-uri/lib/utils.js")).toBeDefined();
    expect(transform("\n", JSON_SCHEMA_TRAVERSE_ID)).toBeDefined();
  });

  test("filter strips query string from id", () => {
    expect.hasAssertions();

    expect(transform("\n", `${AJV_ID}?v=123`)).toBeDefined();
  });

  test("filter normalises Windows backslashes in id", () => {
    expect.hasAssertions();

    expect(transform("\n", AJV_ID.replaceAll("/", "\\"))).toBeDefined();
  });

  test('step 1: removes "use strict"; with semicolon', () => {
    expect.hasAssertions();

    expect(transform('"use strict";\nconst x = 1;\n', AJV_ID)).toBe("const x = 1;\n");
  });

  test('step 1: removes "use strict" without a semicolon', () => {
    expect.hasAssertions();

    expect(transform('"use strict"\nconst x = 1;\n', AJV_ID)).toBe("const x = 1;\n");
  });

  test("step 1: removes 'use strict'; with single quotes (fast-uri style)", () => {
    expect.hasAssertions();

    expect(transform("'use strict';\nconst x = 1;\n", AJV_FORMATS_ID)).toBe("const x = 1;\n");
  });

  test("step 2: removes Object.defineProperty __esModule flag", () => {
    expect.hasAssertions();

    const code = 'Object.defineProperty(exports, "__esModule", { value: true });\n';

    expect(transform(code, AJV_ID)).toBe("");
  });

  test("step 3: removes single export void 0 init", () => {
    expect.hasAssertions();

    expect(transform("exports.foo = void 0;\n", AJV_ID)).toBe("");
  });

  test("step 3: removes chained export void 0 init", () => {
    expect.hasAssertions();

    expect(transform("exports.foo = exports.bar = void 0;\n", AJV_ID)).toBe("");
  });

  test("step 4: converts plain require to namespace import", () => {
    expect.hasAssertions();

    expect(transform('const utils = require("./utils");\n', AJV_ID)).toBe('import * as utils from "./utils";\n');
  });

  test("step 4: converts var keyword require to namespace import", () => {
    expect.hasAssertions();

    expect(transform('var utils = require("./utils");\n', AJV_ID)).toBe('import * as utils from "./utils";\n');
  });

  test("step 4: unwraps mutated require var via ns.default ?? ns", () => {
    expect.hasAssertions();

    const code = 'const equal = require("fast-deep-equal");\nequal.code = "...";\n';

    expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
      "import * as _equal_ns from "fast-deep-equal";
      const equal = (_equal_ns.default ?? _equal_ns);
      equal.code = "...";
      "
    `);
  });

  test("step 4: unwraps callable require var via ns.default ?? ns", () => {
    expect.hasAssertions();

    const code = 'const fn = require("./fn");\nfn();\n';

    expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
      "import * as _fn_ns from "./fn";
      const fn = (_fn_ns.default ?? _fn_ns);
      fn();
      "
    `);
  });

  test("step 4: does not unwrap read-only require var", () => {
    expect.hasAssertions();

    // Property read (utils.foo) must not trigger unwrap — only assignment/call does.
    const code = 'const utils = require("./utils");\nconst x = utils.foo;\n';

    expect(transform(code, AJV_ID)).toBe('import * as utils from "./utils";\nconst x = utils.foo;\n');
  });

  test("step 4: does not unwrap require var whose name is a suffix of another identifier", () => {
    expect.hasAssertions();

    // 'fn' must not be flagged because 'ifn.bar = 1' contains it — \\b prevents the false match.
    const code = 'const fn = require("./fn");\nconst ifn = {};\nifn.bar = 1;\n';

    expect(transform(code, AJV_ID)).toBe('import * as fn from "./fn";\nconst ifn = {};\nifn.bar = 1;\n');
  });

  test("step 5: extracts inline relative require and replaces with unwrapped reference", () => {
    expect.hasAssertions();

    const code = 'function foo() { return require("./bar"); }\n';

    expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
      "import * as bar from "./bar";
      function foo() { return (bar.default ?? bar); }
      "
    `);
  });

  test("step 5: skips non-relative package paths in inline requires", () => {
    expect.hasAssertions();

    // Package-name paths appear in code-gen strings like `fn.code = 'require("pkg")'`
    // And must not be extracted as imports.
    const code = "equal.code = 'require(\"ajv/dist/runtime/equal\").default';\n";

    expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
      "equal.code = 'require("ajv/dist/runtime/equal").default';
      "
    `);
  });

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

  test("step 9: converts chained assignment to const + export default", () => {
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

  test("step 10: converts multiline object export to export default", () => {
    expect.hasAssertions();

    const code = "module.exports = {\n  foo: 1,\n};\n";

    expect(transform(code, AJV_ID)).toBe("export default {\n  foo: 1,\n};\n");
  });

  test("step 10: converts multiline function export to export default", () => {
    expect.hasAssertions();

    const code = "module.exports = function setup(env) {\n  return env;\n};\n";

    expect(transform(code, AJV_ID)).toMatchInlineSnapshot(`
      "export default function setup(env) {
        return env;
      };
      "
    `);
  });

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

  test("step 15: exports enum from IIFE pattern", () => {
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

  test("step 16: replaces remaining exports.X reads with bare identifier", () => {
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
