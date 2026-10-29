import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

const createText = (id: string): TextNode => ({
  props: { content: TEST_TEXT_CONTENT, id },
  type: WebpageNodeType.Text,
});

describe(resolveDropTarget, () => {
  const TEXT_ONE = TEST_ID;
  const TEXT_TWO = TEST_OTHER_ID;
  const COLUMN_SLOT = "/content/0/props/children/0/props/children";
  const COLUMNS_ID = crypto.randomUUID();
  const COLUMN_DOCUMENT: WebpageDocument = {
    content: [
      {
        props: {
          children: [
            {
              props: { children: [createText(TEXT_ONE), createText(TEXT_TWO)], id: crypto.randomUUID() },
              type: WebpageNodeType.Column,
            },
          ],
          id: COLUMNS_ID,
        },
        type: WebpageNodeType.Columns,
      },
    ],
    root: TEST_ROOT,
  };
  const LONE_COLUMN = crypto.randomUUID();
  const LONE_COLUMN_DOCUMENT: WebpageDocument = {
    content: [
      {
        props: {
          children: [{ props: { children: [createText(TEXT_ONE)], id: LONE_COLUMN }, type: WebpageNodeType.Column }],
          id: COLUMNS_ID,
        },
        type: WebpageNodeType.Columns,
      },
    ],
    root: TEST_ROOT,
  };
  const ROOT_DOCUMENT: WebpageDocument = { content: [createText(TEXT_ONE), createText(TEXT_TWO)], root: TEST_ROOT };
  const RECTS: Record<string, { height: number; left: number; top: number; width: number }> = {
    [LONE_COLUMN]: { height: 40, left: 0, top: 0, width: 200 },
    [TEXT_ONE]: { height: 40, left: 0, top: 0, width: 200 },
    [TEXT_TWO]: { height: 40, left: 0, top: 40, width: 200 },
  };

  test("a block dragged into a column inserts it between the column's blocks", () => {
    expect.hasAssertions();

    expect(
      resolveDropTarget(webpageKind, {
        checkIsHorizontalOwner: () => false,
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
      resolveDropTarget(webpageKind, {
        checkIsHorizontalOwner: () => false,
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
      resolveDropTarget(webpageKind, {
        checkIsHorizontalOwner: () => false,
        document: ROOT_DOCUMENT,
        draggedType: WebpageNodeType.Text,
        getChildRect: (nodeId) => RECTS[nodeId],
        hoveredNodeId: undefined,
        pointer: { x: 100, y: 30 },
      }),
    ).toStrictEqual({ index: 1, slotPointer: "/content" });
  });

  test("dropping right of a lone column in a row lands after it", () => {
    expect.hasAssertions();

    // The pointer is in the column's top half, where a column's stacked axis would resolve the drop before it
    expect(
      resolveDropTarget(webpageKind, {
        checkIsHorizontalOwner: (ownerId) => ownerId === COLUMNS_ID,
        document: LONE_COLUMN_DOCUMENT,
        draggedType: WebpageNodeType.Column,
        getChildRect: (nodeId) => RECTS[nodeId],
        hoveredNodeId: LONE_COLUMN,
        pointer: { x: 300, y: 5 },
      }),
    ).toStrictEqual({ index: 1, slotPointer: "/content/0/props/children" });
  });
});
