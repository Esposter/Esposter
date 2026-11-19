import { findHeldComponents } from "#src/services/genshinParity/componentReference/findHeldComponents";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

const SCREEN = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}/Index.vue`;
const CHILD = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}/${TEST_FILENAME}/Index.vue`;
const ORPHAN = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}b/Index.vue`;
const OTHER_SCREEN = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}c/Index.vue`;

describe(findHeldComponents, () => {
  test("holds what a referenced screen imports, and stops at another screen it mounts", () => {
    expect.hasAssertions();

    const imports = new Map([
      [OTHER_SCREEN, [ORPHAN]],
      [SCREEN, [CHILD, OTHER_SCREEN]],
    ]);

    expect(findHeldComponents(imports, new Set([SCREEN]), new Set([OTHER_SCREEN]), new Set())).toStrictEqual(
      new Set([CHILD, SCREEN]),
    );
  });

  test("holds a component a spec names beside its reference", () => {
    expect.hasAssertions();

    expect(findHeldComponents(new Map(), new Set(), new Set(), new Set([ORPHAN]))).toStrictEqual(new Set([ORPHAN]));
  });
});
