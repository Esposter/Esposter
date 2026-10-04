import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCoveredGrid } from "#src/services/genshinAssets/fit/traceCoveredGrid";
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
export const fitCloudSprites = async (
  atlas: Buffer | string,
): Promise<{ aspect: number; sprites: { lit: [number, number][][]; outline: [number, number][][] }[] }> => {
  const { data, info } = await sharp(atlas).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cellWidth = info.width / CLOUD_ATLAS_COLUMNS;
  const cellHeight = info.height / CLOUD_ATLAS_ROWS;
  const width = Math.floor(cellWidth / CLOUD_TRACE_TEXELS);
  const height = Math.floor(cellHeight / CLOUD_TRACE_TEXELS);
  const traceChannel = (column: number, row: number, channel: number, threshold: number): [number, number][][] => {
    const covered = new Uint8Array(width * height);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        // A grid cell is sampled at its middle texel, counted from the cell's foot so y runs up
        const texelX = column * cellWidth + x * CLOUD_TRACE_TEXELS + CLOUD_TRACE_TEXELS / 2;
        const texelY = (row + 1) * cellHeight - (y * CLOUD_TRACE_TEXELS + CLOUD_TRACE_TEXELS / 2);
        const texel = (Math.floor(texelY) * info.width + Math.floor(texelX)) * info.channels;
        const isCloud = (data[texel + 3] ?? 0) / BYTE > CLOUD_COVERAGE_THRESHOLD;
        covered[y * width + x] = isCloud && (data[texel + channel] ?? 0) / BYTE > threshold ? 1 : 0;
      }
    return traceCoveredGrid(covered, { height, tolerance: CLOUD_TRACE_TOLERANCE, width }).map((loop) =>
      loop.map(([x, y]): [number, number] => [roundFitted(x / width), roundFitted(y / height)]),
    );
  };
  const sprites = Array.from({ length: CLOUD_ATLAS_COLUMNS * CLOUD_ATLAS_ROWS }, (_, index) => {
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
