import type { RectangleSide } from "#src/models/genshinParity/probe/RectangleSide";

import { PROBE_MAX_SAMPLES } from "#src/services/genshinParity/probe/constants";
import { downsampleByMax } from "#src/services/genshinParity/probe/downsampleByMax";
import { findEdgePosition } from "#src/services/genshinParity/probe/findEdgePosition";
import { getInkProfiles } from "#src/services/genshinParity/probe/getInkProfiles";
import { getLineMeans } from "#src/services/genshinParity/probe/getLineMeans";
import { getLuminanceGrid } from "#src/services/genshinParity/probe/getLuminanceGrid";
import { getMeanColour } from "#src/services/genshinParity/probe/getMeanColour";
import { roundHundredths } from "#src/services/genshinParity/shared/roundHundredths";

// A rectangle's read from its RGB pixels, row by row: the mean colour and the ink of each row and column in whole units,
// The ink cut to samples, and the first strong step from each side to two decimals, none for a side with no step
export const computeRectangleSide = (pixels: Uint8Array, width: number, height: number): RectangleSide => {
  const luminance = getLuminanceGrid(pixels, width, height);
  const { columnInk, rowInk } = getInkProfiles(luminance, width, height);
  const { columns, rows } = getLineMeans(luminance, width, height);
  const edges: RectangleSide["edges"] = {};
  for (const [side, profile] of [
    ["top", rows],
    ["bottom", rows.toReversed()],
    ["left", columns],
    ["right", columns.toReversed()],
  ] as const) {
    const position = findEdgePosition(profile);
    if (position !== undefined) edges[side] = roundHundredths(position);
  }
  return {
    columnInk: downsampleByMax(columnInk, PROBE_MAX_SAMPLES).map((ink) => Math.round(ink)),
    edges,
    mean: getMeanColour(pixels, width * height).map((channel) => Math.round(channel)) as RectangleSide["mean"],
    rowInk: downsampleByMax(rowInk, PROBE_MAX_SAMPLES).map((ink) => Math.round(ink)),
  };
};
