import type { BlockDocument } from "headless-block-editor";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { resolveDropTarget } from "@/services/pageBuilder/resolveDropTarget";
import { describe, expect, test } from "vitest";

const TEXT_ONE = "text-one";
const TEXT_TWO = "text-two";
const COLUMN_SLOT = "/content/0/props/children/0/props/children";
const COLUMN_DOCUMENT: BlockDocument = {
  content: [
    {
      props: {
        children: [
          {
            props: {
              children: [
                { props: { id: TEXT_ONE }, type: WebpageNodeType.Text },
                { props: { id: TEXT_TWO }, type: WebpageNodeType.Text },
              ],
              id: "column",
            },
            type: WebpageNodeType.Column,
          },
        ],
        id: "columns",
      },
      type: WebpageNodeType.Columns,
    },
  ],
  root: { props: {} },
};
const ROOT_DOCUMENT: BlockDocument = {
  content: [
    { props: { id: TEXT_ONE }, type: WebpageNodeType.Text },
    { props: { id: TEXT_TWO }, type: WebpageNodeType.Text },
  ],
  root: { props: {} },
};
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
