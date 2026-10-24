import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { describe, expect, test } from "vitest";

describe(getNodeTitle, () => {
  const createColumnsDocument = (): WebpageDocument => ({
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
  });

  test("a node with no other node of its type beside it is titled by its type", () => {
    expect.hasAssertions();

    expect(getNodeTitle(TEST_WEBPAGE, ["content", "1"])).toBe(WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text]);
  });

  test("a node with others of its type beside it is numbered by its position among them", () => {
    expect.hasAssertions();

    const columnsSegments = ["content", "0", "props", "children", "0", "props", "children"];

    expect(getNodeTitle(createColumnsDocument(), [...columnsSegments, "0"])).toBe(
      `${WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Column]} 1`,
    );
    expect(getNodeTitle(createColumnsDocument(), [...columnsSegments, "1"])).toBe(
      `${WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Column]} 2`,
    );
  });

  test("a pointer that names no node has no title", () => {
    expect.hasAssertions();

    expect(getNodeTitle(TEST_WEBPAGE, ["content", "9"])).toBe("");
  });
});
