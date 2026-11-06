import type { Bounds } from "#src/models/Bounds";
import type { PositionedDocument } from "#src/models/PositionedDocument";

import { EXPORT_PADDING } from "#src/services/export/constants";
import { getBoundsCorners } from "#src/services/getBoundsCorners";
import { getElementBounds } from "#src/services/getElementBounds";
import { getPointsBounds } from "#src/services/getPointsBounds";

// The box an export draws: every element's bounds joined, and padded on each side. An empty document draws its padding alone
export const getExportBounds = (positionedDocument: PositionedDocument): Bounds => {
  const corners = positionedDocument.elements.flatMap((element) => getBoundsCorners(getElementBounds(element)));
  const { height, width, x, y } = corners.length > 0 ? getPointsBounds(corners) : { height: 0, width: 0, x: 0, y: 0 };
  return {
    height: height + EXPORT_PADDING * 2,
    width: width + EXPORT_PADDING * 2,
    x: x - EXPORT_PADDING,
    y: y - EXPORT_PADDING,
  };
};
