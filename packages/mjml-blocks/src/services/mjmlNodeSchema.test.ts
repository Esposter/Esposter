import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { TEST_COLUMN_ID, TEST_NODE_SCHEMA, TEST_SECTION_ID, TEST_TEXT_ID } from "#src/services/constants.test";
import { describe, expect, test } from "vitest";

describe("mjmlNodeSchema", () => {
  test("a stored email parses under the static node schema", () => {
    expect.hasAssertions();

    const section: MjmlSectionNode = {
      props: {
        children: [
          {
            props: {
              children: [{ props: { content: { text: "Hi" }, id: TEST_TEXT_ID }, type: MjmlNodeType.Text }],
              id: TEST_COLUMN_ID,
            },
            type: MjmlNodeType.Column,
          },
        ],
        id: TEST_SECTION_ID,
      },
      type: MjmlNodeType.Section,
    };

    expect(TEST_NODE_SCHEMA.safeParse(section).success).toBe(true);
  });
});
