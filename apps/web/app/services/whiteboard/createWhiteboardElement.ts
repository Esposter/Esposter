import type { WhiteboardPlacement } from "#src/models/whiteboard/WhiteboardPlacement";
import type { Bounds, PositionedElement } from "vue-block-editor-headless";

import {
  WHITEBOARD_SHAPE_FILL,
  WHITEBOARD_STICKY_NOTE_FILL,
  WHITEBOARD_TEXT_BOX_TEXT,
} from "#src/services/whiteboard/palette/constants";
import {
  CornerStyle,
  DashPattern,
  PositionedElementType,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

// A new element of a placement in a box, with the id the caller fixes and the text and fill it starts with. A text box
// Keeps no height, since its text sets it, and starts wrapped at the small size. A shape and a sticky note start solid
// At medium width, drawn at the artist sketch and at the small size, and an empty colour draws in the page's text
// Colour. A shape starts with sharp corners
export const createWhiteboardElement = (
  placement: WhiteboardPlacement,
  id: string,
  { height, width, x, y }: Bounds,
): PositionedElement => {
  if (placement.type === PositionedElementType.Text)
    return {
      color: "",
      id,
      isWrapped: true,
      text: WHITEBOARD_TEXT_BOX_TEXT,
      textSize: TextSize.Small,
      type: placement.type,
      width,
      x,
      y,
    };
  const element = {
    color: "",
    dashPattern: DashPattern.Solid,
    height,
    id,
    sketchLevel: SketchLevel.Artist,
    strokeWidth: StrokeWidth.Medium,
    text: "",
    textSize: TextSize.Small,
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
