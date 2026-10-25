import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { getParentNodeId } from "@/services/pageBuilder/getParentNodeId";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

describe(getParentNodeId, () => {
  const TEST_CONTAINER_ID = "cs";
  const TEST_NODE_ID = "k1";
  const TEST_SECTION_ID = "s1";

  const createDocument = (): WebpageDocument => ({
    content: [
      {
        props: {
          children: [
            {
              props: {
                children: [{ props: { children: [], id: TEST_NODE_ID }, type: WebpageNodeType.Column }],
                id: TEST_CONTAINER_ID,
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
  });

  test("the parent of a nested node is its container, and a root node's parent is the page", () => {
    expect.hasAssertions();

    const document = createDocument();

    expect(getParentNodeId(webpageKind, document, TEST_NODE_ID)).toBe(TEST_CONTAINER_ID);
    expect(getParentNodeId(webpageKind, document, TEST_SECTION_ID)).toBe("");
  });

  test("a node the document does not hold has no parent", () => {
    expect.hasAssertions();

    expect(getParentNodeId(webpageKind, createDocument(), "missing")).toBeUndefined();
  });
});
