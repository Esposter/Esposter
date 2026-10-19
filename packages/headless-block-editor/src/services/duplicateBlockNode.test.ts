import type { HeadingNodeProps } from "#src/services/constants.test";

import { applyBlockEdit } from "#src/services/applyBlockEdit";
import {
  TEST_DOCUMENT,
  TEST_DOCUMENT_NODE_COUNT,
  TEST_HEADING_ID,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_SECTION_OTHER_ID,
} from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { duplicateBlockNode } from "#src/services/duplicateBlockNode";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { assert, describe, expect, test } from "vitest";

describe(duplicateBlockNode, () => {
  // A duplicate adds one node to the document, so the schema allows one more
  const schema = createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT + 1);

  test("duplicating a node places its copy after it", () => {
    expect.hasAssertions();

    const duplicated = applyBlockEdit(
      schema,
      TEST_DOCUMENT,
      duplicateBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/children/0"),
    ).match(
      ({ document }) => document,
      () => undefined,
    );
    assert.exists(duplicated);
    const edited = applyBlockEdit(
      schema,
      duplicated,
      updateBlockNodeProps<HeadingNodeProps>("/content/0/props/children/1", { text: "copied" }),
    ).match(
      ({ document }) => document,
      () => undefined,
    );
    assert.exists(edited);

    expect(edited.content).toStrictEqual([
      {
        props: {
          children: [
            { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
            { props: { id: expect.not.stringMatching(TEST_HEADING_ID), text: "copied" }, type: "heading" },
          ],
          id: TEST_SECTION_ID,
          title: "",
        },
        type: "section",
      },
      { props: { children: [], id: TEST_SECTION_OTHER_ID, title: "" }, type: "section" },
    ]);
  });

  test("duplicating a pointer naming no node", () => {
    expect.hasAssertions();

    expect(duplicateBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/5")).toStrictEqual([]);
  });
});
