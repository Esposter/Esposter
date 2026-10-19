import type { HeadingNode, ItemNode, SectionNode } from "#src/services/constants.test";

import {
  TEST_DOCUMENT,
  TEST_DOCUMENT_NODE_COUNT,
  TEST_HEADING_ID,
  TEST_ITEM_ID,
  TEST_REGISTRY,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { pasteBlockNodes } from "#src/services/pasteBlockNodes";
import { applyPatches, JsonPatchOperationType } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(pasteBlockNodes, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const TEST_IMAGE_ID: string = crypto.randomUUID();
  const TEST_HEADING_COPY_ID = crypto.randomUUID();

  test("pasting a node twice", () => {
    expect.hasAssertions();

    const copiedNode: SectionNode = {
      props: {
        children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
        id: TEST_SECTION_OTHER_ID,
        title: "",
      },
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

  test("a pasted child of a type its slot refuses is refused", () => {
    expect.hasAssertions();

    const copiedItem: ItemNode = { props: { id: TEST_ITEM_ID, text: "" }, type: "item" };

    expect(pasteBlockNodes(TEST_DOCUMENT, TEST_REGISTRY, [copiedItem], "/content/0/props/children", 1)).toStrictEqual(
      [],
    );
  });

  test("pasting a child its root does not accept into a slot that does", () => {
    expect.hasAssertions();

    const copiedHeading: HeadingNode = { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" };
    vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(TEST_HEADING_COPY_ID);

    expect(
      pasteBlockNodes(TEST_DOCUMENT, TEST_REGISTRY, [copiedHeading], "/content/0/props/children", 1),
    ).toStrictEqual([
      {
        op: JsonPatchOperationType.Add,
        path: "/content/0/props/children/1",
        value: { props: { id: TEST_HEADING_COPY_ID, text: "" }, type: "heading" },
      },
    ]);
  });
});
