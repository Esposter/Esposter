import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { TEST_SECTION_ID } from "@/services/pageBuilder/constants.test";
import { getSlotPath } from "@/services/pageBuilder/getSlotPath";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

describe(getSlotPath, () => {
  const TEST_DOCUMENT: WebpageDocument = {
    content: [
      {
        props: {
          children: [
            {
              props: {
                children: [
                  { props: { children: [], id: TEST_ID }, type: WebpageNodeType.Column },
                  { props: { children: [], id: TEST_OTHER_ID }, type: WebpageNodeType.Column },
                ],
                id: TEST_THIRD_ID,
              },
              type: WebpageNodeType.Columns,
            },
          ],
          id: TEST_SECTION_ID,
          tag: HtmlTag.Section,
        },
        type: WebpageNodeType.Section,
      },
    ],
    root: TEST_ROOT,
  };

  test("a slot in the root is named the page", () => {
    expect.hasAssertions();

    expect(getSlotPath(webpageKind, TEST_DOCUMENT, "/content")).toBe("The page");
  });

  test("a slot under a second column is named by its position", () => {
    expect.hasAssertions();

    expect(getSlotPath(webpageKind, TEST_DOCUMENT, "/content/0/props/children/0/props/children/1/props/children")).toBe(
      "Section › Columns › Column 2",
    );
  });
});
