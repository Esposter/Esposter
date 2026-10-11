import type { BundleScope } from "#src/models/dependencies/score/BundleScope";

import { getBundleSkipReason } from "#src/services/dependencies/score/getBundleSkipReason";
import { describe, expect, test } from "vitest";

const createScope = (overrides: Partial<BundleScope> = {}): BundleScope => ({
  clientImporterCount: 1,
  importerCount: 1,
  isNuxtModule: false,
  isTypesOnly: false,
  packageName: "pkg",
  valueClientImporterCount: 1,
  ...overrides,
});

describe(getBundleSkipReason, () => {
  test("measures a package a client file imports", () => {
    expect.hasAssertions();

    expect(getBundleSkipReason(createScope())).toBeUndefined();
  });

  test.each([
    ["a declarations package", createScope({ packageName: "@types/node" }), "types-only"],
    ["a package whose every value import is a type", createScope({ isTypesOnly: true }), "types-only"],
    ["a Nuxt module", createScope({ isNuxtModule: true }), "Nuxt module"],
    ["a package nothing imports", createScope({ clientImporterCount: 0, importerCount: 0 }), "not imported"],
    ["a package only the server imports", createScope({ clientImporterCount: 0 }), "server-only"],
    ["a package only a test imports", createScope({ valueClientImporterCount: 0 }), "dev-only"],
  ])("skips %s", (_, scope, skipReason) => {
    expect.hasAssertions();

    expect(getBundleSkipReason(scope)).toBe(skipReason);
  });
});
