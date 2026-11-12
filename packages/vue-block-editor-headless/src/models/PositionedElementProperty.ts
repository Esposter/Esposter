import type { ArrowEndKey } from "#src/models/ArrowEndKey";
import type { ArrowPathKind } from "#src/models/ArrowPathKind";
import type { DashPattern } from "#src/models/DashPattern";
import type { StrokeWidth } from "#src/models/StrokeWidth";

// A property of a positioned element that a command sets: a colour, a width or a dash pattern on an element that draws a line, a shape's or a
// Sticky note's fill, an arrow's route, or whether an arrow has an arrowhead at one of its ends
export type PositionedElementProperty =
  | { end: ArrowEndKey; property: "hasArrowhead"; value: boolean }
  | { property: "color"; value: string }
  | { property: "dashPattern"; value: DashPattern }
  | { property: "fill"; value: string }
  | { property: "pathKind"; value: ArrowPathKind }
  | { property: "strokeWidth"; value: StrokeWidth };
