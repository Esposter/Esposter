import type { StickyNoteElement } from "#src/models/StickyNoteElement";

import { EXPORT_LINE_COLOR } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toClosedSketchedPathData } from "#src/services/export/toClosedSketchedPathData";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toStrokeAttributesSvg } from "#src/services/export/toStrokeAttributesSvg";
import { getBoundsCorners } from "#src/services/getBoundsCorners";

// A sticky note as the export draws it: its box sketched and filled with its colour, with its text centred in it
export const toStickyNoteSvg = (stickyNote: StickyNoteElement): string => {
  const { fill, id, sketchLevel } = stickyNote;
  const strokeAttributes = toStrokeAttributesSvg(getStrokeAttributes(stickyNote, EXPORT_LINE_COLOR));
  return `<path d="${toClosedSketchedPathData(getBoundsCorners(stickyNote), id, sketchLevel)}" fill="${escapeSvgValue(fill)}" ${strokeAttributes}/>${toElementTextSvg(stickyNote)}`;
};
