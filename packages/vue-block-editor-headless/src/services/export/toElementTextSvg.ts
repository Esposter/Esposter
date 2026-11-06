import type { PositionedElement } from "#src/models/PositionedElement";

import { getTextPlacement } from "#src/services/export/getTextPlacement";
import { toTextSvg } from "#src/services/export/toTextSvg";
import { getPositionedElementText } from "#src/services/getPositionedElementText";

// An element's text as the export draws it, at the place its text sits. An element that holds no text draws nothing
export const toElementTextSvg = (element: PositionedElement): string => {
  const placement = getTextPlacement(element);
  const text = getPositionedElementText(element);
  return placement && text ? toTextSvg(text, placement) : "";
};
