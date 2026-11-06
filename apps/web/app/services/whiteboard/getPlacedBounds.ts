import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";
import type { Bounds, Point } from "headless-block-editor";

import { getCentredPosition } from "@/services/whiteboard/getCentredPosition";
import { getWhiteboardItemSize } from "@/services/whiteboard/palette/getWhiteboardItemSize";

// The box a placement takes at its default size, centred on a point
export const getPlacedBounds = (placement: WhiteboardPlacement, centre: Point): Bounds => {
  const size = getWhiteboardItemSize(placement);
  return { ...getCentredPosition(centre, size), ...size };
};
