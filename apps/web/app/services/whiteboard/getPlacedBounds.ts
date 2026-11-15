import type { WhiteboardPlacement } from "#src/models/whiteboard/WhiteboardPlacement";
import type { Bounds, Point } from "vue-block-editor-headless";

import { getCentredPosition } from "#src/services/whiteboard/getCentredPosition";
import { getWhiteboardItemSize } from "#src/services/whiteboard/palette/getWhiteboardItemSize";

// The box a placement takes at its default size, centred on a point
export const getPlacedBounds = (placement: WhiteboardPlacement, centre: Point): Bounds => {
  const size = getWhiteboardItemSize(placement);
  return { ...getCentredPosition(centre, size), ...size };
};
