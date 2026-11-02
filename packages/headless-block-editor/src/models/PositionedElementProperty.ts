import type { ArrowEndKey } from "#src/models/ArrowEndKey";
import type { ArrowPathKind } from "#src/models/ArrowPathKind";

// A property of a positioned element that a command sets: a shape's or a sticky note's fill, an arrow's route, or whether an arrow
// Has an arrowhead at one of its ends
export type PositionedElementProperty =
  | { end: ArrowEndKey; property: "hasArrowhead"; value: boolean }
  | { property: "fill"; value: string }
  | { property: "pathKind"; value: ArrowPathKind };
