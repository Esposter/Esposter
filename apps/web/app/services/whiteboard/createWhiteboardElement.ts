import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";
import type { Bounds } from "headless-block-editor";

import {
  WHITEBOARD_SHAPE_FILL,
  WHITEBOARD_STICKY_NOTE_FILL,
  WHITEBOARD_TEXT_BOX_TEXT,
} from "@/services/whiteboard/palette/constants";
import { PositionedElementType } from "headless-block-editor";

// A new element of a placement in a box, with the id the caller fixes and the text and fill it starts with. A text box keeps no
// Height, since its text sets it
export const createWhiteboardElement = (
  placement: WhiteboardPlacement,
  id: string,
  { height, width, x, y }: Bounds,
): WhiteboardElement => {
  if (placement.type === PositionedElementType.Text)
    return { id, text: WHITEBOARD_TEXT_BOX_TEXT, type: placement.type, width, x, y };
  if (placement.type === PositionedElementType.StickyNote)
    return { fill: WHITEBOARD_STICKY_NOTE_FILL, height, id, text: "", type: placement.type, width, x, y };
  return { fill: WHITEBOARD_SHAPE_FILL, height, id, kind: placement.kind, text: "", type: placement.type, width, x, y };
};
