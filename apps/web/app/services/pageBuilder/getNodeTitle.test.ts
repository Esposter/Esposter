import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { TEST_SECTION_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

const createColumnsDocument = (): WebpageDocument => ({
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
});

describe(getNodeTitle, () => {
  test("a node with no other node of its type beside it is titled by its type", () => {
    expect.hasAssertions();

    expect(getNodeTitle(webpageKind, TEST_WEBPAGE, ["content", "1"])).toBe(
      WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text],
    );
  });

  test("a node with others of its type beside it is numbered by its position among them", () => {
    expect.hasAssertions();

    const columnsSegments = ["content", "0", "props", "children", "0", "props", "children"];

    expect(getNodeTitle(webpageKind, createColumnsDocument(), [...columnsSegments, "0"])).toBe(
      `${WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Column]} 1`,
    );
    expect(getNodeTitle(webpageKind, createColumnsDocument(), [...columnsSegments, "1"])).toBe(
      `${WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Column]} 2`,
    );
  });

  test("a pointer that names no node has no title", () => {
    expect.hasAssertions();

    expect(getNodeTitle(webpageKind, TEST_WEBPAGE, ["content", "9"])).toBe("");
  });
});
