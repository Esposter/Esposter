import type { PositionedElementType, ShapeKind } from "headless-block-editor";

// What a placing tool places: a shape of a kind, a sticky note, or a text box
export type WhiteboardPlacement =
  | { kind: ShapeKind; type: PositionedElementType.Shape }
  | { type: PositionedElementType.StickyNote }
  | { type: PositionedElementType.Text };
