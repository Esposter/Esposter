import type { ArrowEndKey } from "#src/models/ArrowEndKey";
import type { ArrowPathKind } from "#src/models/ArrowPathKind";
import type { CornerStyle } from "#src/models/CornerStyle";
import type { DashPattern } from "#src/models/DashPattern";
import type { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import type { SketchLevel } from "#src/models/SketchLevel";
import type { StrokeWidth } from "#src/models/StrokeWidth";
import type { TextSize } from "#src/models/TextSize";
import type { VerticalAlignment } from "#src/models/VerticalAlignment";

// A property of a positioned element that a command sets: a colour, a width, a dash pattern or a sketch level on an element that draws a line, a shape's
// Or sticky note's fill, a shape's corners, an arrow's route, or whether an arrow has an arrowhead at one of its ends. A text's size and horizontal
// Alignment, a shape's or sticky note's vertical alignment, and whether a text box wraps its text
export type PositionedElementProperty =
  | { end: ArrowEndKey; property: "hasArrowhead"; value: boolean }
  | { property: "color"; value: string }
  | { property: "cornerStyle"; value: CornerStyle }
  | { property: "dashPattern"; value: DashPattern }
  | { property: "fill"; value: string }
  | { property: "horizontalAlignment"; value: HorizontalAlignment }
  | { property: "isWrapped"; value: boolean }
  | { property: "pathKind"; value: ArrowPathKind }
  | { property: "sketchLevel"; value: SketchLevel }
  | { property: "strokeWidth"; value: StrokeWidth }
  | { property: "textSize"; value: TextSize }
  | { property: "verticalAlignment"; value: VerticalAlignment };
