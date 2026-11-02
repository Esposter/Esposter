import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { Point } from "headless-block-editor";

import { getCentredPosition } from "@/services/whiteboard/getCentredPosition";
import { WHITEBOARD_IMAGE_SIZE } from "@/services/whiteboard/palette/constants";
import { PositionedElementType } from "headless-block-editor";

// A new image element for an uploaded file, centred on a point. It holds the file's id and none of its bytes
export const createWhiteboardImageElement = (fileId: string, centre: Point): WhiteboardElement => ({
  fileId,
  height: WHITEBOARD_IMAGE_SIZE.height,
  id: crypto.randomUUID(),
  type: PositionedElementType.Image,
  width: WHITEBOARD_IMAGE_SIZE.width,
  ...getCentredPosition(centre, WHITEBOARD_IMAGE_SIZE),
});
