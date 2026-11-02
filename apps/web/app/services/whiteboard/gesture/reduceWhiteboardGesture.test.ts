import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { Viewport } from "@/models/whiteboard/Viewport";
import type { WhiteboardGestureState } from "@/models/whiteboard/WhiteboardGestureState";
import type {
  ArrowElement,
  Bounds,
  Point,
  PositionedDocument,
  ShapeElement,
  StrokeElement,
  TextElement,
} from "headless-block-editor";

import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { PRIMARY_BUTTON, STROKE_WIDTH } from "@/services/whiteboard/gesture/constants";
import { reduceWhiteboardGesture } from "@/services/whiteboard/gesture/reduceWhiteboardGesture";
import { applyPatches, JsonPatchOperationType, takeOne } from "@esposter/shared";
import {
  ArrowPathKind,
  positionedDocumentSchema,
  PositionedElementType,
  ShapeKind,
  TEXT_CHARACTER_WIDTH,
} from "headless-block-editor";
import { describe, expect, test } from "vitest";

const createProcess = (id: string, bounds: Bounds): ShapeElement => ({
  fill: "#ffffff",
  height: bounds.height,
  id,
  kind: ShapeKind.Process,
  text: "",
  type: PositionedElementType.Shape,
  width: bounds.width,
  x: bounds.x,
  y: bounds.y,
});

