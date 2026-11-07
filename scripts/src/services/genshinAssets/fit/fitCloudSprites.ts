import type { CloudAtlas } from "#src/models/genshinAssets/fit/CloudAtlas";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceTextureCell } from "#src/services/genshinAssets/fit/traceTextureCell";
import {
  CLOUD_ATLAS_COLUMNS,
  CLOUD_ATLAS_ROWS,
  CLOUD_COVERAGE_THRESHOLD,
  CLOUD_LIT_THRESHOLD,
  CLOUD_TRACE_TEXELS,
  CLOUD_TRACE_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

// Every painted cloud of an atlas as the shapes it is drawn with: the loops round where it covers and round its lit
// Crown, traced from each cell's alpha and red, in the cell's own unit square with y up, and the cell's width over its
// Height. Only the shapes are kept, never a texel
export const fitCloudSprites = async (atlas: Buffer | string): Promise<CloudAtlas> => {
  const { data, info } = await sharp(atlas).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cellWidth = info.width / CLOUD_ATLAS_COLUMNS;
  const cellHeight = info.height / CLOUD_ATLAS_ROWS;
  const traceChannel = (column: number, row: number, channel: number, threshold: number): [number, number][][] =>
    traceTextureCell(data, info, {
      cell: { foot: (row + 1) * cellHeight, height: cellHeight, left: column * cellWidth, width: cellWidth },
      checkPainted: (texel) =>
        (data[texel + 3] ?? 0) / BYTE > CLOUD_COVERAGE_THRESHOLD && (data[texel + channel] ?? 0) / BYTE > threshold,
      texels: CLOUD_TRACE_TEXELS,
      tolerance: CLOUD_TRACE_TOLERANCE,
    });
  const sprites = Array.from({ length: CLOUD_ATLAS_COLUMNS * CLOUD_ATLAS_ROWS }, (_value, index) => {
    const column = index % CLOUD_ATLAS_COLUMNS;
    const row = Math.floor(index / CLOUD_ATLAS_COLUMNS);
    // The alpha channel's own threshold stands for the outline, which the red then narrows to the crown
    return {
      lit: traceChannel(column, row, 0, CLOUD_LIT_THRESHOLD),
      outline: traceChannel(column, row, 3, CLOUD_COVERAGE_THRESHOLD),
    };
  }).filter(({ outline }) => outline.length > 0);
  return { aspect: roundFitted(cellWidth / cellHeight), sprites };
};
