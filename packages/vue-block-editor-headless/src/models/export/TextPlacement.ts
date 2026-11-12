import type { TextAnchor } from "#src/models/export/TextAnchor";
import type { Point } from "#src/models/Point";
import type { TextSize } from "#src/models/TextSize";
import type { VerticalAlignment } from "#src/models/VerticalAlignment";

// Where a text is drawn: the point it is anchored at, whose x is the side of its box its alignment picks and whose y is the top, middle or bottom
// The vertical alignment picks. Its lines start, centre or end on that x, at the size it draws at. A text lays out at the width it is given when it is
// Wrapped, and breaks only at its newlines when it is not
export interface TextPlacement {
  isWrapped: boolean;
  point: Point;
  textAnchor: TextAnchor;
  textSize: TextSize;
  verticalAlignment: VerticalAlignment;
  width: number;
}
