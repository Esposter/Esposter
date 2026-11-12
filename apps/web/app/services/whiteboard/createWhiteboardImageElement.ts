import type { ImageElement, Point } from "vue-block-editor-headless";

import { getCentredPosition } from "@/services/whiteboard/getCentredPosition";
import { WHITEBOARD_IMAGE_SIZE } from "@/services/whiteboard/palette/constants";
import { PositionedElementType } from "vue-block-editor-headless";

// A new image element for an uploaded file, centred on a point. It holds the file's id and none of its bytes, and no alt text yet
export const createWhiteboardImageElement = (fileId: string, centre: Point): ImageElement => ({
  altText: "",
  fileId,
  height: WHITEBOARD_IMAGE_SIZE.height,
  id: crypto.randomUUID(),
  type: PositionedElementType.Image,
  width: WHITEBOARD_IMAGE_SIZE.width,
  ...getCentredPosition(centre, WHITEBOARD_IMAGE_SIZE),
});
