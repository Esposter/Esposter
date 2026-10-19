import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { describe, expect, test } from "vitest";

const TEXT_ONE = "text-one";
const TEXT_TWO = "text-two";
const COLUMN_SLOT = "/content/0/props/children/0/props/children";
const createText = (id: string): TextNode => ({
  props: { content: TEST_TEXT_CONTENT, id },
  type: WebpageNodeType.Text,
});
const COLUMN_DOCUMENT: WebpageDocument = {
  content: [
    {
      props: {
        children: [
          {
            props: { children: [createText(TEXT_ONE), createText(TEXT_TWO)], id: "column" },
            type: WebpageNodeType.Column,
          },
        ],
        id: "columns",
      },
      type: WebpageNodeType.Columns,
    },
  ],
  root: TEST_ROOT,
};
const ROOT_DOCUMENT: WebpageDocument = { content: [createText(TEXT_ONE), createText(TEXT_TWO)], root: TEST_ROOT };
const RECTS: Record<string, { height: number; left: number; top: number; width: number }> = {
  [TEXT_ONE]: { height: 40, left: 0, top: 0, width: 200 },
  [TEXT_TWO]: { height: 40, left: 0, top: 40, width: 200 },
};

describe(resolveDropTarget, () => {
  test("a block dragged into a column inserts it between the column's blocks", () => {
    expect.hasAssertions();

    expect(
      resolveDropTarget({
        document: COLUMN_DOCUMENT,
        draggedType: WebpageNodeType.Text,
        getChildRect: (nodeId) => RECTS[nodeId],
        hoveredNodeId: TEXT_ONE,
        pointer: { x: 100, y: 30 },
      }),
    ).toStrictEqual({ index: 1, slotPointer: COLUMN_SLOT });
  });

  test("a block dropped where no slot accepts it has no target", () => {
    expect.hasAssertions();

    expect(
      resolveDropTarget({
        document: ROOT_DOCUMENT,
        draggedType: WebpageNodeType.Column,
        getChildRect: (nodeId) => RECTS[nodeId],
        hoveredNodeId: TEXT_ONE,
        pointer: { x: 100, y: 30 },
      }),
    ).toBeUndefined();
  });

  test("a block dragged over nothing targets the page", () => {
    expect.hasAssertions();

    expect(
      resolveDropTarget({
        document: ROOT_DOCUMENT,
        draggedType: WebpageNodeType.Text,
        getChildRect: (nodeId) => RECTS[nodeId],
        hoveredNodeId: undefined,
        pointer: { x: 100, y: 30 },
      }),
    ).toStrictEqual({ index: 1, slotPointer: "/content" });
  });
});
