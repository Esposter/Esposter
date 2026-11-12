import type { ArrowElement, PositionedDocument, ShapeElement } from "vue-block-editor-headless";

import { AlignEdge } from "@/models/whiteboard/AlignEdge";
import { getAlignOperations } from "@/services/whiteboard/arrange/getAlignOperations";
import { WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ArrowheadKind } from "vue-block-editor-headless";

describe(getAlignOperations, () => {
  const FIRST_ID = crypto.randomUUID();
  const SECOND_ID = crypto.randomUUID();
  const THIRD_ID = crypto.randomUUID();
  const ARROW_ID = crypto.randomUUID();
  const createShape = (id: string, x: number, y: number, width: number, height: number): ShapeElement => ({
    ...WHITEBOARD_PROCESS,
    height,
    id,
    width,
    x,
    y,
  });

  test("Aligning to the left edge moves each box to the leftmost edge", () => {
    expect.hasAssertions();

    // The leftmost edge is the second shape's, at 10, so the first and third shapes move to it and keep their heights
    const document: PositionedDocument = {
      elements: [
        createShape(FIRST_ID, 40, 0, 100, 100),
        createShape(SECOND_ID, 10, 150, 60, 60),
        createShape(THIRD_ID, 200, 300, 80, 80),
      ],
    };
    const operations = getAlignOperations(document, [FIRST_ID, SECOND_ID, THIRD_ID], AlignEdge.Left);

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 10, 0, 100, 100),
      createShape(SECOND_ID, 10, 150, 60, 60),
      createShape(THIRD_ID, 10, 300, 80, 80),
    ]);
  });

  test("Aligning leaves a free arrow where it was", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      ...WHITEBOARD_ARROW,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 600, y: 700 } },
      id: ARROW_ID,
      start: { point: { x: 500, y: 500 } },
    };
    const document: PositionedDocument = {
      elements: [createShape(FIRST_ID, 0, 0, 100, 100), createShape(SECOND_ID, 200, 50, 100, 60), arrow],
    };
    const operations = getAlignOperations(document, [FIRST_ID, SECOND_ID, ARROW_ID], AlignEdge.Top);

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 0, 0, 100, 100),
      createShape(SECOND_ID, 200, 0, 100, 60),
      arrow,
    ]);
  });

  test("Aligning a bound box reroutes the arrow bound to it in the same edit", () => {
    expect.hasAssertions();

    // The second shape's bottom connection point is at (250, 110) before the align, and at (250, 60) once its top edge is level with the first's
    const arrow: ArrowElement = {
      ...WHITEBOARD_ARROW,
      id: ARROW_ID,
      start: { binding: { connectionPointIndex: 2, elementId: SECOND_ID }, point: { x: 250, y: 110 } },
    };
    const document: PositionedDocument = {
      elements: [createShape(FIRST_ID, 0, 0, 100, 100), createShape(SECOND_ID, 200, 50, 100, 60), arrow],
    };
    const operations = getAlignOperations(document, [FIRST_ID, SECOND_ID], AlignEdge.Top);

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 0, 0, 100, 100),
      createShape(SECOND_ID, 200, 0, 100, 60),
      { ...arrow, start: { ...arrow.start, point: { x: 250, y: 60 } } },
    ]);
  });

  test("Align is disabled when fewer than two boxes are selected", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = { ...WHITEBOARD_ARROW, id: ARROW_ID };
    const document: PositionedDocument = { elements: [createShape(FIRST_ID, 0, 0, 100, 100), arrow] };

    expect(getAlignOperations(document, [FIRST_ID, ARROW_ID], AlignEdge.Left)).toStrictEqual([]);
  });
});
