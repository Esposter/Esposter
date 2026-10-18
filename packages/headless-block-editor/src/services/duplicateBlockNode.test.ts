import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { TEST_DOCUMENT, TEST_HEADING_ID, TEST_REGISTRY } from "#src/services/constants.test";
import { duplicateBlockNode } from "#src/services/duplicateBlockNode";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { assert, describe, expect, test } from "vitest";

describe(duplicateBlockNode, () => {
  test("duplicating a node places its copy after it", () => {
    expect.hasAssertions();

    const duplicated = applyBlockEdit(
      TEST_DOCUMENT,
      duplicateBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/children/0"),
    ).match(
      ({ document }) => document,
      () => undefined,
    );
    assert.exists(duplicated);
    const edited = applyBlockEdit(
      duplicated,
      updateBlockNodeProps("/content/0/props/children/1", { text: "copied" }),
    ).match(
      ({ document }) => document,
      () => undefined,
    );
    assert.exists(edited);

    expect(edited.content[0]?.props.children).toStrictEqual([
      { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
      { props: { id: expect.not.stringMatching(TEST_HEADING_ID), text: "copied" }, type: "heading" },
    ]);
  });

  test("duplicating a pointer naming no node", () => {
    expect.hasAssertions();

    expect(duplicateBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/5")).toStrictEqual([]);
  });
});
