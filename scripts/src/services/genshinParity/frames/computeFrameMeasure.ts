import type { FrameRow } from "#src/models/genshinParity/frames/FrameRow";
import type { Except } from "type-fest";

import { getInkBox } from "#src/services/genshinParity/frames/getInkBox";
import { getInkGrid } from "#src/services/genshinParity/probe/getInkGrid";
import { getLuminanceGrid } from "#src/services/genshinParity/probe/getLuminanceGrid";
import { getMeanColour } from "#src/services/genshinParity/probe/getMeanColour";

// A rectangle's read in one frame from its RGB pixels, as the probe reads a rectangle: its mean colour in whole units,
// Its Ink summed over every pixel in whole units, and the box that ink fills, absent when no step stands out in it
export const computeFrameMeasure = (
  pixels: Uint8Array,
  width: number,
  height: number,
): Except<FrameRow, "index" | "seconds"> => {
  const inkGrid = getInkGrid(getLuminanceGrid(pixels, width, height));
  const ink = Math.round(inkGrid.reduce((sum, distance) => sum + distance, 0));
  const mean = getMeanColour(pixels, width * height);
  const box = getInkBox(inkGrid, width, height);
  return box === undefined ? { ink, mean } : { box, ink, mean };
};
