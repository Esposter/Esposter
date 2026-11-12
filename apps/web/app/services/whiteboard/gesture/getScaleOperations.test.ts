import type { ArrowElement, PositionedDocument, ShapeElement, StrokeElement } from "vue-block-editor-headless";

import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import { WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { MINIMUM_ELEMENT_SIZE } from "@/services/whiteboard/gesture/constants";
import { getScaleOperations } from "@/services/whiteboard/gesture/getScaleOperations";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ArrowheadKind, PositionedElementType, StrokeWidth } from "vue-block-editor-headless";

const createShape = (id: string, x: number, y: number, width: number, height: number): ShapeElement => ({
  ...WHITEBOARD_PROCESS,
  height,
  id,
  width,
  x,
  y,
});

describe(getScaleOperations, () => {
  const FIRST_ID = crypto.randomUUID();
  const SECOND_ID = crypto.randomUUID();
  const THIRD_ID = crypto.randomUUID();
  const SMALL_ID = crypto.randomUUID();
  const LARGE_ID = crypto.randomUUID();
  const ARROW_ID = crypto.randomUUID();
  const STROKE_ID = crypto.randomUUID();

  test("dragging a corner of several shapes scales each of them", () => {
    expect.hasAssertions();

    // The three shapes cover a box from (100, 100) to (350, 400), so the bottom-right corner is at (350, 400). The drag of (250, 150) doubles
    // The width and scales the height by one and a half, each shape about the top-left corner of the box
    const document: PositionedDocument = {
      elements: [
        createShape(FIRST_ID, 100, 100, 100, 50),
        createShape(SECOND_ID, 300, 200, 50, 100),
        createShape(THIRD_ID, 200, 300, 100, 100),
      ],
    };
    const operations = getScaleOperations(document, [FIRST_ID, SECOND_ID, THIRD_ID], ResizeHandle.BottomRight, {
      x: 250,
      y: 150,
    });

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 100, 100, 200, 75),
      createShape(SECOND_ID, 500, 250, 100, 150),
      createShape(THIRD_ID, 300, 400, 200, 150),
    ]);
  });

  test("an arrow bound to a resized shape follows it", () => {
    expect.hasAssertions();

    // The shape's right connection point is at (200, 125), where the arrow starts, and its free end is at (300, 300). The box of the two covers
    // (100, 100) to (300, 300), so a drag of 100 to the right stretches it to 1.5 times its width, the top-left corner holding still
    const shape = createShape(FIRST_ID, 100, 100, 100, 50);
    const arrow: ArrowElement = {
      ...WHITEBOARD_ARROW,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 300, y: 300 } },
      id: ARROW_ID,
      start: { binding: { connectionPointIndex: 1, elementId: FIRST_ID }, point: { x: 200, y: 125 } },
    };
    const document: PositionedDocument = { elements: [shape, arrow] };
    const operations = getScaleOperations(document, [FIRST_ID, ARROW_ID], ResizeHandle.BottomRight, { x: 100, y: 0 });

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 100, 100, 150, 50),
      {
        ...arrow,
        end: { arrowhead: ArrowheadKind.Triangle, point: { x: 400, y: 300 } },
        start: { ...arrow.start, point: { x: 250, y: 125 } },
      },
    ]);
  });

  test("a resize of several stops where the smallest element stops", () => {
    expect.hasAssertions();

    // The small shape is 40 wide and the large one 200, so the scale on the width stops at the minimum size of the small one, which is 0.4
    const document: PositionedDocument = {
      elements: [createShape(SMALL_ID, 100, 100, 40, 40), createShape(LARGE_ID, 160, 100, 200, 100)],
    };
    const operations = getScaleOperations(document, [SMALL_ID, LARGE_ID], ResizeHandle.Right, { x: -300, y: 0 });

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(SMALL_ID, 100, 100, MINIMUM_ELEMENT_SIZE, 40),
      createShape(LARGE_ID, 124, 100, 80, 100),
    ]);
  });

  test("a stroke in a selection scales its points with it", () => {
    expect.hasAssertions();

    // The shape and the stroke cover (0, 0) to (150, 100), and a drag of 150 to the right doubles the width about the left side
    const stroke: StrokeElement = {
      color: "",
      id: STROKE_ID,
      points: [
        { x: 100, y: 50 },
        { x: 150, y: 100 },
      ],
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Stroke,
    };
    const document: PositionedDocument = { elements: [createShape(FIRST_ID, 0, 0, 100, 100), stroke] };
    const operations = getScaleOperations(document, [FIRST_ID, STROKE_ID], ResizeHandle.Right, { x: 150, y: 0 });

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 0, 0, 200, 100),
      {
        ...stroke,
        points: [
          { x: 200, y: 50 },
          { x: 300, y: 100 },
        ],
      },
    ]);
  });
});