describe(reduceWhiteboardGesture, () => {
  const POINTER_ID = 0;
  const PROCESS_ID = crypto.randomUUID();
  const SECOND_PROCESS_ID = crypto.randomUUID();
  const THIRD_PROCESS_ID = crypto.randomUUID();
  const ARROW_ID = crypto.randomUUID();
  const ANNOTATION_ID = crypto.randomUUID();
  const DECISION_ID = crypto.randomUUID();
  const NEW_ARROW_ID = crypto.randomUUID();
  const STROKE_ID = crypto.randomUUID();
  const TEXT_ID = crypto.randomUUID();
  const VIEWPORT: Viewport = { scale: 1, x: 0, y: 0 };
  const PROCESS_BOUNDS: Bounds = { height: 50, width: 100, x: 100, y: 100 };
  // A decision's bottom point to a process's left point, both bound, with its arrowhead at the end only
  const BOUND_ARROW: ArrowElement = {
    end: { binding: { connectionPointIndex: 3, elementId: PROCESS_ID }, hasArrowhead: true, point: { x: 200, y: 50 } },
    id: NEW_ARROW_ID,
    label: "",
    pathKind: ArrowPathKind.Straight,
    start: {
      binding: { connectionPointIndex: 2, elementId: DECISION_ID },
      hasArrowhead: false,
      point: { x: 50, y: 100 },
    },
    type: PositionedElementType.Arrow,
  };

  const createPointer = (action: GesturePointerAction, screen: Point, isShiftKey = false): GesturePointerEvent => ({
    action,
    button: PRIMARY_BUTTON,
    isShiftKey,
    pointerId: POINTER_ID,
    screen,
  });
  const createState = (
    document: PositionedDocument,
    overrides: Partial<WhiteboardGestureState> = {},
  ): WhiteboardGestureState => ({
    createId: () => STROKE_ID,
    document,
    isSnapEnabled: false,
    selectedIds: [],
    tool: GestureTool.Select,
    viewport: VIEWPORT,
    ...overrides,
  });

  test("moving a shape keeps its arrows attached", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const arrow: ArrowElement = {
      end: {
        binding: { connectionPointIndex: 2, elementId: PROCESS_ID },
        hasArrowhead: true,
        point: { x: 150, y: 150 },
      },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      start: { hasArrowhead: false, point: { x: 0, y: 0 } },
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [processShape, arrow] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 200, y: 155 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 200, y: 155 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/x", value: 150 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/y", value: 130 },
      { op: JsonPatchOperationType.Replace, path: "/elements/1/end/point", value: { x: 200, y: 180 } },
    ]);
    expect(up.state.document).toStrictEqual({
      elements: [
        { ...processShape, x: 150, y: 130 },
        { ...arrow, end: { ...arrow.end, point: { x: 200, y: 180 } } },
      ],
    });
  });

  test("a moved shape lands on the grid", () => {
    expect.hasAssertions();

    const state = createState(
      { elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] },
      { isSnapEnabled: true, selectedIds: [PROCESS_ID] },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 198, y: 152 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 198, y: 152 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/x", value: 140 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/y", value: 120 },
    ]);
  });

  test("a resized shape's edges land on the grid", () => {
    expect.hasAssertions();

    const state = createState(
      { elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] },
      { isSnapEnabled: true, selectedIds: [PROCESS_ID] },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 150 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 233, y: 171 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 233, y: 171 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 140 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: 80 },
    ]);
  });

  test("a marquee selects every shape it covers", () => {
    expect.hasAssertions();

    const state = createState({
      elements: [
        createProcess(PROCESS_ID, { height: 40, width: 40, x: 100, y: 100 }),
        createProcess(SECOND_PROCESS_ID, { height: 40, width: 40, x: 160, y: 100 }),
        createProcess(THIRD_PROCESS_ID, { height: 40, width: 40, x: 200, y: 100 }),
      ],
    });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 50, y: 50 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 220, y: 160 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 220, y: 160 }));

    expect(up.state.selectedIds).toStrictEqual([PROCESS_ID, SECOND_PROCESS_ID]);
  });

  test("a freehand stroke follows the pointer", () => {
    expect.hasAssertions();

    const state = createState({ elements: [] }, { tool: GestureTool.Freehand });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 10, y: 10 }));
    const firstMove = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 20, y: 10 }));
    const secondMove = reduceWhiteboardGesture(
      firstMove.state,
      createPointer(GesturePointerAction.Move, { x: 20, y: 20 }),
    );
    const up = reduceWhiteboardGesture(secondMove.state, createPointer(GesturePointerAction.Up, { x: 20, y: 20 }));

    expect(up.operations).toStrictEqual([
      {
        op: JsonPatchOperationType.Add,
        path: "/elements/0",
        value: {
          id: STROKE_ID,
          points: [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
          ],
          strokeWidth: STROKE_WIDTH,
          type: PositionedElementType.Stroke,
        },
      },
    ]);
  });

  test("a press on empty canvas clears the selection", () => {
    expect.hasAssertions();

    const state = createState({ elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 5, y: 5 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 5, y: 5 }));

    expect(up.state.selectedIds).toStrictEqual([]);
  });

  test("shift adds a shape to the selection", () => {
    expect.hasAssertions();

    const state = createState(
      {
        elements: [
          createProcess(PROCESS_ID, PROCESS_BOUNDS),
          createProcess(SECOND_PROCESS_ID, { height: 50, width: 100, x: 300, y: 100 }),
        ],
      },
      { selectedIds: [PROCESS_ID] },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 350, y: 125 }, true));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 350, y: 125 }, true));

    expect(up.state.selectedIds).toStrictEqual([PROCESS_ID, SECOND_PROCESS_ID]);
  });

  test("dragging a shape's corner resizes it", () => {
    expect.hasAssertions();

    const state = createState({ elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 150 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 230, y: 170 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 230, y: 170 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 130 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: 70 },
    ]);
  });

  test("the hand tool pans the viewport in world units", () => {
    expect.hasAssertions();

    const state = createState({ elements: [] }, { tool: GestureTool.Hand, viewport: { scale: 2, x: 0, y: 0 } });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 10, y: 10 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 30, y: 50 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 30, y: 50 }));

    expect(up.state.viewport).toStrictEqual({ scale: 2, x: -10, y: -20 });
  });

  test("a cancelled move changes nothing", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const document: PositionedDocument = { elements: [processShape] };
    const state = createState(document, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 200, y: 155 }));
    const cancel = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Cancel, { x: 200, y: 155 }));

    expect(cancel.operations).toStrictEqual([]);
    expect(cancel.state.document).toStrictEqual(document);
    expect(cancel.state.preview).toBeUndefined();
    expect(cancel.state.gesture).toBeUndefined();
  });

  test("a text box is hit across the lines its text wraps to", () => {
    expect.hasAssertions();

    // "a b c" wraps to three lines at this width, so the box reaches its third line, which a one-line box would not
    const textElement: TextElement = {
      id: TEXT_ID,
      text: "a b c",
      type: PositionedElementType.Text,
      width: TEXT_CHARACTER_WIDTH * 2,
      x: 100,
      y: 100,
    };
    const state = createState({ elements: [textElement] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 105, y: 150 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 105, y: 150 }));

    expect(up.state.selectedIds).toStrictEqual([TEXT_ID]);
  });

  test("an arrow binds its ends to two shapes' connection points", () => {
    expect.hasAssertions();

    const decisionShape: ShapeElement = {
      ...createProcess(DECISION_ID, { height: 100, width: 100, x: 0, y: 0 }),
      kind: ShapeKind.Decision,
    };
    const processShape = createProcess(PROCESS_ID, { height: 100, width: 100, x: 200, y: 0 });
    const state = createState(
      { elements: [decisionShape, processShape] },
      { createId: () => NEW_ARROW_ID, tool: GestureTool.Arrow },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 50, y: 100 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 205, y: 55 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 205, y: 55 }));

    expect(up.state.document).toStrictEqual({ elements: [decisionShape, processShape, BOUND_ARROW] });

    const selectedProcess = { ...up.state, selectedIds: [PROCESS_ID], tool: GestureTool.Select };
    const pressProcess = reduceWhiteboardGesture(
      selectedProcess,
      createPointer(GesturePointerAction.Down, { x: 250, y: 50 }),
    );
    const moveProcess = reduceWhiteboardGesture(
      pressProcess.state,
      createPointer(GesturePointerAction.Move, { x: 250, y: 80 }),
    );
    const upProcess = reduceWhiteboardGesture(
      moveProcess.state,
      createPointer(GesturePointerAction.Up, { x: 250, y: 80 }),
    );

    expect(upProcess.state.document).toStrictEqual({
      elements: [
        decisionShape,
        { ...processShape, y: 30 },
        { ...BOUND_ARROW, end: { ...BOUND_ARROW.end, point: { x: 200, y: 80 } } },
      ],
    });
  });

  test("an annotation takes no connection", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const annotationShape: ShapeElement = {
      ...createProcess(ANNOTATION_ID, { height: 50, width: 100, x: 300, y: 100 }),
      kind: ShapeKind.Annotation,
    };
    const state = createState(
      { elements: [processShape, annotationShape] },
      { createId: () => NEW_ARROW_ID, tool: GestureTool.Arrow },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 340, y: 125 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 340, y: 125 }));

    expect(up.state.document).toStrictEqual({
      elements: [
        processShape,
        annotationShape,
        {
          end: { hasArrowhead: true, point: { x: 340, y: 125 } },
          id: NEW_ARROW_ID,
          label: "",
          pathKind: ArrowPathKind.Straight,
          start: {
            binding: { connectionPointIndex: 1, elementId: PROCESS_ID },
            hasArrowhead: false,
            point: { x: 200, y: 125 },
          },
          type: PositionedElementType.Arrow,
        },
      ],
    });
  });

  test("an arrow with an arrowhead at each end", () => {
    expect.hasAssertions();

    const decisionShape: ShapeElement = {
      ...createProcess(DECISION_ID, { height: 100, width: 100, x: 0, y: 0 }),
      kind: ShapeKind.Decision,
    };
    const processShape = createProcess(PROCESS_ID, { height: 100, width: 100, x: 200, y: 0 });
    const state = createState(
      { elements: [decisionShape, processShape] },
      { createId: () => NEW_ARROW_ID, tool: GestureTool.Arrow },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 50, y: 100 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 205, y: 55 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 205, y: 55 }));
    const headedDocument = applyPatches(up.state.document, [
      { op: JsonPatchOperationType.Replace, path: "/elements/2/start/hasArrowhead", value: true },
    ]).document;

    expect(takeOne(headedDocument.elements, 2)).toStrictEqual({
      ...BOUND_ARROW,
      start: { ...BOUND_ARROW.start, hasArrowhead: true },
    });
    expect(positionedDocumentSchema.safeParse(headedDocument).success).toBe(true);
  });

  test("releasing an arrow on empty space leaves its end free", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { createId: () => NEW_ARROW_ID, tool: GestureTool.Arrow });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 300, y: 300 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 300, y: 300 }));

    expect(takeOne(up.state.document.elements, 1)).toStrictEqual({
      end: { hasArrowhead: true, point: { x: 300, y: 300 } },
      id: NEW_ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      start: {
        binding: { connectionPointIndex: 1, elementId: PROCESS_ID },
        hasArrowhead: false,
        point: { x: 200, y: 125 },
      },
      type: PositionedElementType.Arrow,
    });
  });

  test("a press and release with the arrow tool without a drag draws no arrow", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const document: PositionedDocument = { elements: [processShape] };
    const state = createState(document, { createId: () => NEW_ARROW_ID, tool: GestureTool.Arrow });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 200, y: 125 }));

    expect(up.operations).toStrictEqual([]);
    expect(up.state.document).toStrictEqual(document);
  });

  test("dragging a shape's top-left corner resizes it from the top-left", () => {
    expect.hasAssertions();

    const state = createState({ elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 100, y: 100 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 120, y: 110 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 120, y: 110 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/x", value: 120 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/y", value: 110 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 80 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: 40 },
    ]);
  });

  test("a top-left resize stops at the minimum size", () => {
    expect.hasAssertions();

    const state = createState({ elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 100, y: 100 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 300, y: 300 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 300, y: 300 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/x", value: 184 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/y", value: 134 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 16 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: 16 },
    ]);
  });

  test("dragging a stroke moves every point of it", () => {
    expect.hasAssertions();

    const stroke: StrokeElement = {
      id: STROKE_ID,
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 10 },
        { x: 20, y: 20 },
      ],
      strokeWidth: STROKE_WIDTH,
      type: PositionedElementType.Stroke,
    };
    const state = createState({ elements: [stroke] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 15, y: 10 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 35, y: 40 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 35, y: 40 }));

    expect(up.operations).toStrictEqual([
      {
        op: JsonPatchOperationType.Replace,
        path: "/elements/0/points",
        value: [
          { x: 30, y: 40 },
          { x: 40, y: 40 },
          { x: 40, y: 50 },
        ],
      },
    ]);
  });

  test("dragging an arrow moves its free end and leaves its bound end", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const arrow: ArrowElement = {
      end: { hasArrowhead: true, point: { x: 250, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      start: {
        binding: { connectionPointIndex: 2, elementId: PROCESS_ID },
        hasArrowhead: false,
        point: { x: 150, y: 150 },
      },
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [processShape, arrow] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 200 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 210, y: 220 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 210, y: 220 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/1/end/point", value: { x: 260, y: 270 } },
    ]);
  });
});
