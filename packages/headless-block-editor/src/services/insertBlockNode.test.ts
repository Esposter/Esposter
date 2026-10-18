import { TEST_DOCUMENT, TEST_REGISTRY, TEST_SECTION_ID } from "#src/services/constants.test";
import { insertBlockNode } from "#src/services/insertBlockNode";
import { describe, expect, test } from "vitest";

describe(insertBlockNode, () => {
  test("a node a slot does not accept", () => {
    expect.hasAssertions();

    expect(
      insertBlockNode(TEST_DOCUMENT, TEST_REGISTRY, "/content/1/props/children", 0, {
        props: { children: [], id: TEST_SECTION_ID },
        type: "section",
      }),
    ).toStrictEqual([]);
  });
});
