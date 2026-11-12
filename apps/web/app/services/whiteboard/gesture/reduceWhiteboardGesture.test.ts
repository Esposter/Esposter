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
} from "vue-block-editor-headless";

import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { SnapAxis } from "@/models/whiteboard/SnapAxis";
import { MINIMUM_ELEMENT_SIZE, PRIMARY_BUTTON, STROKE_WIDTH } from "@/services/whiteboard/gesture/constants";
import { reduceWhiteboardGesture } from "@/services/whiteboard/gesture/reduceWhiteboardGesture";
import { WHITEBOARD_SHAPE_FILL, WHITEBOARD_SHAPE_SIZE } from "@/services/whiteboard/palette/constants";
import { JsonPatchOperationType, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import {
  ArrowheadKind,
  ArrowPathKind,
  CornerStyle,
  DashPattern,
  PositionedElementType,
  ShapeKind,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

const createProcess = (id: string, bounds: Bounds): ShapeElement => ({
  color: "",
  cornerStyle: CornerStyle.Sharp,
  dashPattern: DashPattern.Solid,
  fill: "#ffffff",
  height: bounds.height,
  id,
  kind: ShapeKind.Process,
  sketchLevel: SketchLevel.Artist,
  strokeWidth: StrokeWidth.Medium,
  text: "",
  textSize: TextSize.Small,
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
  const PLACED_SHAPE_ID = crypto.randomUUID();
  const STROKE_ID = crypto.randomUUID();
  const COPY_ID = crypto.randomUUID();
  const ARROW_COPY_ID = crypto.randomUUID();
  const VIEWPORT: Viewport = { scale: 1, x: 0, y: 0 };
  const PROCESS_BOUNDS: Bounds = { height: 50, width: 100, x: 100, y: 100 };
  // A decision's bottom point to a process's left point, both bound, with its arrowhead at the end only
  const BOUND_ARROW: ArrowElement = {
    color: "",
    dashPattern: DashPattern.Solid,
    end: {
      arrowhead: ArrowheadKind.Triangle,
      binding: { connectionPointIndex: 3, elementId: PROCESS_ID },
      point: { x: 200, y: 50 },
    },
    id: NEW_ARROW_ID,
    label: "",
    pathKind: ArrowPathKind.Straight,
    sketchLevel: SketchLevel.Artist,
    start: { binding: { connectionPointIndex: 2, elementId: DECISION_ID }, point: { x: 50, y: 100 } },
    strokeWidth: StrokeWidth.Medium,
    textSize: TextSize.Small,
    type: PositionedElementType.Arrow,
  };

  const createPointer = (
    action: GesturePointerAction,
    screen: Point,
    isShiftKey = false,
    isAltKey = false,
  ): GesturePointerEvent => ({ action, button: PRIMARY_BUTTON, isAltKey, isShiftKey, pointerId: POINTER_ID, screen });
  // Stands in for the id generator, handing out the ids given in the order the gesture asks for them
  const createIdsInOrder = (ids: string[]): (() => string) => {
    const remainingIds = [...ids];
    return () => remainingIds.shift() ?? "";
  };
  const createState = (
    document: PositionedDocument,
    overrides: Partial<WhiteboardGestureState> = {},
  ): WhiteboardGestureState => ({
    createId: () => STROKE_ID,
    document,
    isSpaceHeld: false,
    isToolLocked: false,
    selectedIds: [],
    shapeKind: ShapeKind.Rectangle,
    tool: GestureTool.Select,
    viewport: VIEWPORT,
    ...overrides,
  });

  test("moving a shape keeps its arrows attached", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: {
        arrowhead: ArrowheadKind.Triangle,
        binding: { connectionPointIndex: 2, elementId: PROCESS_ID },
        point: { x: 150, y: 150 },
      },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { point: { x: 0, y: 0 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
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

  test("a moved shape lands where the pointer puts it", () => {
    expect.hasAssertions();

    const state = createState({ elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 198, y: 152 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 198, y: 152 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/x", value: 148 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/y", value: 127 },
    ]);
  });

  test("A dragged element snaps its edge to a neighbour's edge", () => {
    expect.hasAssertions();

    // The neighbour's left edge is 3 units left of the shape's left edge, and the pointer takes the shape 6 units right of its press
    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const neighbour = createProcess(SECOND_PROCESS_ID, { height: 40, width: 80, x: 103, y: 300 });
    const state = createState({ elements: [processShape, neighbour] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 156, y: 125 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 156, y: 125 }));

    expect(up.state.document).toStrictEqual({ elements: [{ ...processShape, x: 103 }, neighbour] });
  });

  test("An element outside the snap distance does not snap", () => {
    expect.hasAssertions();

    // The neighbour's left edge is 7 units right of the shape's left edge once the pointer has moved it by 5, past the snap distance
    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const neighbour = createProcess(SECOND_PROCESS_ID, { height: 40, width: 20, x: 112, y: 300 });
    const state = createState({ elements: [processShape, neighbour] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 155, y: 125 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 155, y: 125 }));

    expect(up.state.document).toStrictEqual({ elements: [{ ...processShape, x: 105 }, neighbour] });
  });

  test("A dragged element snaps its centre to a neighbour's edge midpoint", () => {
    expect.hasAssertions();

    // The neighbour's bottom edge midpoint is (250, 260). The shape's centre is pointed 2 units short of it on each axis, so it snaps onto it
    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const neighbour = createProcess(SECOND_PROCESS_ID, { height: 40, width: 100, x: 200, y: 220 });
    const state = createState({ elements: [processShape, neighbour] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 252, y: 258 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 252, y: 258 }));

    expect(up.state.document).toStrictEqual({ elements: [{ ...processShape, x: 200, y: 235 }, neighbour] });
  });

  test("Holding Alt places the element exactly where the pointer is", () => {
    expect.hasAssertions();

    // The same neighbour as the edge snap, with Alt held through the move and the release, so the shape lands 6 units right of its press
    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const neighbour = createProcess(SECOND_PROCESS_ID, { height: 40, width: 80, x: 103, y: 300 });
    const state = createState({ elements: [processShape, neighbour] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(
      down.state,
      createPointer(GesturePointerAction.Move, { x: 156, y: 125 }, false, true),
    );
    const up = reduceWhiteboardGesture(
      move.state,
      createPointer(GesturePointerAction.Up, { x: 156, y: 125 }, false, true),
    );

    expect(up.state.document).toStrictEqual({ elements: [{ ...processShape, x: 106 }, neighbour] });
  });

  test("The snap distance is held in screen pixels, so a zoomed-in drag snaps less far in document units", () => {
    expect.hasAssertions();

    // At twice the scale a document unit is two screen pixels, so the neighbour's edge 4 units away is 8 screen pixels off, past the snap distance
    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const neighbour = createProcess(SECOND_PROCESS_ID, { height: 40, width: 80, x: 102, y: 300 });
    const state = createState(
      { elements: [processShape, neighbour] },
      { selectedIds: [PROCESS_ID], viewport: { scale: 2, x: 0, y: 0 } },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 300, y: 250 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 312, y: 250 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 312, y: 250 }));

    expect(up.state.document).toStrictEqual({ elements: [{ ...processShape, x: 106 }, neighbour] });
  });

  test("A guide shows while the drag holds an alignment and clears at its end", () => {
    expect.hasAssertions();

    // The shape's left edge snaps onto the neighbour's, so the guide runs down that edge from the shape's top to the neighbour's bottom
    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const neighbour = createProcess(SECOND_PROCESS_ID, { height: 40, width: 80, x: 103, y: 300 });
    const state = createState({ elements: [processShape, neighbour] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 156, y: 125 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 156, y: 125 }));

    expect(move.state.gesture).toStrictEqual({
      guides: [{ axis: SnapAxis.X, end: 340, position: 103, start: 100 }],
      origin: { x: 150, y: 125 },
      phase: GesturePhase.Moving,
      pointerId: POINTER_ID,
    });
    expect(up.state.gesture).toBeUndefined();
  });

  test("a resized shape's edges follow the pointer", () => {
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
          color: "",
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

  test("the hand tool pans the viewport in world units", () => {
    expect.hasAssertions();

    const state = createState({ elements: [] }, { tool: GestureTool.Hand, viewport: { scale: 2, x: 0, y: 0 } });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 10, y: 10 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 30, y: 50 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 30, y: 50 }));

    expect(up.state.viewport).toStrictEqual({ scale: 2, x: -10, y: -20 });
  });

  test("space and a drag pan", () => {
    expect.hasAssertions();

    // The press lands on the process, which a Select drag would move. With Space held the same drag pans the view and leaves the document alone
    const document: PositionedDocument = { elements: [createProcess(PROCESS_ID, PROCESS_BOUNDS)] };
    const state = createState(document, { isSpaceHeld: true });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 151, y: 126 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 151, y: 126 }));

    expect(up.state.viewport).toStrictEqual({ scale: 1, x: -1, y: -1 });
    expect(up.operations).toStrictEqual([]);
    expect(up.state.document).toStrictEqual(document);
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
          color: "",
          dashPattern: DashPattern.Solid,
          end: { arrowhead: ArrowheadKind.Triangle, point: { x: 340, y: 125 } },
          id: NEW_ARROW_ID,
          label: "",
          pathKind: ArrowPathKind.Straight,
          sketchLevel: SketchLevel.Artist,
          start: { binding: { connectionPointIndex: 1, elementId: PROCESS_ID }, point: { x: 200, y: 125 } },
          strokeWidth: StrokeWidth.Medium,
          textSize: TextSize.Small,
          type: PositionedElementType.Arrow,
        },
      ],
    });
  });

  test("releasing an arrow on empty space leaves its end free", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { createId: () => NEW_ARROW_ID, tool: GestureTool.Arrow });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 300, y: 300 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 300, y: 300 }));

    expect(takeOne(up.state.document.elements, 1)).toStrictEqual({
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 300, y: 300 } },
      id: NEW_ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { binding: { connectionPointIndex: 1, elementId: PROCESS_ID }, point: { x: 200, y: 125 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
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
      {
        op: JsonPatchOperationType.Replace,
        path: "/elements/0/x",
        value: PROCESS_BOUNDS.x + PROCESS_BOUNDS.width - MINIMUM_ELEMENT_SIZE,
      },
      {
        op: JsonPatchOperationType.Replace,
        path: "/elements/0/y",
        value: PROCESS_BOUNDS.y + PROCESS_BOUNDS.height - MINIMUM_ELEMENT_SIZE,
      },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: MINIMUM_ELEMENT_SIZE },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: MINIMUM_ELEMENT_SIZE },
    ]);
  });

  test("a press on the handle of several shapes scales each of them in one edit", () => {
    expect.hasAssertions();

    // The two shapes cover (100, 100) to (300, 150), so the bottom-right handle is at (300, 150). A drag of (100, 50) scales the width by one and a
    // Half and the height by two, each shape about the top-left corner
    const firstShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const secondShape = createProcess(SECOND_PROCESS_ID, { height: 50, width: 50, x: 250, y: 100 });
    const state = createState(
      { elements: [firstShape, secondShape] },
      { selectedIds: [PROCESS_ID, SECOND_PROCESS_ID] },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 300, y: 150 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 400, y: 200 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 400, y: 200 }));

    expect(up.state.document).toStrictEqual({
      elements: [
        { ...firstShape, height: 100, width: 150 },
        { ...secondShape, height: 100, width: 75, x: 325 },
      ],
    });
    expect(up.state.selectedIds).toStrictEqual([PROCESS_ID, SECOND_PROCESS_ID]);
  });

  test("A resize stops at the smallest size an element takes", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { selectedIds: [PROCESS_ID] });

    // The right edge's middle is at (200, 125), and the drag takes it past the left edge at x 100
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 50, y: 125 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 50, y: 125 }));

    expect(up.state.document).toStrictEqual({ elements: [{ ...processShape, width: MINIMUM_ELEMENT_SIZE }] });
  });

  test("Alt and a drag leaves the originals and moves the copies", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState(
      { elements: [processShape] },
      { createId: createIdsInOrder([COPY_ID]), selectedIds: [PROCESS_ID] },
    );

    // The press lands in the middle of the shape with Alt held, and the drag takes the pointer by (50, 30)
    const down = reduceWhiteboardGesture(
      state,
      createPointer(GesturePointerAction.Down, { x: 150, y: 125 }, false, true),
    );
    const move = reduceWhiteboardGesture(
      down.state,
      createPointer(GesturePointerAction.Move, { x: 200, y: 155 }, false, true),
    );
    const up = reduceWhiteboardGesture(
      move.state,
      createPointer(GesturePointerAction.Up, { x: 200, y: 155 }, false, true),
    );

    expect(up.state.document).toStrictEqual({
      elements: [processShape, { ...processShape, id: COPY_ID, x: 150, y: 130 }],
    });
    expect(up.state.selectedIds).toStrictEqual([COPY_ID]);
  });

  test("Alt and a drag copies an arrow with the shapes it is bound to", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    // The arrow starts at the shape's right connection point, (200, 125), and its end is free at (300, 300)
    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 300, y: 300 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { binding: { connectionPointIndex: 1, elementId: PROCESS_ID }, point: { x: 200, y: 125 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const state = createState(
      { elements: [processShape, arrow] },
      { createId: createIdsInOrder([COPY_ID, ARROW_COPY_ID]), selectedIds: [PROCESS_ID, ARROW_ID] },
    );

    const down = reduceWhiteboardGesture(
      state,
      createPointer(GesturePointerAction.Down, { x: 150, y: 125 }, false, true),
    );
    const move = reduceWhiteboardGesture(
      down.state,
      createPointer(GesturePointerAction.Move, { x: 200, y: 155 }, false, true),
    );
    const up = reduceWhiteboardGesture(
      move.state,
      createPointer(GesturePointerAction.Up, { x: 200, y: 155 }, false, true),
    );

    // The shape's copy moves to (150, 130), so its right connection point moves to (250, 155), where the arrow copy's start is rerouted
    expect(up.state.document).toStrictEqual({
      elements: [
        processShape,
        arrow,
        { ...processShape, id: COPY_ID, x: 150, y: 130 },
        {
          ...arrow,
          end: { arrowhead: ArrowheadKind.Triangle, point: { x: 350, y: 330 } },
          id: ARROW_COPY_ID,
          start: { binding: { connectionPointIndex: 1, elementId: COPY_ID }, point: { x: 250, y: 155 } },
        },
      ],
    });
    expect(up.state.selectedIds).toStrictEqual([COPY_ID, ARROW_COPY_ID]);
  });

  test("a cancelled Alt drag leaves the originals selected and adds no copy", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState(
      { elements: [processShape] },
      { createId: createIdsInOrder([COPY_ID]), selectedIds: [PROCESS_ID] },
    );

    const down = reduceWhiteboardGesture(
      state,
      createPointer(GesturePointerAction.Down, { x: 150, y: 125 }, false, true),
    );
    const move = reduceWhiteboardGesture(
      down.state,
      createPointer(GesturePointerAction.Move, { x: 200, y: 155 }, false, true),
    );
    const cancel = reduceWhiteboardGesture(
      move.state,
      createPointer(GesturePointerAction.Cancel, { x: 200, y: 155 }, false, true),
    );

    expect(cancel.operations).toStrictEqual([]);
    expect(cancel.state.document).toStrictEqual({ elements: [processShape] });
    expect(cancel.state.selectedIds).toStrictEqual([PROCESS_ID]);
  });

  test("An Alt press without travel copies nothing", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { selectedIds: [PROCESS_ID] });

    const down = reduceWhiteboardGesture(
      state,
      createPointer(GesturePointerAction.Down, { x: 150, y: 125 }, false, true),
    );
    const up = reduceWhiteboardGesture(
      down.state,
      createPointer(GesturePointerAction.Up, { x: 150, y: 125 }, false, true),
    );

    expect(up.operations).toStrictEqual([]);
    expect(up.state.document).toStrictEqual({ elements: [processShape] });
  });

  test("dragging a stroke moves every point of it", () => {
    expect.hasAssertions();

    const stroke: StrokeElement = {
      color: "",
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

  test("Dragging a free end moves that end only", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 250, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { binding: { connectionPointIndex: 2, elementId: PROCESS_ID }, point: { x: 150, y: 150 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    // The arrow is selected, so the handle on its free end is the press's target
    const state = createState({ elements: [processShape, arrow] }, { selectedIds: [ARROW_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 250, y: 250 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 260, y: 270 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 260, y: 270 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/1/end/point", value: { x: 260, y: 270 } },
    ]);
    expect(up.state.document.elements[1]).toStrictEqual({ ...arrow, end: { ...arrow.end, point: { x: 260, y: 270 } } });
  });

  test("Dragging a free end of an arrow with both ends free leaves the other end where it is", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 250, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { point: { x: 150, y: 150 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [arrow] }, { selectedIds: [ARROW_ID] });

    // Both ends are free, so a move of the whole arrow would move the start too. The handle moves the end alone
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 250, y: 250 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 260, y: 270 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 260, y: 270 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/end/point", value: { x: 260, y: 270 } },
    ]);
  });

  test("A press on a free end released without travel moves and binds nothing", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 250, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { point: { x: 150, y: 150 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [arrow] }, { selectedIds: [ARROW_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 250, y: 250 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 250, y: 250 }));

    expect(up.operations).toStrictEqual([]);
  });

  test("The nearer of two free ends within reach is the one grabbed", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 254, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { point: { x: 250, y: 250 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [arrow] }, { selectedIds: [ARROW_ID] });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 254, y: 250 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 300, y: 300 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 300, y: 300 }));

    expect(up.operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/end/point", value: { x: 300, y: 300 } },
    ]);
  });

  test("Releasing a handle on the source shape or an element that takes no connection adds nothing", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { selectedIds: [PROCESS_ID] });

    // The bottom handle is dragged back into the shape it came from, where a new shape would stack on it
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 166 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 150, y: 120 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 150, y: 120 }));

    expect(up.operations).toStrictEqual([]);
  });

  test("A press on an arrow's body away from its ends moves the whole arrow", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 300, y: 300 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { point: { x: 200, y: 200 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [arrow] }, { selectedIds: [ARROW_ID] });

    // The press lands on the line between the ends, which no end handle covers, so the arrow moves whole
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 250, y: 250 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 260, y: 250 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 260, y: 250 }));

    expect(up.state.document.elements[0]).toStrictEqual({
      ...arrow,
      end: { ...arrow.end, point: { x: 310, y: 300 } },
      start: { point: { x: 210, y: 200 } },
    });
  });

  test("Releasing a dragged end on a shape binds it", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 250, y: 250 } },
      id: ARROW_ID,
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Artist,
      start: { point: { x: 150, y: 150 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const state = createState({ elements: [processShape, arrow] }, { selectedIds: [ARROW_ID] });

    // The end is dragged onto the process's bottom point, which is connection point 2, and released there
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 250, y: 250 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 150, y: 152 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 150, y: 152 }));

    expect(up.state.document.elements[1]).toStrictEqual({
      ...arrow,
      end: {
        arrowhead: ArrowheadKind.Triangle,
        binding: { connectionPointIndex: 2, elementId: PROCESS_ID },
        point: { x: 150, y: 150 },
      },
    });
  });

  test("An arrow bound at both ends shows no end handle", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const arrow: ArrowElement = {
      ...BOUND_ARROW,
      end: { binding: { connectionPointIndex: 3, elementId: PROCESS_ID }, point: { x: 200, y: 50 } },
      start: { binding: { connectionPointIndex: 2, elementId: DECISION_ID }, point: { x: 50, y: 100 } },
    };
    const state = createState({ elements: [processShape, arrow] }, { selectedIds: [NEW_ARROW_ID] });

    // A press on a bound end's point finds no handle, so it is a press on the arrow itself, and the handle the press did not find is no end drag
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 50 }));

    expect(down.state.gesture).toStrictEqual(
      expect.objectContaining({ elementId: NEW_ARROW_ID, handle: undefined, phase: GesturePhase.Pressed }),
    );
  });

  test("A selected shape shows a connection handle at each connection point", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { selectedIds: [PROCESS_ID] });

    // A press on the bottom connection point, which sits a gap beyond the shape's frame, is taken as a connection gesture
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 166 }));

    expect(down.state.gesture).toStrictEqual(
      expect.objectContaining({ connectionIndex: 2, elementId: PROCESS_ID, phase: GesturePhase.Connecting }),
    );
  });

  test("An annotation shows no connection handle", () => {
    expect.hasAssertions();

    const annotation: ShapeElement = { ...createProcess(ANNOTATION_ID, PROCESS_BOUNDS), kind: ShapeKind.Annotation };
    const state = createState({ elements: [annotation] }, { selectedIds: [ANNOTATION_ID] });

    // The annotation takes no connection, so a press where its bottom handle would sit is a press on the annotation itself
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 166 }));

    expect(down.state.gesture).toStrictEqual(expect.objectContaining({ phase: GesturePhase.Pressed }));
  });

  test("Dragging a connection handle to empty canvas adds a connected shape", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState(
      { elements: [processShape] },
      { createId: createIdsInOrder([NEW_ARROW_ID, PLACED_SHAPE_ID]), selectedIds: [PROCESS_ID] },
    );

    // The bottom handle of the process is dragged to an empty point and released, so a process is added there, joined by an arrow
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 166 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 150, y: 300 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 150, y: 300 }));

    expect(up.state.document.elements).toHaveLength(3);
    expect(up.state.document.elements[1]).toStrictEqual(
      expect.objectContaining({ id: PLACED_SHAPE_ID, kind: ShapeKind.Process, type: PositionedElementType.Shape }),
    );
    expect(up.state.document.elements[2]).toStrictEqual(
      expect.objectContaining({
        // The new shape is centred on the release, so its top connection point is the one the arrow ends at
        end: {
          arrowhead: ArrowheadKind.Triangle,
          binding: { connectionPointIndex: 0, elementId: PLACED_SHAPE_ID },
          point: { x: 150, y: 260 },
        },
        id: NEW_ARROW_ID,
        start: { binding: { connectionPointIndex: 2, elementId: PROCESS_ID }, point: { x: 150, y: 150 } },
      }),
    );
  });

  test("Releasing a handle on another shape joins it without adding a shape", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const decisionShape: ShapeElement = {
      ...createProcess(DECISION_ID, { height: 100, width: 100, x: 100, y: 300 }),
      kind: ShapeKind.Decision,
    };
    const state = createState(
      { elements: [processShape, decisionShape] },
      { createId: () => NEW_ARROW_ID, selectedIds: [PROCESS_ID] },
    );

    // The bottom handle is released on the decision, whose top connection point is the nearest one the release lands near
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 166 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 150, y: 320 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 150, y: 320 }));

    expect(up.state.document.elements).toHaveLength(3);
    expect(up.state.document.elements[2]).toStrictEqual(
      expect.objectContaining({
        end: {
          arrowhead: ArrowheadKind.Triangle,
          binding: { connectionPointIndex: 0, elementId: DECISION_ID },
          point: { x: 150, y: 300 },
        },
        id: NEW_ARROW_ID,
      }),
    );
  });

  test("A press that does not travel adds nothing", () => {
    expect.hasAssertions();

    const processShape = createProcess(PROCESS_ID, PROCESS_BOUNDS);
    const state = createState({ elements: [processShape] }, { selectedIds: [PROCESS_ID] });

    // The handle is pressed and released where it was pressed, so the release is a click and no shape or arrow is added
    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 150, y: 166 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 150, y: 166 }));

    expect(up.operations).toStrictEqual([]);
    expect(up.state.document).toStrictEqual({ elements: [processShape] });
  });

  test("a click with a shape tool places a shape at the point", () => {
    expect.hasAssertions();

    const state = createState({ elements: [] }, { createId: () => PLACED_SHAPE_ID, tool: GestureTool.Shape });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 200, y: 125 }));

    expect(up.operations).toStrictEqual([
      {
        op: JsonPatchOperationType.Add,
        path: "/elements/0",
        value: {
          color: "",
          cornerStyle: CornerStyle.Sharp,
          dashPattern: DashPattern.Solid,
          fill: WHITEBOARD_SHAPE_FILL,
          height: WHITEBOARD_SHAPE_SIZE.height,
          id: PLACED_SHAPE_ID,
          kind: ShapeKind.Rectangle,
          sketchLevel: SketchLevel.Artist,
          strokeWidth: StrokeWidth.Medium,
          text: "",
          textSize: TextSize.Small,
          type: PositionedElementType.Shape,
          width: WHITEBOARD_SHAPE_SIZE.width,
          x: 200 - WHITEBOARD_SHAPE_SIZE.width / 2,
          y: 125 - WHITEBOARD_SHAPE_SIZE.height / 2,
        },
      },
    ]);
    expect(up.state.selectedIds).toStrictEqual([PLACED_SHAPE_ID]);
  });

  test("a drag with a shape tool sizes the shape", () => {
    expect.hasAssertions();

    const state = createState({ elements: [] }, { createId: () => PLACED_SHAPE_ID, tool: GestureTool.Shape });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const move = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Move, { x: 300, y: 185 }));
    const up = reduceWhiteboardGesture(move.state, createPointer(GesturePointerAction.Up, { x: 300, y: 185 }));

    expect(up.operations).toStrictEqual([
      {
        op: JsonPatchOperationType.Add,
        path: "/elements/0",
        value: {
          color: "",
          cornerStyle: CornerStyle.Sharp,
          dashPattern: DashPattern.Solid,
          fill: WHITEBOARD_SHAPE_FILL,
          height: 60,
          id: PLACED_SHAPE_ID,
          kind: ShapeKind.Rectangle,
          sketchLevel: SketchLevel.Artist,
          strokeWidth: StrokeWidth.Medium,
          text: "",
          textSize: TextSize.Small,
          type: PositionedElementType.Shape,
          width: 100,
          x: 200,
          y: 125,
        },
      },
    ]);
  });

  test("a placement returns the tool to select", () => {
    expect.hasAssertions();

    const state = createState({ elements: [] }, { createId: () => PLACED_SHAPE_ID, tool: GestureTool.Shape });

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 200, y: 125 }));

    expect(up.state.tool).toBe(GestureTool.Select);
  });

  test("a locked tool stays in hand", () => {
    expect.hasAssertions();

    const state = createState(
      { elements: [] },
      { createId: () => PLACED_SHAPE_ID, isToolLocked: true, tool: GestureTool.Shape },
    );

    const down = reduceWhiteboardGesture(state, createPointer(GesturePointerAction.Down, { x: 200, y: 125 }));
    const up = reduceWhiteboardGesture(down.state, createPointer(GesturePointerAction.Up, { x: 200, y: 125 }));

    expect(up.state.tool).toBe(GestureTool.Shape);
  });
});
