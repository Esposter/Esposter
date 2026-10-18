import type { BlockRegistry } from "#src/models/BlockRegistry";

import {
  TEST_DOCUMENT,
  TEST_HEADING_ID,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { moveOutAfterParent } from "#src/services/moveOutAfterParent";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(moveOutAfterParent, () => {
  const headingRootRegistry: BlockRegistry = {
    ...TEST_REGISTRY,
    root: { ...TEST_REGISTRY.root, content: ["section", "heading"] },
  };

  test("moving a node out after its parent", () => {
    expect.hasAssertions();

    const operations = moveOutAfterParent(TEST_DOCUMENT, headingRootRegistry, "/content/0/props/children/0");

    expect(applyPatches(TEST_DOCUMENT, operations).document.content).toStrictEqual([
      { props: { children: [], id: TEST_SECTION_ID }, type: "section" },
      { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
      { props: { children: [], id: TEST_SECTION_OTHER_ID }, type: "section" },
    ]);
  });

  test("moving out where the root refuses the node", () => {
    expect.hasAssertions();

    expect(moveOutAfterParent(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/children/0")).toStrictEqual([]);
  });

  test("moving out a node already at the root", () => {
    expect.hasAssertions();

    expect(moveOutAfterParent(TEST_DOCUMENT, headingRootRegistry, "/content/0")).toStrictEqual([]);
  });
});
