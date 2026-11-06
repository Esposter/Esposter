import type { PositionedElement } from "#src/models/PositionedElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { toArrowSvg } from "#src/services/export/toArrowSvg";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toImageSvg } from "#src/services/export/toImageSvg";
import { toShapeSvg } from "#src/services/export/toShapeSvg";
import { toStickyNoteSvg } from "#src/services/export/toStickyNoteSvg";
import { toStrokeSvg } from "#src/services/export/toStrokeSvg";
import { exhaustiveGuard } from "@esposter/shared";

// An element as the export draws it, by its type
export const toPositionedElementSvg = (element: PositionedElement, getAssetUrl: (fileId: string) => string): string => {
  switch (element.type) {
    case PositionedElementType.Arrow:
      return toArrowSvg(element);
    case PositionedElementType.Image:
      return toImageSvg(element, getAssetUrl);
    case PositionedElementType.Shape:
      return toShapeSvg(element);
    case PositionedElementType.StickyNote:
      return toStickyNoteSvg(element);
    case PositionedElementType.Stroke:
      return toStrokeSvg(element);
    case PositionedElementType.Text:
      return toElementTextSvg(element);
    default:
      return exhaustiveGuard(element);
  }
};
