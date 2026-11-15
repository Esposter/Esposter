import type { PositionedElementType, ShapeKind } from "vue-block-editor-headless";

// What a placing tool places: a shape of a kind, a sticky note, or a text box
export type WhiteboardPlacement =
  | { kind: ShapeKind; type: typeof PositionedElementType.Shape }
  | { type: typeof PositionedElementType.StickyNote }
  | { type: typeof PositionedElementType.Text };
