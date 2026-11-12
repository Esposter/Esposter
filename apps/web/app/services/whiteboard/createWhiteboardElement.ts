import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";
import type { Bounds } from "vue-block-editor-headless";

import {
  WHITEBOARD_SHAPE_FILL,
  WHITEBOARD_STICKY_NOTE_FILL,
  WHITEBOARD_TEXT_BOX_TEXT,
} from "@/services/whiteboard/palette/constants";
import { CornerStyle, DashPattern, PositionedElementType, SketchLevel, StrokeWidth } from "vue-block-editor-headless";

// A new element of a placement in a box, with the id the caller fixes and the text and fill it starts with. A text box keeps no
// Height, since its text sets it. A shape and a sticky note start solid at medium width, drawn at the artist sketch, and an empty colour draws in the
// Page's text colour. A shape starts with sharp corners
export const createWhiteboardElement = (
  placement: WhiteboardPlacement,
  id: string,
  { height, width, x, y }: Bounds,
): WhiteboardElement => {
  if (placement.type === PositionedElementType.Text)
    return { color: "", id, text: WHITEBOARD_TEXT_BOX_TEXT, type: placement.type, width, x, y };
  const element = {
    color: "",
    dashPattern: DashPattern.Solid,
    height,
    id,
    sketchLevel: SketchLevel.Artist,
    strokeWidth: StrokeWidth.Medium,
    text: "",
    width,
    x,
    y,
  };
  if (placement.type === PositionedElementType.StickyNote)
    return { ...element, fill: WHITEBOARD_STICKY_NOTE_FILL, type: placement.type };
  return {
    ...element,
    cornerStyle: CornerStyle.Sharp,
    fill: WHITEBOARD_SHAPE_FILL,
    kind: placement.kind,
    type: placement.type,
  };
};
