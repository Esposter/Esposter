import { TEST_DOCUMENT, TEST_HEADING_ID } from "#src/services/constants.test";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(updateBlockNodeProps, () => {
  test("a prop replaced on a node", () => {
    expect.hasAssertions();

    const { document } = applyPatches(
      TEST_DOCUMENT,
      updateBlockNodeProps("/content/0/props/children/0", { text: "x" }),
    );

    expect(document.content[0]?.props.children).toStrictEqual([
      { props: { id: TEST_HEADING_ID, text: "x" }, type: "heading" },
    ]);
  });
});
