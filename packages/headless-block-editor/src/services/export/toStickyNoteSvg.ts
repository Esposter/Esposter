import type { StickyNoteElement } from "#src/models/StickyNoteElement";

import { EXPORT_LINE_ATTRIBUTES } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { toClosedSketchedPathData } from "#src/services/export/toClosedSketchedPathData";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { getBoundsCorners } from "#src/services/getBoundsCorners";

// A sticky note as the export draws it: its box sketched and filled with its colour, with its text centred in it
export const toStickyNoteSvg = (stickyNote: StickyNoteElement): string => {
  const { fill, id } = stickyNote;
  return `<path d="${toClosedSketchedPathData(getBoundsCorners(stickyNote), id)}" fill="${escapeSvgValue(fill)}" ${EXPORT_LINE_ATTRIBUTES}/>${toElementTextSvg(stickyNote)}`;
};
