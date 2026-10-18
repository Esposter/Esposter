import type { BlockDocument } from "#src/models/BlockDocument";

import {
  TEST_DOCUMENT,
  TEST_HEADING_ID,
  TEST_ITEM_ID,
  TEST_LIST_ID,
  TEST_SECTION_ID,
} from "#src/services/constants.test";
import { getFocusAfterRemoval } from "#src/services/getFocusAfterRemoval";
import { describe, expect, test } from "vitest";

describe(getFocusAfterRemoval, () => {
  const threeSiblingsDocument: BlockDocument = {
    content: [
      {
        props: {
          children: [
            { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
            { props: { id: TEST_LIST_ID, items: [] }, type: "list" },
            { props: { id: TEST_ITEM_ID, text: "" }, type: "item" },
          ],
          id: TEST_SECTION_ID,
        },
        type: "section",
      },
    ],
    root: { props: {} },
  };

  test("removing the last child", () => {
    expect.hasAssertions();

    expect(getFocusAfterRemoval(TEST_DOCUMENT, "/content/0/props/children/0")).toBe("/content/0");
  });

  test.each<[string, string, string]>([
    ["removing a middle child focuses its next sibling", "/content/0/props/children/1", "/content/0/props/children/1"],
    [
      "removing the last of three focuses the previous sibling",
      "/content/0/props/children/2",
      "/content/0/props/children/1",
    ],
    ["a pointer past the end of its slot", "/content/0/props/children/3", ""],
    ["a pointer under a missing parent", "/content/5/props/children/0", ""],
  ])("%s", (_title, nodePointer, expected) => {
    expect.hasAssertions();

    expect(getFocusAfterRemoval(threeSiblingsDocument, nodePointer)).toBe(expected);
  });
});
