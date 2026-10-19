import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { TEST_DOCUMENT, TEST_DOCUMENT_NODE_COUNT, TEST_ITEM_ID, TEST_REGISTRY } from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { insertBlockNode } from "#src/services/insertBlockNode";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { describe, expect, test } from "vitest";

describe(applyBlockEdit, () => {
  // An edit that inserts a node is one node over the document, so the schema allows one more
  const schema = createBlockDocumentSchema(TEST_REGISTRY, TEST_DOCUMENT_NODE_COUNT + 1);

  test("an edit that cannot apply", () => {
    expect.hasAssertions();

    const operations = updateBlockNodeProps("/content/5", { text: "" });

    expect(
      applyBlockEdit(schema, TEST_DOCUMENT, operations).match(
        () => "applied",
        () => "refused",
      ),
    ).toBe("refused");
  });

  test("an agent edits on the server", () => {
    expect.hasAssertions();

    const operations = insertBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/children", 1, {
      props: { id: TEST_ITEM_ID, text: "" },
      type: "heading",
    });
    expect(
      applyBlockEdit(schema, TEST_DOCUMENT, operations).match(
        ({ document, inverses }) =>
          applyBlockEdit(schema, document, inverses).match(
            (reversed) => reversed.document,
            () => undefined,
          ),
        () => undefined,
      ),
    ).toStrictEqual(TEST_DOCUMENT);
  });
});
