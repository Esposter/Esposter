import type { BlockNode } from "#src/models/BlockNode";

import { applyPatches } from "@esposter/shared";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import {
  TEST_DOCUMENT,
  TEST_DOCUMENT_NODE_COUNT,
  TEST_HEADING_ID,
  TEST_REGISTRY,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { pasteBlockNodes } from "#src/services/pasteBlockNodes";
import { describe, expect, test } from "vitest";

describe(pasteBlockNodes, () => {
  test("pasting a node twice", () => {
    expect.hasAssertions();

    const copiedNode: BlockNode = {
      props: { children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }], id: TEST_SECTION_OTHER_ID },
      type: "section",
    };
    const firstPaste = applyPatches(
      TEST_DOCUMENT,
      pasteBlockNodes(TEST_DOCUMENT, TEST_REGISTRY, [copiedNode], "/content", 2),
    );
    const secondPaste = applyPatches(
      firstPaste.document,
      pasteBlockNodes(firstPaste.document, TEST_REGISTRY, [copiedNode], "/content", 3),
    );

    expect(
      createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT + 4).safeParse(secondPaste.document).success,
    ).toBe(true);
    expect(applyPatches(secondPaste.document, secondPaste.inverses).document).toStrictEqual(firstPaste.document);
    expect(applyPatches(firstPaste.document, firstPaste.inverses).document).toStrictEqual(TEST_DOCUMENT);
  });

  test("pasting into another editor", () => {
    expect.hasAssertions();

    const operations = pasteBlockNodes(
      TEST_DOCUMENT,
      TEST_REGISTRY,
      [{ props: { id: TEST_SECTION_OTHER_ID }, type: "image" }],
      "/content",
      2,
    );

    expect(operations).toStrictEqual([]);
    expect(applyPatches(TEST_DOCUMENT, operations).document).toStrictEqual(TEST_DOCUMENT);
  });
});
