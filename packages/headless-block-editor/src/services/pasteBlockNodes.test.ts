import type { BlockNode } from "#src/models/BlockNode";

import {
  TEST_DOCUMENT,
  TEST_DOCUMENT_NODE_COUNT,
  TEST_HEADING_ID,
  TEST_REGISTRY,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { pasteBlockNodes } from "#src/services/pasteBlockNodes";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(pasteBlockNodes, () => {
  const TEST_IMAGE_ID: string = crypto.randomUUID();

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

    expect(
      pasteBlockNodes(TEST_DOCUMENT, TEST_REGISTRY, [{ props: { id: TEST_IMAGE_ID }, type: "image" }], "/content", 2),
    ).toStrictEqual([]);
  });
});
