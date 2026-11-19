import { findUncoveredComponents } from "#src/services/genshinParity/componentReference/findUncoveredComponents";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

describe(findUncoveredComponents, () => {
  const FOLDER = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}`;
  const UNREFERENCED = `${FOLDER}/Index.vue`;
  const REFERENCED = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}b/Index.vue`;
  const BENEATH_FOLDER = `${FOLDER}/${TEST_FILENAME}/Index.vue`;

  test("names a component no reference holds and no ledger row owes", () => {
    expect.hasAssertions();

    expect(findUncoveredComponents([UNREFERENCED, REFERENCED], new Set([REFERENCED]), [])).toStrictEqual([
      UNREFERENCED,
    ]);
  });

  test("covers every component beneath a ledger row's folder", () => {
    expect.hasAssertions();

    expect(findUncoveredComponents([BENEATH_FOLDER], new Set(), [FOLDER])).toStrictEqual([]);
  });
});
