import type { TestDocument } from "#src/services/constants.test";

import {
  TEST_DOCUMENT,
  TEST_HEADING_ID,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { moveBlockNode } from "#src/services/moveBlockNode";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(moveBlockNode, () => {
  test("reversing a move", () => {
    expect.hasAssertions();

    const operations = moveBlockNode(
      TEST_DOCUMENT,
      TEST_REGISTRY,
      `/content/0/props/children/0`,
      `/content/1/props/children`,
      0,
    );
    const { document: movedDocument, inverses } = applyPatches(TEST_DOCUMENT, operations);

    expect(movedDocument.content).toStrictEqual([
      { props: { children: [], id: TEST_SECTION_ID, title: "" }, type: "section" },
      {
        props: {
          children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
          id: TEST_SECTION_OTHER_ID,
          title: "",
        },
        type: "section",
      },
    ]);
    expect(applyPatches(movedDocument, inverses).document).toStrictEqual(TEST_DOCUMENT);
  });

  test("a node into a slot that refuses its type", () => {
    expect.hasAssertions();

    expect(moveBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/1", "/content/0/props/children", 0)).toStrictEqual([]);
  });

  test("moving a node into a later sibling", () => {
    expect.hasAssertions();

    const document: TestDocument = {
      content: [
        { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
        { props: { children: [], id: TEST_SECTION_OTHER_ID, title: "" }, type: "section" },
      ],
      root: { props: { title: "" } },
    };
    const operations = moveBlockNode(document, TEST_REGISTRY, "/content/0", "/content/1/props/children", 0);

    expect(applyPatches(document, operations).document.content).toStrictEqual([
      {
        props: {
          children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
          id: TEST_SECTION_OTHER_ID,
          title: "",
        },
        type: "section",
      },
    ]);
  });
});
