import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type { ArrowElement, PositionedDocument, StrokeElement, TextElement } from "vue-block-editor-headless";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { HIT_TOLERANCE, PRIMARY_BUTTON } from "@/services/whiteboard/gesture/constants";
import { getResizeHandle } from "@/services/whiteboard/gesture/getResizeHandle";
import { reduceWhiteboardGesture } from "@/services/whiteboard/gesture/reduceWhiteboardGesture";
import {
  WHITEBOARD_ARROW,
  WHITEBOARD_ARROW_ID,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { JsonPatchOperationType } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import {
  ArrowheadKind,
  getElementBounds,
  PositionedElementType,
  ShapeKind,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

describe(getResizeHandle, () => {
  const POINTER_ID = 0;
  const TEXT_ID = crypto.randomUUID();
  const STROKE_ID = crypto.randomUUID();
  const LEFT_ARROW_ID = crypto.randomUUID();
  const RIGHT_ARROW_ID = crypto.randomUUID();
  const TEXT_BOX: TextElement = {
    color: "",
    id: TEXT_ID,
    isWrapped: false,
    text: "Text",
    textSize: TextSize.Small,
    type: PositionedElementType.Text,
    width: 80,
    x: 0,
    y: 0,
  };
  const createPointer = (action: GesturePointerAction, screen: { x: number; y: number }): GesturePointerEvent => ({
    action,
    button: PRIMARY_BUTTON,
    isAltKey: false,
    isShiftKey: false,
    pointerId: POINTER_ID,
    screen,
  });
  const createState = (document: PositionedDocument, selectedIds: string[]): WhiteboardGestureState => ({
    createId: () => crypto.randomUUID(),
    document,
    isSpaceHeld: false,
    isToolLocked: false,
    selectedIds,
    shapeKind: ShapeKind.Rectangle,
    tool: GestureTool.Select,
    viewport: { scale: 1, x: 0, y: 0 },
  });

  test("An edge handle changes one dimension only", () => {
    expect.hasAssertions();

    const state = createState({ elements: [WHITEBOARD_PROCESS] }, [WHITEBOARD_PROCESS_ID]);

    // The right edge's middle is at (100, 50), the box being 100 by 100 at the origin
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 100, y: 50 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 130, y: 50 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 130, y: 50 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 130 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: 100 },
    ]);
    expect(up.state.document).toStrictEqual({ elements: [{ ...WHITEBOARD_PROCESS, width: 130 }] });
  });

  test("A text box shows only its left and right handles", () => {
    expect.hasAssertions();

    const { height } = getElementBounds(TEXT_BOX);
    const document: PositionedDocument = { elements: [TEXT_BOX] };

    expect(getResizeHandle(document, [TEXT_ID], { x: 0, y: height / 2 }, HIT_TOLERANCE)).toBe(ResizeHandle.Left);
    expect(getResizeHandle(document, [TEXT_ID], { x: 80, y: height / 2 }, HIT_TOLERANCE)).toBe(ResizeHandle.Right);
    expect(getResizeHandle(document, [TEXT_ID], { x: 40, y: 0 }, HIT_TOLERANCE)).toBeUndefined();
    expect(getResizeHandle(document, [TEXT_ID], { x: 40, y: height }, HIT_TOLERANCE)).toBeUndefined();
    expect(getResizeHandle(document, [TEXT_ID], { x: 80, y: height }, HIT_TOLERANCE)).toBeUndefined();
  });

  test("A selected arrow or stroke shows no resize handle", () => {
    expect.hasAssertions();

    const stroke: StrokeElement = {
      color: "",
      id: STROKE_ID,
      points: [
        { x: 0, y: 0 },
        { x: 40, y: 40 },
      ],
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Stroke,
    };

    // The arrow's box runs from (50, 100) to (150, 250), and the stroke's from (0, 0) to (40, 40)
    expect(
      getResizeHandle({ elements: [WHITEBOARD_ARROW] }, [WHITEBOARD_ARROW_ID], { x: 150, y: 250 }, HIT_TOLERANCE),
    ).toBeUndefined();
    expect(
      getResizeHandle({ elements: [WHITEBOARD_ARROW] }, [WHITEBOARD_ARROW_ID], { x: 50, y: 175 }, HIT_TOLERANCE),
    ).toBeUndefined();
    expect(getResizeHandle({ elements: [stroke] }, [STROKE_ID], { x: 40, y: 40 }, HIT_TOLERANCE)).toBeUndefined();
  });

  test("A selection with no height has no top or bottom handle", () => {
    expect.hasAssertions();

    // Two free arrows lie on the line y = 100, so the selection's box has no height: its right handle is at (400, 100), and its top and
    // Bottom handles, which sit at (250, 100), are left out
    const leftArrow: ArrowElement = {
      ...WHITEBOARD_ARROW,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 200, y: 100 } },
      id: LEFT_ARROW_ID,
      start: { point: { x: 100, y: 100 } },
    };
    const rightArrow: ArrowElement = {
      ...WHITEBOARD_ARROW,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 400, y: 100 } },
      id: RIGHT_ARROW_ID,
      start: { point: { x: 250, y: 100 } },
    };
    const document: PositionedDocument = { elements: [leftArrow, rightArrow] };
    const selectedIds = [LEFT_ARROW_ID, RIGHT_ARROW_ID];

    expect(getResizeHandle(document, selectedIds, { x: 400, y: 100 }, HIT_TOLERANCE)).toBe(ResizeHandle.Right);
    expect(getResizeHandle(document, selectedIds, { x: 250, y: 100 }, HIT_TOLERANCE)).toBeUndefined();
  });
});
