import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { renameSource } from "#src/services/identifiers/rename/renameSource";
import { describe, expect, test } from "vitest";

describe(renameSource, () => {
  const renameMap: RenameMap = { accessors: ["q"], modules: ["m"], renames: { a: "b" }, sources: [], specifiers: {} };

  test("renames a bound name in code and leaves strings, comments, template text, keys and properties", () => {
    expect.hasAssertions();

    expect(
      renameSource(
        "a.ts",
        // oxlint-disable-next-line no-template-curly-in-string -- A fixture of source text, whose template literal is the code under test
        'import { a } from "m";\n// a\nconst c = { a: a, ...a };\nc.a;\n"a";\n`a ${a}`;\n',
        renameMap,
        false,
      ),
      // oxlint-disable-next-line no-template-curly-in-string -- A fixture of source text, whose template literal is the code under test
    ).toBe('import { b } from "m";\n// a\nconst c = { a: b, ...b };\nc.a;\n"a";\n`a ${b}`;\n');
  });

  test("leaves a name the file does not bind", () => {
    expect.hasAssertions();

    expect(renameSource("a.ts", 'import { a } from "n";\na;\n', renameMap, false)).toBe('import { a } from "n";\na;\n');
  });

  test("renames an aliased import in the import alone", () => {
    expect.hasAssertions();

    expect(renameSource("a.ts", 'import { a as c } from "m";\nc;\n', renameMap, false)).toBe(
      'import { b as c } from "m";\nc;\n',
    );
  });

  test("renames a read through an accessor in any file", () => {
    expect.hasAssertions();

    expect(renameSource("a.ts", "d.q.a;\nd.a;\n", renameMap, false)).toBe("d.q.b;\nd.a;\n");
  });

  test("renames a source's own declaration", () => {
    expect.hasAssertions();

    expect(renameSource("a.ts", "export const a = 0;\n", renameMap, true)).toBe("export const b = 0;\n");
  });

  test("rewrites a moved file's specifier whole", () => {
    expect.hasAssertions();

    expect(
      renameSource("a.ts", 'import "m/a";\nimport "m/ab";\n', { ...renameMap, specifiers: { "m/a": "m/b" } }, false),
    ).toBe('import "m/b";\nimport "m/ab";\n');
  });

  test("renames a Vue file inside its script alone", () => {
    expect.hasAssertions();

    expect(
      renameSource(
        "a.vue",
        '<script setup lang="ts">\nimport { a } from "m";\n</script>\n<template>a</template>\n',
        renameMap,
        false,
      ),
    ).toBe('<script setup lang="ts">\nimport { b } from "m";\n</script>\n<template>a</template>\n');
  });
});
