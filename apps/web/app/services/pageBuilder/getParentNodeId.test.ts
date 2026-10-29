import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { getParentNodeId } from "@/services/pageBuilder/getParentNodeId";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

const createDocument = (): WebpageDocument => ({
  content: [
    {
      props: {
        children: [
          {
            props: {
              children: [{ props: { children: [], id: TEST_ID }, type: WebpageNodeType.Column }],
              id: TEST_OTHER_ID,
            },
            type: WebpageNodeType.Columns,
          },
        ],
        id: TEST_THIRD_ID,
        tag: HtmlTag.Section,
      },
      type: WebpageNodeType.Section,
    },
  ],
  root: TEST_ROOT,
});

describe(getParentNodeId, () => {
  test("the parent of a nested node is its container, and a root node's parent is the page", () => {
    expect.hasAssertions();

    const document = createDocument();

    expect(getParentNodeId(webpageKind, document, TEST_ID)).toBe(TEST_OTHER_ID);
    expect(getParentNodeId(webpageKind, document, TEST_THIRD_ID)).toBe("");
  });

  test("a node the document does not hold has no parent", () => {
    expect.hasAssertions();

    expect(getParentNodeId(webpageKind, createDocument(), "-1")).toBeUndefined();
  });
});
