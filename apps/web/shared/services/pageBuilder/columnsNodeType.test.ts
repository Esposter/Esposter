import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { insertBlockNode } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe("columnsNodeType", () => {
  test("a columns node holds only columns", () => {
    expect.hasAssertions();

    const document = {
      content: [
        {
          props: {
            children: [{ props: { children: [], id: TEST_OTHER_ID }, type: WebpageNodeType.Column }],
            id: TEST_ID,
          },
          type: WebpageNodeType.Columns,
        },
      ],
      root: TEST_ROOT,
    };
    const columnsSlot = "/content/0/props/children";

    expect(
      insertBlockNode(document, webpageRegistry, columnsSlot, 1, {
        props: { href: TEST_URL, id: "c", label: TEST_LABEL },
        type: WebpageNodeType.Button,
      }),
    ).toStrictEqual([]);
    expect(
      insertBlockNode(document, webpageRegistry, columnsSlot, 1, {
        props: { children: [], id: "c" },
        type: WebpageNodeType.Column,
      }),
    ).toHaveLength(1);
  });
});
