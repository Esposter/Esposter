import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { getSlotPath } from "@/services/pageBuilder/getSlotPath";
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
                  { props: { children: [], id: "k1" }, type: WebpageNodeType.Column },
                  { props: { children: [], id: "k2" }, type: WebpageNodeType.Column },
                ],
                id: "cs",
              },
              type: WebpageNodeType.Columns,
            },
          ],
          id: "s",
          tag: HtmlTag.Section,
        },
        type: WebpageNodeType.Section,
      },
    ],
    root: TEST_ROOT,
  };

  test("a slot in the root is named the page", () => {
    expect.hasAssertions();

    expect(getSlotPath(TEST_DOCUMENT, "/content")).toBe("The page");
  });

  test("a slot under a second column is named by its position", () => {
    expect.hasAssertions();

    expect(getSlotPath(TEST_DOCUMENT, "/content/0/props/children/0/props/children/1/props/children")).toBe(
      "Section › Columns › Column 2",
    );
  });
});
