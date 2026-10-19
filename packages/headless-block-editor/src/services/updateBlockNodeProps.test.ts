import type { HeadingNodeProps } from "#src/services/constants.test";

import { TEST_DOCUMENT, TEST_HEADING_ID, TEST_SECTION_ID, TEST_SECTION_OTHER_ID } from "#src/services/constants.test";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(updateBlockNodeProps, () => {
  test("a prop replaced on a node", () => {
    expect.hasAssertions();

    const { document } = applyPatches(
      TEST_DOCUMENT,
      updateBlockNodeProps<HeadingNodeProps>("/content/0/props/children/0", { text: "x" }),
    );

    expect(document.content).toStrictEqual([
      {
        props: {
          children: [{ props: { id: TEST_HEADING_ID, text: "x" }, type: "heading" }],
          id: TEST_SECTION_ID,
          title: "",
        },
        type: "section",
      },
      { props: { children: [], id: TEST_SECTION_OTHER_ID, title: "" }, type: "section" },
    ]);
  });
});
