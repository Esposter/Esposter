import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { TEST_COLUMN_ID, TEST_SECTION_ID, TEST_TEXT_ID } from "#src/services/constants.test";
import { mjmlNodeChildren } from "#src/services/mjmlNodeChildren";
import { describe, expect, test } from "vitest";

describe(mjmlNodeChildren, () => {
  test("each email node's children come from its own slots", () => {
    expect.hasAssertions();

    const column: MjmlColumnNode = { props: { children: [], id: TEST_COLUMN_ID }, type: MjmlNodeType.Column };
    const section: MjmlSectionNode = { props: { children: [column], id: TEST_SECTION_ID }, type: MjmlNodeType.Section };
    const text: MjmlTextNode = { props: { content: "", id: TEST_TEXT_ID }, type: MjmlNodeType.Text };

    expect(mjmlNodeChildren(section)).toStrictEqual({ children: [column] });
    expect(mjmlNodeChildren(text)).toStrictEqual({});
  });
});
