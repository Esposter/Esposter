import { HEIGHT_EDGES, TABLE_DEPTH_EDGES } from "#src/services/genshinParity/witness/constants";
import { countPassed } from "#src/services/genshinParity/witness/countPassed";
import { readLuminance } from "#src/services/genshinParity/witness/readLuminance";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each height band's cells by depth: the part pixels' count, and their mean linear luminance in the exports and the
// Reference
export const computeHeightBands = ({
  checkIsPart,
  depth,
  exports,
  height,
  heights,
  reference,
  width,
}: {
  checkIsPart: (pixel: number) => boolean;
  depth: Float32Array;
  exports: Float32Array;
  height: number;
  heights: Float32Array;
  reference: Float32Array;
  width: number;
}): { bottom: number; cells: { count: number; exports: number; reference: number }[] }[] => {
  const heightBands = [-Infinity, ...HEIGHT_EDGES].map((bottom) => ({
    bottom,
    cells: Array.from({ length: TABLE_DEPTH_EDGES.length + 1 }, () => ({ count: 0, exports: 0, reference: 0 })),
  }));
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (!checkIsPart(pixel)) continue;
    const heightBand = heightBands[countPassed(HEIGHT_EDGES, heights[pixel] ?? 0)];
    const cell = heightBand?.cells[countPassed(TABLE_DEPTH_EDGES, depth[pixel * 4] ?? 0)];
    if (!cell) throw new InvalidOperationError(Operation.Read, "height table", `no cell for pixel ${pixel}`);
    cell.count++;
    cell.exports += readLuminance(exports, pixel);
    cell.reference += readLuminance(reference, pixel);
  }
  for (const { cells } of heightBands)
    for (const cell of cells) {
      cell.exports /= Math.max(cell.count, 1);
      cell.reference /= Math.max(cell.count, 1);
    }
  return heightBands;
};
