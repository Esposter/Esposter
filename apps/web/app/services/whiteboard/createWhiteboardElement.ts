import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { getCentredPosition } from "@/services/whiteboard/getCentredPosition";
import {
  WHITEBOARD_SHAPE_FILL,
  WHITEBOARD_STICKY_NOTE_FILL,
  WHITEBOARD_TEXT_BOX_TEXT,
} from "@/services/whiteboard/palette/constants";
import { getWhiteboardItemSize } from "@/services/whiteboard/palette/getWhiteboardItemSize";
import { PositionedElementType } from "headless-block-editor";

// A new element for a palette item, centred on a point, with a fresh id and the text a text box starts with
export const createWhiteboardElement = (item: WhiteboardPaletteItem, centre: Point): WhiteboardElement => {
  const size = getWhiteboardItemSize(item);
  const position = getCentredPosition(centre, size);
  const id = crypto.randomUUID();
  if (item.type === PositionedElementType.Text)
    return { id, text: WHITEBOARD_TEXT_BOX_TEXT, type: item.type, width: size.width, ...position };
  if (item.type === PositionedElementType.StickyNote)
    return {
      fill: WHITEBOARD_STICKY_NOTE_FILL,
      height: size.height,
      id,
      text: "",
      type: item.type,
      width: size.width,
      ...position,
    };
  return {
    fill: WHITEBOARD_SHAPE_FILL,
    height: size.height,
    id,
    kind: item.kind,
    text: "",
    type: item.type,
    width: size.width,
    ...position,
  };
};
