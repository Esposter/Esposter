import { TEST_CHILDREN, TEST_DOCUMENT, TEST_REGISTRY } from "#src/services/constants.test";
import { getSiblingMoveOperations } from "#src/services/getSiblingMoveOperations";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getSiblingMoveOperations, () => {
  test("moving a node down past its next sibling", () => {
    expect.hasAssertions();

    const operations = getSiblingMoveOperations(TEST_DOCUMENT, TEST_REGISTRY, TEST_CHILDREN, "/content/0", 1);
    const { document } = applyPatches(TEST_DOCUMENT, operations);

    expect(document.content).toStrictEqual([TEST_DOCUMENT.content[1], TEST_DOCUMENT.content[0]]);
  });

  test.each([
    ["the last node moved down", "/content/1", 1],
    ["the first node moved up", "/content/0", -1],
    ["a pointer that names no node", "/content/5", 1],
  ])("no move for %s", (_title, nodePointer, offset) => {
    expect.hasAssertions();

    expect(getSiblingMoveOperations(TEST_DOCUMENT, TEST_REGISTRY, TEST_CHILDREN, nodePointer, offset)).toStrictEqual(
      [],
    );
  });
});
