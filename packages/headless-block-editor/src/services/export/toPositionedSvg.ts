import type { PositionedDocument } from "#src/models/PositionedDocument";

import { EXPORT_BACKGROUND_COLOR } from "#src/services/export/constants";
import { getExportBounds } from "#src/services/export/getExportBounds";
import { toPositionedElementSvg } from "#src/services/export/toPositionedElementSvg";

// A document as an SVG image of its elements, drawn in z-order over the canvas background and sized to the export's box
export const toPositionedSvg = (
  positionedDocument: PositionedDocument,
  getAssetUrl: (fileId: string) => string,
): string => {
  const { height, width, x, y } = getExportBounds(positionedDocument);
  const elementsSvg = positionedDocument.elements
    .map((element) => toPositionedElementSvg(element, getAssetUrl))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${EXPORT_BACKGROUND_COLOR}"/>${elementsSvg}</svg>`;
};
