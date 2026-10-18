import type { BlockDocument } from "#src/models/BlockDocument";

import {
  TEST_DOCUMENT,
  TEST_HEADING_ID,
  TEST_ITEM_ID,
  TEST_LIST_ID,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { getBlockLayerRows } from "#src/services/getBlockLayerRows";
import { describe, expect, test } from "vitest";

describe(getBlockLayerRows, () => {
  test("the layer rows of the test document", () => {
    expect.hasAssertions();

    expect(getBlockLayerRows(TEST_DOCUMENT, TEST_REGISTRY)).toStrictEqual([
      { depth: 0, nodePointer: "/content/0", type: "section" },
      { depth: 1, nodePointer: "/content/0/props/children/0", type: "heading" },
      { depth: 0, nodePointer: "/content/1", type: "section" },
    ]);
  });

  test("a node's row comes before the rows of its slots, in document order", () => {
    expect.hasAssertions();

    const document: BlockDocument = {
      content: [
        {
          props: {
            children: [
              { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
              {
                props: { id: TEST_LIST_ID, items: [{ props: { id: TEST_ITEM_ID, text: "" }, type: "item" }] },
                type: "list",
              },
            ],
            id: TEST_SECTION_ID,
          },
          type: "section",
        },
        { props: { children: [], id: TEST_SECTION_OTHER_ID }, type: "section" },
      ],
      root: { props: { title: "" } },
    };

    expect(getBlockLayerRows(document, TEST_REGISTRY)).toStrictEqual([
      { depth: 0, nodePointer: "/content/0", type: "section" },
      { depth: 1, nodePointer: "/content/0/props/children/0", type: "heading" },
      { depth: 1, nodePointer: "/content/0/props/children/1", type: "list" },
      { depth: 2, nodePointer: "/content/0/props/children/1/props/items/0", type: "item" },
      { depth: 0, nodePointer: "/content/1", type: "section" },
    ]);
  });
});
