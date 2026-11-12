import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";
import type { Bounds } from "vue-block-editor-headless";

import {
  WHITEBOARD_SHAPE_FILL,
  WHITEBOARD_STICKY_NOTE_FILL,
  WHITEBOARD_TEXT_BOX_TEXT,
} from "@/services/whiteboard/palette/constants";
import { DashPattern, PositionedElementType, StrokeWidth } from "vue-block-editor-headless";

// A new element of a placement in a box, with the id the caller fixes and the text and fill it starts with. A text box keeps no
// Height, since its text sets it. A shape and a sticky note start solid at medium width, and an empty colour draws in the page's text colour
export const createWhiteboardElement = (
  placement: WhiteboardPlacement,
  id: string,
  { height, width, x, y }: Bounds,
): WhiteboardElement => {
  if (placement.type === PositionedElementType.Text)
    return { color: "", id, text: WHITEBOARD_TEXT_BOX_TEXT, type: placement.type, width, x, y };
  if (placement.type === PositionedElementType.StickyNote)
    return {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: WHITEBOARD_STICKY_NOTE_FILL,
      height,
      id,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      type: placement.type,
      width,
      x,
      y,
    };
  return {
    color: "",
    dashPattern: DashPattern.Solid,
    fill: WHITEBOARD_SHAPE_FILL,
    height,
    id,
    kind: placement.kind,
    strokeWidth: StrokeWidth.Medium,
    text: "",
    type: placement.type,
    width,
    x,
    y,
  };
};
