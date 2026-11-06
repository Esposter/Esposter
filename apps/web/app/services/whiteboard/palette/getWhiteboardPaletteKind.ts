import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { ShapeKind } from "headless-block-editor";

import { PositionedElementType } from "headless-block-editor";

// What a palette item is known by: a shape's kind, or the type of a sticky note or a text box, which have no kind
export type WhiteboardPaletteKind = ShapeKind | PositionedElementType.StickyNote | PositionedElementType.Text;

export const getWhiteboardPaletteKind = (item: WhiteboardPaletteItem): WhiteboardPaletteKind =>
  item.type === PositionedElementType.Shape ? item.kind : item.type;
