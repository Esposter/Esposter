import type { PositionedElementType, ShapeKind } from "headless-block-editor";

// One thing the palette places: a shape of a kind, a sticky note, or a text box
export type WhiteboardPaletteItem =
  | { kind: ShapeKind; title: string; type: PositionedElementType.Shape }
  | { title: string; type: PositionedElementType.StickyNote }
  | { title: string; type: PositionedElementType.Text };
