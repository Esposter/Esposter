import { parseImportStatements } from "#src/services/dependencies/score/parseImportStatements";
import { describe, expect, test } from "vitest";

describe(parseImportStatements, () => {
  test("reads named, default, namespace and multi-line clauses, each with its specifier", () => {
    expect.hasAssertions();

    const source = [
      'import { ref, computed as derived } from "vue";',
      'import pinia, { defineStore } from "pinia";',
      'import * as zod from "zod";',
      "import {",
      "  watch,",
      '} from "vue/subpath";',
    ].join("\n");

    expect(parseImportStatements(source)).toStrictEqual([
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["ref", "computed"], specifier: "vue" },
      {
        hasNamespace: false,
        isSideEffect: false,
        isTypeOnly: false,
        names: ["default", "defineStore"],
        specifier: "pinia",
      },
      { hasNamespace: true, isSideEffect: false, isTypeOnly: false, names: [], specifier: "zod" },
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["watch"], specifier: "vue/subpath" },
    ]);
  });

  test("reads type-only statements, type names beside value names, side-effect and dynamic imports", () => {
    expect.hasAssertions();

    const source = [
      'import type { Packument } from "npm-registry";',
      'import { type Options, parse } from "parser";',
      'import "reflect-metadata";',
      'const module = await import("lazy-lib");',
    ].join("\n");

    expect(parseImportStatements(source)).toStrictEqual([
      { hasNamespace: false, isSideEffect: false, isTypeOnly: true, names: ["Packument"], specifier: "npm-registry" },
      { hasNamespace: false, isSideEffect: false, isTypeOnly: false, names: ["parse"], specifier: "parser" },
      { hasNamespace: false, isSideEffect: true, isTypeOnly: false, names: [], specifier: "reflect-metadata" },
      { hasNamespace: true, isSideEffect: false, isTypeOnly: false, names: [], specifier: "lazy-lib" },
    ]);
  });
});
