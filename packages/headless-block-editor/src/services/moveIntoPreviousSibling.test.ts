import type { BlockDocument } from "#src/models/BlockDocument";

import { TEST_HEADING_ID, TEST_LIST_ID, TEST_REGISTRY, TEST_SECTION_ID } from "#src/services/constants.test";
import { moveIntoPreviousSibling } from "#src/services/moveIntoPreviousSibling";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(moveIntoPreviousSibling, () => {
  const sectionAndHeadingDocument: BlockDocument = {
    content: [
      { props: { children: [], id: TEST_SECTION_ID }, type: "section" },
      { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
    ],
    root: { props: {} },
  };

  test("moving into a sibling that refuses the node", () => {
    expect.hasAssertions();

    const document: BlockDocument = {
      content: [
        { props: { id: TEST_LIST_ID, items: [] }, type: "list" },
        { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
      ],
      root: { props: {} },
    };

    expect(moveIntoPreviousSibling(document, TEST_REGISTRY, "/content/1")).toStrictEqual([]);
  });

  test("moving into a sibling whose slot accepts the node", () => {
    expect.hasAssertions();

    const operations = moveIntoPreviousSibling(sectionAndHeadingDocument, TEST_REGISTRY, "/content/1");

    expect(applyPatches(sectionAndHeadingDocument, operations).document.content).toStrictEqual([
      {
        props: { children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }], id: TEST_SECTION_ID },
        type: "section",
      },
    ]);
  });
});
