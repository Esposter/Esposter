import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCoveredGrid } from "#src/services/genshinAssets/fit/traceCoveredGrid";

// A rectangle of a decoded texture in texels: its left edge, its foot counted from the texture's top, and its size
export interface TextureCell {
  foot: number;
  height: number;
  left: number;
  width: number;
}

export interface TraceTextureCellOptions {
  cell: TextureCell;
  // Whether the texel at this offset of the raw buffer is painted
  checkPainted: (texel: number) => boolean;
  texels: number;
  tolerance: number;
}

// The loops round a cell's painted grid cells, in the cell's own unit square with y up. A grid cell is sampled at its
// Middle texel, counted from the cell's foot so y runs up
export const traceTextureCell = (
  data: Buffer,
  info: { channels: number; width: number },
  { cell, checkPainted, texels, tolerance }: TraceTextureCellOptions,
): [number, number][][] => {
  const width = Math.floor(cell.width / texels);
  const height = Math.floor(cell.height / texels);
  const covered = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const texelX = cell.left + x * texels + texels / 2;
      const texelY = cell.foot - (y * texels + texels / 2);
      const texel = (Math.floor(texelY) * info.width + Math.floor(texelX)) * info.channels;
      covered[y * width + x] = checkPainted(texel) ? 1 : 0;
    }
  return traceCoveredGrid(covered, { height, tolerance, width }).map((loop) =>
    loop.map(([x, y]): [number, number] => [roundFitted(x / width), roundFitted(y / height)]),
  );
};
