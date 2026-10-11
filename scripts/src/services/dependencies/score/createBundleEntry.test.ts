import type { ImportStatement } from "#src/models/dependencies/score/ImportStatement";

import { createBundleEntry } from "#src/services/dependencies/score/createBundleEntry";
import { describe, expect, test } from "vitest";

describe(createBundleEntry, () => {
  test("re-exports each imported name under an alias, so two specifiers of one package never collide", () => {
    expect.hasAssertions();

    const statements: ImportStatement[] = [
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["ref", "default"], specifier: "pkg" },
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["ref"], specifier: "pkg/sub" },
    ];

    expect(createBundleEntry(statements)).toBe(
      'export { ref as ref_0, default as default_1 } from "pkg";\nexport { ref as ref_2 } from "pkg/sub";',
    );
  });

  test("re-exports a namespace whole and keeps a side-effect import as written, subpath included", () => {
    expect.hasAssertions();

    const statements: ImportStatement[] = [
      { hasNamespace: true, isSideEffect: false, isTypeOnly: false, names: [], specifier: "pkg" },
      { hasNamespace: false, isSideEffect: true, isTypeOnly: false, names: [], specifier: "pkg/styles" },
    ];

    expect(createBundleEntry(statements)).toBe('export * as namespace_0 from "pkg";\nimport "pkg/styles";');
  });

  test("leaves a type-only import and a repeated import out of the entry", () => {
    expect.hasAssertions();

    const statements: ImportStatement[] = [
      { hasNamespace: false, isSideEffect: false, isTypeOnly: true, names: ["Options"], specifier: "pkg" },
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["ref"], specifier: "pkg" },
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["ref"], specifier: "pkg" },
    ];

    expect(createBundleEntry(statements)).toBe('export { ref as ref_0 } from "pkg";');
  });
});
