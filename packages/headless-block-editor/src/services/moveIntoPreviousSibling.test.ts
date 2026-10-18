import type { BlockDocument } from "#src/models/BlockDocument";

import { applyPatches } from "@esposter/shared";
import { TEST_HEADING_ID, TEST_LIST_ID, TEST_REGISTRY } from "#src/services/constants.test";
import { moveIntoPreviousSibling } from "#src/services/moveIntoPreviousSibling";
import { describe, expect, test } from "vitest";

describe(moveIntoPreviousSibling, () => {
  test("moving into a sibling that refuses the node", () => {
    expect.hasAssertions();

    const document: BlockDocument = {
      content: [
        { props: { id: TEST_LIST_ID, items: [] }, type: "list" },
        { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
      ],
      root: { props: {} },
    };
    const operations = moveIntoPreviousSibling(document, TEST_REGISTRY, "/content/1");

    expect(operations).toStrictEqual([]);
    expect(applyPatches(document, operations).document).toStrictEqual(document);
  });

  test("moving into a sibling whose slot accepts the node", () => {
    expect.hasAssertions();

    const operations = moveIntoPreviousSibling(
      {
        content: [
          { props: { children: [], id: TEST_LIST_ID }, type: "section" },
          { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
        ],
        root: { props: {} },
      },
      TEST_REGISTRY,
      "/content/1",
    );

    expect(
      applyPatches(
        {
          content: [
            { props: { children: [], id: TEST_LIST_ID }, type: "section" },
            { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
          ],
          root: { props: {} },
        },
        operations,
      ).document.content,
    ).toStrictEqual([
      {
        props: { children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }], id: TEST_LIST_ID },
        type: "section",
      },
    ]);
  });
});
