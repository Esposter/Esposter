import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";
import type { Size } from "vue-block-editor-headless";

import {
  WHITEBOARD_SHAPE_SIZE,
  WHITEBOARD_STICKY_NOTE_SIZE,
  WHITEBOARD_TEXT_BOX_SIZE,
} from "@/services/whiteboard/palette/constants";
import { PositionedElementType } from "vue-block-editor-headless";

// The size a placement takes by default: a sticky note's and a text box's own, and a shape's for every shape kind
export const getWhiteboardItemSize = (placement: WhiteboardPlacement): Size => {
  if (placement.type === PositionedElementType.StickyNote) return WHITEBOARD_STICKY_NOTE_SIZE;
  if (placement.type === PositionedElementType.Text) return WHITEBOARD_TEXT_BOX_SIZE;
  return WHITEBOARD_SHAPE_SIZE;
};
