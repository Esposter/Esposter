import type { TRPCRouter } from "#server/trpc/routers";
import type { ArrowElement, ShapeElement } from "headless-block-editor";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { whiteboardRouter } from "#server/trpc/routers/whiteboard";
import { ArrowPathKind, PositionedElementType, ShapeKind } from "headless-block-editor";
import { beforeAll, describe, expect, test } from "vitest";

describe("whiteboardRouter", () => {
  const { getCaller } = setupResourceSuite(whiteboardRouter);
  let caller: DecorateRouterRecord<TRPCRouter["whiteboard"]>;
  const name = "name";
  const shapeId = crypto.randomUUID();
  // A rectangle at the origin, 100 by 100, with an arrow bound at its start to its bottom point
  const shape: ShapeElement = {
    fill: "#ffffff",
    height: 100,
    id: shapeId,
    kind: ShapeKind.Rectangle,
    text: "",
    type: PositionedElementType.Shape,
    width: 100,
    x: 0,
    y: 0,
  };
  const arrow: ArrowElement = {
    end: { hasArrowhead: true, point: { x: 150, y: 250 } },
    id: crypto.randomUUID(),
    label: "",
    pathKind: ArrowPathKind.Straight,
    start: { binding: { connectionPointIndex: 2, elementId: shapeId }, hasArrowhead: false, point: { x: 50, y: 100 } },
    type: PositionedElementType.Arrow,
  };

  beforeAll(() => {
    caller = getCaller();
  });

  // A new whiteboard saved with the elements given, as its draft content
  const createSavedWhiteboard = async (...elements: (ArrowElement | ShapeElement)[]) => {
    const newResource = await caller.createResource({ name });
    return caller.saveResourceContent({
      content: { elements },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
  };

  test("an agent moves a bound shape through the typed move", async () => {
    expect.hasAssertions();

    const savedResource = await createSavedWhiteboard(shape, arrow);
    const moveResult = await caller.moveWhiteboardElement({ id: savedResource.id, index: 0, point: { x: 200, y: 0 } });
    const content = await caller.readResourceContent({ id: savedResource.id });

    expect(content).toStrictEqual({
      elements: [
        { ...shape, x: 200 },
        { ...arrow, start: { ...arrow.start, point: { x: 250, y: 100 } } },
      ],
    });
    expect(moveResult.contentVersion).toBe(savedResource.contentVersion + 1);
  });

  test("a move of an arrow bound at both ends is refused, since it holds no position of its own", async () => {
    expect.hasAssertions();

    const boundArrow: ArrowElement = {
      ...arrow,
      end: { binding: { connectionPointIndex: 0, elementId: shapeId }, hasArrowhead: true, point: { x: 50, y: 0 } },
    };
    const savedResource = await createSavedWhiteboard(shape, boundArrow);

    await expect(
      caller.moveWhiteboardElement({ id: savedResource.id, index: 1, point: { x: 0, y: 0 } }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: whiteboard, element 1 is not one that moves]`,
    );
  });

  test("a move of an arrow with a free end moves that end and leaves its bound end", async () => {
    expect.hasAssertions();

    const savedResource = await createSavedWhiteboard(shape, arrow);
    await caller.moveWhiteboardElement({ id: savedResource.id, index: 1, point: { x: 60, y: 120 } });
    const content = await caller.readResourceContent({ id: savedResource.id });

    expect(content).toStrictEqual({
      elements: [shape, { ...arrow, end: { ...arrow.end, point: { x: 160, y: 270 } } }],
    });
  });
});
