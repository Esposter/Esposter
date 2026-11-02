import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Size } from "headless-block-editor";

import {
  WHITEBOARD_SHAPE_SIZE,
  WHITEBOARD_STICKY_NOTE_SIZE,
  WHITEBOARD_TEXT_BOX_SIZE,
} from "@/services/whiteboard/palette/constants";
import { PositionedElementType } from "headless-block-editor";

// The size a palette item is placed at: a sticky note's and a text box's own, and a shape's for every shape kind
export const getWhiteboardItemSize = (item: WhiteboardPaletteItem): Size => {
  if (item.type === PositionedElementType.StickyNote) return WHITEBOARD_STICKY_NOTE_SIZE;
  if (item.type === PositionedElementType.Text) return WHITEBOARD_TEXT_BOX_SIZE;
  return WHITEBOARD_SHAPE_SIZE;
};
