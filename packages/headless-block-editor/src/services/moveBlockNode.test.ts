import { applyPatches } from "@esposter/shared";
import { moveBlockNode } from "#src/services/moveBlockNode";
import { TEST_DOCUMENT, TEST_HEADING_ID, TEST_REGISTRY } from "#src/services/constants.test";
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

    expect(movedDocument.content[1]?.props.children).toStrictEqual([
      { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
    ]);
    expect(applyPatches(movedDocument, inverses).document).toStrictEqual(TEST_DOCUMENT);
  });
});
