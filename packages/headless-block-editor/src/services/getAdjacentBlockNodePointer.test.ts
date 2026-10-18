import { TEST_DOCUMENT, TEST_REGISTRY } from "#src/services/constants.test";
import { getAdjacentBlockNodePointer } from "#src/services/getAdjacentBlockNodePointer";
import { describe, expect, test } from "vitest";

describe(getAdjacentBlockNodePointer, () => {
  test("previous and next across a slot boundary", () => {
    expect.hasAssertions();

    expect(getAdjacentBlockNodePointer(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/children/0", 1)).toBe(
      "/content/1",
    );
    expect(getAdjacentBlockNodePointer(TEST_DOCUMENT, TEST_REGISTRY, "/content/1", -1)).toBe(
      "/content/0/props/children/0",
    );
  });

  test("previous and next at both ends", () => {
    expect.hasAssertions();

    expect(getAdjacentBlockNodePointer(TEST_DOCUMENT, TEST_REGISTRY, "/content/0", -1)).toStrictEqual(undefined);
    expect(getAdjacentBlockNodePointer(TEST_DOCUMENT, TEST_REGISTRY, "/content/1", 1)).toStrictEqual(undefined);
  });

  test("a pointer naming no node", () => {
    expect.hasAssertions();

    expect(getAdjacentBlockNodePointer(TEST_DOCUMENT, TEST_REGISTRY, "/content/5", 1)).toStrictEqual(undefined);
  });
});
