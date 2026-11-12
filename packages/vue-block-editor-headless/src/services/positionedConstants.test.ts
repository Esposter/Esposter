import type { ArrowElement } from "#src/models/ArrowElement";
import type { ShapeElement } from "#src/models/ShapeElement";

import { ArrowheadKind } from "#src/models/ArrowheadKind";
import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { CornerStyle } from "#src/models/CornerStyle";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { describe } from "vitest";

export const POSITIONED_ANNOTATION_ID: string = crypto.randomUUID();
const POSITIONED_ARROW_ID: string = crypto.randomUUID();
const POSITIONED_FREE_ARROW_ID: string = crypto.randomUUID();
export const POSITIONED_PROCESS_ID: string = crypto.randomUUID();
export const POSITIONED_RECTANGLE_ID: string = crypto.randomUUID();

// A rectangle at the origin, 100 by 100: its bottom point is at (50, 100)
export const POSITIONED_RECTANGLE: ShapeElement = {
  color: "",
  cornerStyle: CornerStyle.Sharp,
  dashPattern: DashPattern.Solid,
  fill: "#ffffff",
  height: 100,
  id: POSITIONED_RECTANGLE_ID,
  kind: ShapeKind.Rectangle,
  sketchLevel: SketchLevel.Artist,
  strokeWidth: StrokeWidth.Medium,
  text: "",
  textSize: TextSize.Small,
  type: PositionedElementType.Shape,
  width: 100,
  x: 0,
  y: 0,
};
export const POSITIONED_PROCESS: ShapeElement = {
  color: "",
  cornerStyle: CornerStyle.Sharp,
  dashPattern: DashPattern.Solid,
  fill: "#ffffff",
  height: 100,
  id: POSITIONED_PROCESS_ID,
  kind: ShapeKind.Process,
  sketchLevel: SketchLevel.Artist,
  strokeWidth: StrokeWidth.Medium,
  text: "",
  textSize: TextSize.Small,
  type: PositionedElementType.Shape,
  width: 100,
  x: 200,
  y: 0,
};
export const POSITIONED_ANNOTATION: ShapeElement = {
  color: "",
  cornerStyle: CornerStyle.Sharp,
  dashPattern: DashPattern.Solid,
  fill: "#ffffff",
  height: 100,
  id: POSITIONED_ANNOTATION_ID,
  kind: ShapeKind.Annotation,
  sketchLevel: SketchLevel.Artist,
  strokeWidth: StrokeWidth.Medium,
  text: "",
  textSize: TextSize.Small,
  type: PositionedElementType.Shape,
  width: 100,
  x: 400,
  y: 0,
};
// An arrow bound at its start to the rectangle's bottom point, free at its end
export const POSITIONED_ARROW: ArrowElement = {
  color: "",
  dashPattern: DashPattern.Solid,
  end: { arrowhead: ArrowheadKind.Triangle, point: { x: 150, y: 250 } },
  id: POSITIONED_ARROW_ID,
  label: "",
  pathKind: ArrowPathKind.Straight,
  sketchLevel: SketchLevel.Artist,
  start: { binding: { connectionPointIndex: 2, elementId: POSITIONED_RECTANGLE_ID }, point: { x: 50, y: 100 } },
  strokeWidth: StrokeWidth.Medium,
  textSize: TextSize.Small,
  type: PositionedElementType.Arrow,
};
// An arrow free at both ends, from (150, 50) to (250, 150)
export const POSITIONED_FREE_ARROW: ArrowElement = {
  color: "",
  dashPattern: DashPattern.Solid,
  end: { arrowhead: ArrowheadKind.Triangle, point: { x: 250, y: 150 } },
  id: POSITIONED_FREE_ARROW_ID,
  label: "",
  pathKind: ArrowPathKind.Straight,
  sketchLevel: SketchLevel.Artist,
  start: { point: { x: 150, y: 50 } },
  strokeWidth: StrokeWidth.Medium,
  textSize: TextSize.Small,
  type: PositionedElementType.Arrow,
};

describe.todo("positionedConstants");
