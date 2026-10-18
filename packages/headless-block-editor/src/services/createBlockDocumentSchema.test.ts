import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import {
  TEST_DOCUMENT,
  TEST_DOCUMENT_NODE_COUNT,
  TEST_HEADING_ID,
  TEST_LIST_ID,
  TEST_REGISTRY,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { describe, expect, test } from "vitest";

describe(createBlockDocumentSchema, () => {
  test("a child its slot does not allow", () => {
    expect.hasAssertions();

    const document: BlockDocument = {
      content: [
        {
          props: { id: TEST_LIST_ID, items: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }] },
          type: "list",
        },
      ],
      root: { props: {} },
    };
    const { error, success } = createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT).safeParse(document);

    expect(success).toBe(false);
    expect(error?.issues.map((issue) => issue.path)).toStrictEqual([["content", 0, "props", "items", 0]]);
  });

  test("a document from another registry", () => {
    expect.hasAssertions();

    const otherRegistry: BlockRegistry = TEST_REGISTRY.filter((definition) => definition.type !== "list");
    const document: BlockDocument = {
      content: [{ props: { id: TEST_LIST_ID, items: [] }, type: "list" }],
      root: { props: {} },
    };

    expect(createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT).safeParse(TEST_DOCUMENT).success).toBe(
      true,
    );
    expect(createBlockDocumentSchema(otherRegistry, TEST_DOCUMENT_NODE_COUNT).safeParse(document).success).toBe(false);
  });

  test("a document past its node limit", () => {
    expect.hasAssertions();

    expect(
      createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT - 1).safeParse(TEST_DOCUMENT).success,
    ).toBe(false);
    expect(createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT).safeParse(TEST_DOCUMENT).success).toBe(
      true,
    );
  });

  test("a document with a repeated id", () => {
    expect.hasAssertions();

    const document: BlockDocument = {
      content: [
        ...TEST_DOCUMENT.content,
        {
          props: {
            children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
            id: TEST_SECTION_OTHER_ID,
          },
          type: "section",
        },
      ],
      root: { props: {} },
    };

    expect(createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT + 2).safeParse(document).success).toBe(
      false,
    );
  });
});
