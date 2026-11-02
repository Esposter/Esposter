import type { TextAnchor } from "#src/models/export/TextAnchor";
import type { Point } from "#src/models/Point";

// Where a text is drawn: the point it is anchored at, whether its lines hang from that point or are centred on it, and the width its lines wrap at
export interface TextPlacement {
  point: Point;
  textAnchor: TextAnchor;
  width: number;
}
