import type { ArrowElement } from "#src/models/ArrowElement";
import type { ShapeElement } from "#src/models/ShapeElement";

import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { describe } from "vitest";

export const POSITIONED_ANNOTATION_ID: string = crypto.randomUUID();
const POSITIONED_ARROW_ID: string = crypto.randomUUID();
const POSITIONED_FREE_ARROW_ID: string = crypto.randomUUID();
export const POSITIONED_PROCESS_ID: string = crypto.randomUUID();
export const POSITIONED_RECTANGLE_ID: string = crypto.randomUUID();

// A rectangle at the origin, 100 by 100: its bottom point is at (50, 100)
export const POSITIONED_RECTANGLE: ShapeElement = {
  fill: "#ffffff",
  height: 100,
  id: POSITIONED_RECTANGLE_ID,
  kind: ShapeKind.Rectangle,
  text: "",
  type: PositionedElementType.Shape,
  width: 100,
  x: 0,
  y: 0,
};
export const POSITIONED_PROCESS: ShapeElement = {
  fill: "#ffffff",
  height: 100,
  id: POSITIONED_PROCESS_ID,
  kind: ShapeKind.Process,
  text: "",
  type: PositionedElementType.Shape,
  width: 100,
  x: 200,
  y: 0,
};
export const POSITIONED_ANNOTATION: ShapeElement = {
  fill: "#ffffff",
  height: 100,
  id: POSITIONED_ANNOTATION_ID,
  kind: ShapeKind.Annotation,
  text: "",
  type: PositionedElementType.Shape,
  width: 100,
  x: 400,
  y: 0,
};
// An arrow bound at its start to the rectangle's bottom point, free at its end
export const POSITIONED_ARROW: ArrowElement = {
  end: { hasArrowhead: true, point: { x: 150, y: 250 } },
  id: POSITIONED_ARROW_ID,
  label: "",
  pathKind: ArrowPathKind.Straight,
  start: {
    binding: { connectionPointIndex: 2, elementId: POSITIONED_RECTANGLE_ID },
    hasArrowhead: false,
    point: { x: 50, y: 100 },
  },
  type: PositionedElementType.Arrow,
};
// An arrow free at both ends, from (150, 50) to (250, 150)
export const POSITIONED_FREE_ARROW: ArrowElement = {
  end: { hasArrowhead: true, point: { x: 250, y: 150 } },
  id: POSITIONED_FREE_ARROW_ID,
  label: "",
  pathKind: ArrowPathKind.Straight,
  start: { hasArrowhead: false, point: { x: 150, y: 50 } },
  type: PositionedElementType.Arrow,
};

describe.todo("positionedConstants");
